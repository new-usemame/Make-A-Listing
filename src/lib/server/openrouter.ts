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
	{ id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', tier: 'budget', vision: true, tools: true },
	{
		id: 'google/gemini-2.5-flash',
		name: 'Gemini 2.5 Flash',
		tier: 'fast',
		vision: true,
		tools: true
	},
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
		id: 'deepseek/deepseek-v3.2',
		name: 'DeepSeek V3.2',
		tier: 'budget',
		vision: false,
		tools: true
	}
] as const;
