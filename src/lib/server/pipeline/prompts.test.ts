import { describe, it, expect } from 'vitest';
import {
	getPlatformPrompt,
	PLATFORM_PROMPTS,
	CLASSIFICATION_PROMPT,
	TITLE_GENERATION_PROMPT
} from './prompts';

describe('prompts', () => {
	it('returns ebay prompt for ebay slug', () => {
		const prompt = getPlatformPrompt('ebay');
		expect(prompt).toBe(PLATFORM_PROMPTS['ebay']);
		expect(prompt).toContain('eBay');
	});

	it('returns poshmark prompt for poshmark slug', () => {
		const prompt = getPlatformPrompt('poshmark');
		expect(prompt).toContain('Poshmark');
	});

	it('returns depop prompt for depop slug', () => {
		const prompt = getPlatformPrompt('depop');
		expect(prompt).toContain('Depop');
	});

	it('returns mercari prompt for mercari slug', () => {
		const prompt = getPlatformPrompt('mercari');
		expect(prompt).toContain('Mercari');
	});

	it('falls back to description when slug is unknown', () => {
		const prompt = getPlatformPrompt('unknown-platform', 'Custom description');
		expect(prompt).toBe('Custom description');
	});

	it('falls back to generic prompt when slug unknown and no description', () => {
		const prompt = getPlatformPrompt('unknown-platform');
		expect(prompt).toContain('expert listing writer');
	});

	it('falls back to generic prompt when description is null', () => {
		const prompt = getPlatformPrompt('unknown-platform', null);
		expect(prompt).toContain('expert listing writer');
	});

	it('CLASSIFICATION_PROMPT is defined and mentions JSON', () => {
		expect(CLASSIFICATION_PROMPT).toContain('JSON');
		expect(CLASSIFICATION_PROMPT).toContain('needs_web_search');
	});

	it('TITLE_GENERATION_PROMPT is defined', () => {
		expect(TITLE_GENERATION_PROMPT).toContain('session title');
	});
});
