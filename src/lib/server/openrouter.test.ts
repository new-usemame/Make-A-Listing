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
