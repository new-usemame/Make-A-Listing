import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { platforms } from '$lib/server/db/schema';
import { v4 as uuid } from 'uuid';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Not authenticated');

	const body = await request.json();
	const name = body.name?.trim();
	const description = body.description?.trim() || null;

	if (!name) throw error(400, 'Platform name is required');

	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

	const id = uuid();
	const now = new Date().toISOString();

	db.insert(platforms)
		.values({ id, userId: locals.user.id, name, slug, description, createdAt: now })
		.run();

	return json({ id, name, slug, description });
};
