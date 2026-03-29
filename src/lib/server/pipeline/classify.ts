import type OpenAI from 'openai';
import { CANNED_MODEL } from '../openrouter';
import { CLASSIFICATION_PROMPT } from './prompts';

export interface ClassificationResult {
	needs_web_search: boolean;
	search_queries: string[];
	product_category: string;
	detected_brand: string | null;
	detected_attributes: Record<string, string>;
}

const DEFAULT_RESULT: ClassificationResult = {
	needs_web_search: false,
	search_queries: [],
	product_category: 'general',
	detected_brand: null,
	detected_attributes: {}
};

export async function classifyProduct(
	client: OpenAI,
	userPrompt: string,
	imageDescriptions?: string[]
): Promise<ClassificationResult> {
	const content = imageDescriptions?.length
		? `${userPrompt}\n\nImage descriptions:\n${imageDescriptions.join('\n')}`
		: userPrompt;

	const response = await client.chat.completions.create({
		model: CANNED_MODEL,
		messages: [
			{ role: 'system', content: CLASSIFICATION_PROMPT },
			{ role: 'user', content }
		],
		temperature: 0.1,
		response_format: { type: 'json_object' }
	});

	const text = response.choices[0]?.message?.content || '{}';
	try {
		const parsed = JSON.parse(text);
		return {
			needs_web_search: parsed.needs_web_search ?? false,
			search_queries: parsed.search_queries ?? [],
			product_category: parsed.product_category ?? 'general',
			detected_brand: parsed.detected_brand ?? null,
			detected_attributes: parsed.detected_attributes ?? {}
		};
	} catch {
		return { ...DEFAULT_RESULT };
	}
}
