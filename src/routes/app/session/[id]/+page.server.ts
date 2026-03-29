import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sessions, messages, listings, platforms, users } from '$lib/server/db/schema';
import { eq, or, isNull } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = db.select().from(sessions).where(eq(sessions.id, params.id)).get();
	if (!session || session.userId !== locals.user!.id) throw error(404, 'Session not found');

	const user = db.select().from(users).where(eq(users.id, locals.user!.id)).get()!;

	const sessionMessages = db
		.select()
		.from(messages)
		.where(eq(messages.sessionId, params.id))
		.orderBy(messages.createdAt)
		.all();

	const sessionListings = db
		.select()
		.from(listings)
		.where(eq(listings.sessionId, params.id))
		.all();

	const userPlatforms = db
		.select()
		.from(platforms)
		.where(or(isNull(platforms.userId), eq(platforms.userId, locals.user!.id)))
		.all();

	return {
		session: { id: session.id, title: session.title },
		messages: sessionMessages.map((m) => ({
			id: m.id,
			role: m.role,
			content: m.content,
			images: m.images ? JSON.parse(m.images) : [],
			pdfText: m.pdfText,
			createdAt: m.createdAt,
			listings: sessionListings
				.filter((l) => l.messageId === m.id)
				.map((l) => ({
					id: l.id,
					platformId: l.platformId,
					markdownContent: l.markdownContent,
					modelUsed: l.modelUsed
				}))
		})),
		platforms: userPlatforms.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
		hasApiKey: !!user.openrouterApiKey,
		hasSystemPrompt: !!user.systemPrompt,
		preferredModel: user.preferredModel
	};
};
