import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { apiKey } = await request.json();
	if (!apiKey || typeof apiKey !== 'string') {
		return json({ valid: false, error: 'Missing API key' }, { status: 400 });
	}

	try {
		const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
			headers: { Authorization: `Bearer ${apiKey}` }
		});

		const data = await res.json();
		return json({ valid: res.ok, data });
	} catch (err) {
		return json({ valid: false, error: 'Failed to reach OpenRouter' }, { status: 502 });
	}
};
