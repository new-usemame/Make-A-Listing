import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions, messages, listings, platforms } from '$lib/server/db/schema';
import { eq, desc, sql, like, inArray, and, or } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
	const userId = locals.user!.id;
	const q = url.searchParams.get('q')?.trim() || '';

	// Get all user sessions with message counts
	const userSessions = db
		.select({
			id: sessions.id,
			title: sessions.title,
			createdAt: sessions.createdAt,
			updatedAt: sessions.updatedAt,
			messageCount: sql<number>`(SELECT COUNT(*) FROM messages WHERE messages.session_id = ${sessions.id})`.as('message_count')
		})
		.from(sessions)
		.where(eq(sessions.userId, userId))
		.orderBy(desc(sessions.updatedAt))
		.all();

	// Filter out empty sessions
	let filtered = userSessions.filter((s) => s.messageCount > 0);

	// Search filter
	if (q) {
		const sessionIdsWithMatchingMessages = db
			.select({ sessionId: messages.sessionId })
			.from(messages)
			.where(like(messages.content, `%${q}%`))
			.all()
			.map((r) => r.sessionId);

		const matchingIds = new Set(sessionIdsWithMatchingMessages);

		filtered = filtered.filter(
			(s) =>
				(s.title && s.title.toLowerCase().includes(q.toLowerCase())) ||
				matchingIds.has(s.id)
		);
	}

	// Enrich with platform names used in each session
	const enriched = filtered.map((s) => {
		const platformNames = db
			.selectDistinct({ name: platforms.name })
			.from(listings)
			.innerJoin(platforms, eq(listings.platformId, platforms.id))
			.where(eq(listings.sessionId, s.id))
			.all()
			.map((p) => p.name);

		return {
			id: s.id,
			title: s.title || 'Untitled Session',
			createdAt: s.createdAt,
			updatedAt: s.updatedAt,
			messageCount: s.messageCount,
			platforms: platformNames
		};
	});

	return { sessions: enriched, query: q };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const sessionId = data.get('sessionId')?.toString();
		if (!sessionId) return fail(400, { error: 'Session ID is required' });

		const session = db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
		if (!session || session.userId !== locals.user!.id) {
			return fail(403, { error: 'Not authorized' });
		}

		db.delete(sessions).where(eq(sessions.id, sessionId)).run();
		return { success: true };
	},

	bulkDelete: async ({ request, locals }) => {
		const data = await request.formData();
		const ids = data.getAll('sessionIds').map((id) => id.toString());
		if (!ids.length) return fail(400, { error: 'No sessions selected' });

		// Verify ownership for each
		const ownedSessions = db
			.select({ id: sessions.id })
			.from(sessions)
			.where(and(inArray(sessions.id, ids), eq(sessions.userId, locals.user!.id)))
			.all();

		const ownedIds = ownedSessions.map((s) => s.id);
		if (!ownedIds.length) return fail(403, { error: 'Not authorized' });

		db.delete(sessions).where(inArray(sessions.id, ownedIds)).run();
		return { success: true, deleted: ownedIds.length };
	}
};
