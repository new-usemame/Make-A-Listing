import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { platforms } from '$lib/server/db/schema';
import { v4 as uuid } from 'uuid';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Not authenticated');

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON');
	}
	const name = (body.name as string | undefined)?.trim();
	const description = (body.description as string | undefined)?.trim() || null;

	if (!name) throw error(400, 'Platform name is required');
	if (name.length > 100) throw error(400, 'Platform name must be 100 characters or fewer');

	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

	if (!slug) throw error(400, 'Platform name must contain at least one letter or number');

	const id = uuid();
	const now = new Date().toISOString();

	db.insert(platforms)
		.values({ id, userId: locals.user.id, name, slug, description, createdAt: now })
		.run();

	return json({ id, name, slug, description });
};
