import OpenAI from 'openai';

export const CANNED_MODEL = 'openai/gpt-4o-mini';

export function buildOpenRouterClient(apiKey: string): OpenAI {
	return new OpenAI({
		baseURL: 'https://openrouter.ai/api/v1',
		apiKey,
		defaultHeaders: {
			'HTTP-Referer': 'https://makealisting.com',
			'X-Title': 'Make a Listing'
		}
	});
}

export const CURATED_MODELS = [
	{
		id: 'anthropic/claude-sonnet-4.5',
		name: 'Claude Sonnet 4.5',
		tier: 'quality',
		vision: true,
		tools: true
	},
	{
		id: 'anthropic/claude-4.6-sonnet',
		name: 'Claude 4.6 Sonnet',
		tier: 'quality',
		vision: true,
		tools: true
	},
	{
		id: 'anthropic/claude-4.6-opus',
		name: 'Claude 4.6 Opus',
		tier: 'best',
		vision: true,
		tools: true
	},
	{
		id: 'openai/gpt-5',
		name: 'GPT-5',
		tier: 'best',
		vision: true,
		tools: true
	},
	{
		id: 'openai/gpt-5-mini',
		name: 'GPT-5 Mini',
		tier: 'quality',
		vision: true,
		tools: true
	},
	{
		id: 'openai/gpt-4.1',
		name: 'GPT-4.1',
		tier: 'quality',
		vision: true,
		tools: true
	},
	{
		id: 'openai/gpt-4.1-mini',
		name: 'GPT-4.1 Mini',
		tier: 'fast',
		vision: true,
		tools: true
	},
	{ id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', tier: 'budget', vision: true, tools: true },
	{
		id: 'deepseek/deepseek-r1',
		name: 'DeepSeek R1',
		tier: 'quality',
		vision: false,
		tools: true
	},
	{
		id: 'moonshotai/kimi-k2.5',
		name: 'Kimi K2.5',
		tier: 'quality',
		vision: true,
		tools: true
	},
	{
		id: 'google/gemini-2.5-flash',
		name: 'Gemini 2.5 Flash',
		tier: 'fast',
		vision: true,
		tools: true
	}
] as const;
