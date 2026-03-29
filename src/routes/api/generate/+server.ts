import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users, sessions, messages, listings, platforms } from '$lib/server/db/schema';
import { eq, or, isNull } from 'drizzle-orm';
import { decrypt } from '$lib/server/crypto';
import { buildOpenRouterClient } from '$lib/server/openrouter';
import { classifyProduct } from '$lib/server/pipeline/classify';
import { enrichProduct } from '$lib/server/pipeline/enrich';
import { generateListing } from '$lib/server/pipeline/generate';
import { generateSessionTitle } from '$lib/server/pipeline/title';
import { saveImage, imageToBase64, extractPdfText } from '$lib/server/files';
import { v4 as uuid } from 'uuid';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');

	const user = db.select().from(users).where(eq(users.id, locals.user.id)).get()!;
	if (!user.openrouterApiKey) throw error(400, JSON.stringify({ error: 'No API key configured' }));

	const apiKey = decrypt(user.openrouterApiKey);
	const client = buildOpenRouterClient(apiKey);

	const formData = await request.formData();
	const prompt = formData.get('prompt')?.toString()?.trim();
	const sessionId = formData.get('sessionId')?.toString();
	const selectedPlatformIds: string[] = JSON.parse(formData.get('platforms')?.toString() || '[]');
	const imageFiles = formData.getAll('images') as File[];
	const pdfFile = formData.get('pdf') as File | null;

	if (!prompt || !sessionId || selectedPlatformIds.length === 0) {
		throw error(400, JSON.stringify({ error: 'Missing required fields' }));
	}

	// Verify session belongs to user
	const session = db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
	if (!session || session.userId !== locals.user.id) throw error(404, 'Session not found');

	// Save images
	const imagePaths: string[] = [];
	for (const img of imageFiles) {
		const path = await saveImage(img, locals.user.id, sessionId);
		imagePaths.push(path);
	}

	// Extract PDF text
	let pdfText: string | null = null;
	if (pdfFile && pdfFile.size > 0) {
		pdfText = await extractPdfText(pdfFile);
	}

	// Save user message
	const messageId = uuid();
	db.insert(messages)
		.values({
			id: messageId,
			sessionId,
			role: 'user',
			content: prompt,
			images: imagePaths.length ? JSON.stringify(imagePaths) : null,
			pdfText,
			createdAt: new Date().toISOString()
		})
		.run();

	// Load image base64s for vision models
	const imageBase64s: string[] = [];
	for (const path of imagePaths) {
		imageBase64s.push(await imageToBase64(path));
	}

	// Get selected platforms
	const allPlatforms = db
		.select()
		.from(platforms)
		.where(or(isNull(platforms.userId), eq(platforms.userId, locals.user.id)))
		.all();
	const selectedPlatforms = allPlatforms.filter((p) => selectedPlatformIds.includes(p.id));

	// Get conversation history (last 10 messages excluding the one we just saved)
	const history = db
		.select()
		.from(messages)
		.where(eq(messages.sessionId, sessionId))
		.orderBy(messages.createdAt)
		.all()
		.filter((m) => m.id !== messageId)
		.slice(-10);

	// Create SSE stream
	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();
			const send = (data: object) => {
				controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
			};

			try {
				// Step 1: Classification
				send({ type: 'status', message: 'Classifying product...' });
				const classification = await classifyProduct(
					client,
					prompt,
					imageBase64s.length > 0 ? ['[Images attached]'] : undefined
				);

				// Step 2: Enrichment (web search + image analysis in parallel)
				send({ type: 'status', message: 'Enriching product data...' });
				const enrichment = await enrichProduct(client, {
					needsWebSearch: classification.needs_web_search,
					searchQueries: classification.search_queries,
					imageBase64s,
					userPrompt: prompt
				});

				// Step 3: Generate per platform (parallel)
				send({ type: 'status', message: 'Generating listings...' });
				const generationPromises = selectedPlatforms.map(async (platform) => {
					let fullContent = '';
					try {
						const generator = generateListing({
							client,
							model: user.preferredModel,
							platformPrompt: platform.description || `Generate a listing for ${platform.name}.`,
							userSystemPrompt: user.systemPrompt,
							pdfText,
							enrichment,
							classification,
							history: history.map((m) => ({
								role: m.role as 'user' | 'assistant',
								content: m.content
							})),
							userMessage: prompt,
							imageBase64s
						});

						for await (const token of generator) {
							fullContent += token;
							send({ type: 'token', platformId: platform.id, content: token });
						}
					} catch (err: unknown) {
						const message =
							err instanceof Error ? err.message : 'Generation failed';
						send({ type: 'error', platformId: platform.id, error: message });
						fullContent = `Error: ${message}`;
					}

					// Save listing to DB
					db.insert(listings)
						.values({
							id: uuid(),
							messageId,
							sessionId,
							platformId: platform.id,
							markdownContent: fullContent,
							modelUsed: user.preferredModel,
							createdAt: new Date().toISOString()
						})
						.run();
				});

				await Promise.all(generationPromises);

				// Step 4: Generate session title if first message
				if (!session.title) {
					try {
						const title = await generateSessionTitle(client, prompt);
						db.update(sessions)
							.set({ title, updatedAt: new Date().toISOString() })
							.where(eq(sessions.id, sessionId))
							.run();
						send({ type: 'title', title });
					} catch {
						// Title generation is non-critical
					}
				}

				db.update(sessions)
					.set({ updatedAt: new Date().toISOString() })
					.where(eq(sessions.id, sessionId))
					.run();

				send({ type: 'done' });
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : 'Pipeline failed';
				send({ type: 'error', error: message });
			} finally {
				controller.enqueue(encoder.encode('data: [DONE]\n\n'));
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
