import type OpenAI from 'openai';
import { tavily } from '@tavily/core';
import { CANNED_MODEL } from '../openrouter';

export interface EnrichmentResult {
	searchResults: string | null;
	imageAnalysis: string | null;
}

async function performWebSearch(queries: string[]): Promise<string | null> {
	const apiKey = process.env.TAVILY_API_KEY;
	if (!apiKey || queries.length === 0) return null;

	const client = tavily({ apiKey });
	const results: string[] = [];

	for (const query of queries.slice(0, 3)) {
		try {
			const response = await client.search(query, {
				maxResults: 5,
				searchDepth: 'basic'
			});
			if (response.results?.length) {
				const formatted = response.results
					.map((r) => `- ${r.title}: ${r.content}`)
					.join('\n');
				results.push(`Search: "${query}"\n${formatted}`);
			}
		} catch {
			// Skip failed searches silently
		}
	}

	return results.length > 0 ? results.join('\n\n') : null;
}

async function analyzeImages(
	client: OpenAI,
	imageBase64s: string[],
	userPrompt: string
): Promise<string | null> {
	if (imageBase64s.length === 0) return null;

	const imageContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = imageBase64s
		.slice(0, 4)
		.map((b64) => ({
			type: 'image_url' as const,
			image_url: {
				url: b64.startsWith('data:') ? b64 : `data:image/jpeg;base64,${b64}`,
				detail: 'high' as const
			}
		}));

	const response = await client.chat.completions.create({
		model: CANNED_MODEL,
		messages: [
			{
				role: 'user',
				content: [
					{
						type: 'text',
						content: `Analyze these product images. The user describes the product as: "${userPrompt}"

Provide a detailed description including:
- Brand name/logo if visible
- Product type and category
- Color(s), material, pattern
- Size indicators or labels
- Condition assessment
- Any tags, labels, or distinguishing features
- Style/aesthetic classification

Be specific and factual. Only describe what you can see.`
					},
					...imageContent
				]
			}
		],
		temperature: 0.2,
		max_tokens: 1000
	});

	return response.choices[0]?.message?.content || null;
}

export async function enrichProduct(
	client: OpenAI,
	options: {
		needsWebSearch: boolean;
		searchQueries: string[];
		imageBase64s: string[];
		userPrompt: string;
	}
): Promise<EnrichmentResult> {
	const [searchResults, imageAnalysis] = await Promise.all([
		options.needsWebSearch
			? performWebSearch(options.searchQueries)
			: Promise.resolve(null),
		analyzeImages(client, options.imageBase64s, options.userPrompt)
	]);

	return { searchResults, imageAnalysis };
}
