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
		expect(CURATED_MODELS.length).toBe(11);
		const ids = CURATED_MODELS.map((m) => m.id);
		expect(ids).toContain('openai/gpt-4o-mini');
		expect(ids).toContain('openai/gpt-4.1');
		expect(ids).toContain('openai/gpt-4.1-mini');
		expect(ids).toContain('openai/gpt-5');
		expect(ids).toContain('openai/gpt-5-mini');
		expect(ids).toContain('anthropic/claude-sonnet-4.5');
		expect(ids).toContain('anthropic/claude-4.6-sonnet');
		expect(ids).toContain('deepseek/deepseek-r1');
		expect(ids).toContain('moonshotai/kimi-k2.5');
	});
});

const apiKey = process.env.OPENROUTER_API_KEY;

describe.skipIf(!apiKey)('OpenRouter model validation (live API)', () => {
	// Small 1x1 red PNG as base64 for vision tests
	const TINY_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

	function makeClient() {
		return buildOpenRouterClient(apiKey!);
	}

	// Reasoning models (GPT-5, DeepSeek R1, etc.) may return content in a
	// `reasoning` or `reasoning_details` field with `content: null`.
	// We check the raw response to handle both cases.
	function hasResponse(res: unknown): boolean {
		const r = res as {
			choices: Array<{
				message: {
					content?: string | null;
					reasoning?: string | null;
					reasoning_details?: unknown[];
				};
			}>;
		};
		const msg = r.choices[0]?.message;
		return !!(msg?.content || msg?.reasoning || (msg?.reasoning_details && msg.reasoning_details.length > 0));
	}

	// Reasoning models need more tokens because they reason before responding
	const REASONING_MODELS = new Set(['openai/gpt-5', 'openai/gpt-5-mini', 'deepseek/deepseek-r1']);

	for (const model of CURATED_MODELS) {
		const maxTokens = REASONING_MODELS.has(model.id) ? 1000 : 100;

		describe(model.name, () => {
			it('handles text completion', async () => {
				const client = makeClient();
				const res = await client.chat.completions.create({
					model: model.id,
					messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
					max_tokens: maxTokens
				});
				expect(hasResponse(res)).toBe(true);
			}, 60_000);

			it.skipIf(!model.vision)('handles vision (image input)', async () => {
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
					max_tokens: maxTokens
				});
				expect(hasResponse(res)).toBe(true);
			}, 60_000);
		});
	}
});
