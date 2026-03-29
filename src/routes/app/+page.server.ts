import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { v4 as uuid } from 'uuid';

export const load: PageServerLoad = async ({ locals }) => {
	const now = new Date().toISOString();
	const sessionId = uuid();
	db.insert(sessions)
		.values({
			id: sessionId,
			userId: locals.user!.id,
			createdAt: now,
			updatedAt: now
		})
		.run();
	throw redirect(303, `/app/session/${sessionId}`);
};
