import type OpenAI from 'openai';
import { tavily } from '@tavily/core';
import type { ClassificationResult } from './classify';
import type { EnrichmentResult } from './enrich';

export interface GenerationContext {
	client: OpenAI;
	model: string;
	platformPrompt: string;
	userSystemPrompt?: string | null;
	pdfText?: string | null;
	enrichment?: EnrichmentResult | null;
	classification?: ClassificationResult | null;
	history: Array<{ role: 'user' | 'assistant'; content: string }>;
	userMessage: string;
	imageBase64s?: string[];
}

const WEB_SEARCH_TOOL: OpenAI.Chat.Completions.ChatCompletionTool = {
	type: 'function' as const,
	function: {
		name: 'web_search',
		description:
			'Search the web for product pricing, recent sales data, or product information',
		parameters: {
			type: 'object',
			properties: {
				query: { type: 'string', description: 'Search query' }
			},
			required: ['query']
		}
	}
};

function buildSystemMessage(ctx: GenerationContext): string {
	const parts: string[] = [ctx.platformPrompt];

	if (ctx.userSystemPrompt) {
		parts.push(`\nAdditional instructions from user:\n${ctx.userSystemPrompt}`);
	}

	if (ctx.pdfText) {
		parts.push(
			`\nReference document content:\n${ctx.pdfText.slice(0, 8000)}`
		);
	}

	if (ctx.enrichment?.searchResults) {
		parts.push(
			`\nWeb search results for pricing/market context:\n${ctx.enrichment.searchResults}`
		);
	}

	if (ctx.enrichment?.imageAnalysis) {
		parts.push(
			`\nImage analysis results:\n${ctx.enrichment.imageAnalysis}`
		);
	}

	if (ctx.classification) {
		const c = ctx.classification;
		const attrs = Object.entries(c.detected_attributes)
			.map(([k, v]) => `${k}: ${v}`)
			.join(', ');
		parts.push(
			`\nProduct classification: category=${c.product_category}, brand=${c.detected_brand || 'unknown'}${attrs ? `, ${attrs}` : ''}`
		);
	}

	return parts.join('\n');
}

function buildMessages(
	ctx: GenerationContext
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
	const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
		{ role: 'system', content: buildSystemMessage(ctx) }
	];

	// Add conversation history
	for (const msg of ctx.history) {
		messages.push({ role: msg.role, content: msg.content });
	}

	// Build user message with optional images
	if (ctx.imageBase64s?.length) {
		const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
			{ type: 'text', content: ctx.userMessage }
		];
		for (const b64 of ctx.imageBase64s.slice(0, 4)) {
			content.push({
				type: 'image_url',
				image_url: {
					url: b64.startsWith('data:')
						? b64
						: `data:image/jpeg;base64,${b64}`,
					detail: 'high'
				}
			});
		}
		messages.push({ role: 'user', content });
	} else {
		messages.push({ role: 'user', content: ctx.userMessage });
	}

	return messages;
}

async function executeWebSearch(query: string): Promise<string> {
	const apiKey = process.env.TAVILY_API_KEY;
	if (!apiKey) {
		return `Web search unavailable: no TAVILY_API_KEY configured.`;
	}

	try {
		const client = tavily({ apiKey });
		const response = await client.search(query, {
			maxResults: 5,
			searchDepth: 'basic'
		});
		if (response.results?.length) {
			return response.results
				.map((r) => `- ${r.title}: ${r.content}`)
				.join('\n');
		}
		return 'No results found.';
	} catch (err) {
		return `Search failed: ${err instanceof Error ? err.message : 'unknown error'}`;
	}
}

export async function* generateListing(
	ctx: GenerationContext
): AsyncGenerator<string> {
	const messages = buildMessages(ctx);
	const hasTavilyKey = !!process.env.TAVILY_API_KEY;

	// Tool call loop: model may call web_search, we execute it, feed result back, and continue
	let currentMessages = [...messages];
	let maxToolRounds = 5;

	while (maxToolRounds > 0) {
		const stream = await ctx.client.chat.completions.create({
			model: ctx.model,
			messages: currentMessages,
			temperature: 0.7,
			stream: true,
			...(hasTavilyKey ? { tools: [WEB_SEARCH_TOOL] } : {})
		});

		let accumulatedContent = '';
		let toolCalls: Array<{
			id: string;
			function: { name: string; arguments: string };
		}> = [];
		let finishReason: string | null = null;

		for await (const chunk of stream) {
			const delta = chunk.choices[0]?.delta;
			finishReason = chunk.choices[0]?.finish_reason ?? finishReason;

			// Stream text content tokens
			if (delta?.content) {
				accumulatedContent += delta.content;
				yield delta.content;
			}

			// Accumulate tool calls
			if (delta?.tool_calls) {
				for (const tc of delta.tool_calls) {
					if (tc.index !== undefined) {
						while (toolCalls.length <= tc.index) {
							toolCalls.push({
								id: '',
								function: { name: '', arguments: '' }
							});
						}
						if (tc.id) toolCalls[tc.index].id = tc.id;
						if (tc.function?.name)
							toolCalls[tc.index].function.name += tc.function.name;
						if (tc.function?.arguments)
							toolCalls[tc.index].function.arguments +=
								tc.function.arguments;
					}
				}
			}
		}

		// If no tool calls, we're done
		if (
			finishReason !== 'tool_calls' ||
			toolCalls.length === 0 ||
			!toolCalls.some((tc) => tc.function.name === 'web_search')
		) {
			break;
		}

		// Process tool calls: add assistant message with tool calls, then tool results
		const assistantMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam =
			{
				role: 'assistant',
				content: accumulatedContent || null,
				tool_calls: toolCalls.map((tc) => ({
					id: tc.id,
					type: 'function' as const,
					function: {
						name: tc.function.name,
						arguments: tc.function.arguments
					}
				}))
			};
		currentMessages.push(assistantMessage);

		// Execute each tool call and add results
		for (const tc of toolCalls) {
			let result: string;
			if (tc.function.name === 'web_search') {
				try {
					const args = JSON.parse(tc.function.arguments);
					result = await executeWebSearch(args.query || '');
				} catch {
					result = 'Failed to parse tool call arguments.';
				}
			} else {
				result = `Unknown tool: ${tc.function.name}`;
			}

			currentMessages.push({
				role: 'tool',
				tool_call_id: tc.id,
				content: result
			} as OpenAI.Chat.Completions.ChatCompletionMessageParam);
		}

		maxToolRounds--;
	}
}
