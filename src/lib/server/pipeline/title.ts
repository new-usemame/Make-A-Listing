import type OpenAI from 'openai';
import { CANNED_MODEL } from '../openrouter';
import { TITLE_GENERATION_PROMPT } from './prompts';

export async function generateSessionTitle(
	client: OpenAI,
	userPrompt: string
): Promise<string> {
	const truncated = userPrompt.slice(0, 200);

	try {
		const response = await client.chat.completions.create({
			model: CANNED_MODEL,
			messages: [
				{ role: 'system', content: TITLE_GENERATION_PROMPT },
				{ role: 'user', content: truncated }
			],
			temperature: 0.5,
			max_tokens: 30
		});

		const title = response.choices[0]?.message?.content?.trim();
		if (title && title.length > 0) {
			// Strip any surrounding quotes the model might add
			return title.replace(/^["']|["']$/g, '');
		}
		return 'New Listing Session';
	} catch {
		return 'New Listing Session';
	}
}
