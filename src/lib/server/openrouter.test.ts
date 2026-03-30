import { describe, it, expect } from 'vitest';
import { CANNED_MODEL, buildOpenRouterClient, CURATED_MODELS } from './openrouter';

describe('openrouter', () => {
	it('CANNED_MODEL is gpt-4o-mini', () => {
		expect(CANNED_MODEL).toBe('openai/gpt-4o-mini');
	});

	it('buildOpenRouterClient returns client with openrouter.ai baseURL', () => {
		const client = buildOpenRouterClient('test-key');
		expect(client).toBeDefined();
		expect(client.baseURL).toContain('openrouter.ai');
	});

	it('CURATED_MODELS contains expected entries', () => {
		expect(CURATED_MODELS.length).toBe(7);
		const ids = CURATED_MODELS.map((m) => m.id);
		expect(ids).toContain('openai/gpt-4o-mini');
		expect(ids).toContain('anthropic/claude-sonnet-4.5');
		expect(ids).toContain('anthropic/claude-4.6-sonnet');
	});
});

const apiKey = process.env.OPENROUTER_API_KEY;

describe.skipIf(!apiKey)('OpenRouter model validation (live API)', () => {
	// Small 1x1 red PNG as base64 for vision tests
	const TINY_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

	function makeClient() {
		return buildOpenRouterClient(apiKey!);
	}

	for (const model of CURATED_MODELS) {
		describe(model.name, () => {
			it('handles text completion', async () => {
				const client = makeClient();
				const res = await client.chat.completions.create({
					model: model.id,
					messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
					max_tokens: 10
				});
				expect(res.choices[0]?.message?.content).toBeTruthy();
			}, 30_000);

			it('handles vision (image input)', async () => {
				const client = makeClient();
				const res = await client.chat.completions.create({
					model: model.id,
					messages: [
						{
							role: 'user',
							content: [
								{ type: 'text', text: 'What color is this pixel? Reply with one word.' },
								{
									type: 'image_url',
									image_url: { url: `data:image/png;base64,${TINY_PNG_BASE64}` }
								}
							]
						}
					],
					max_tokens: 10
				});
				expect(res.choices[0]?.message?.content).toBeTruthy();
			}, 30_000);
		});
	}
});
