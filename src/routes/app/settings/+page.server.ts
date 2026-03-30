import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users, platforms } from '$lib/server/db/schema';
import { encrypt, decrypt, maskApiKey } from '$lib/server/crypto';
import { eq, and, or, isNull } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { CURATED_MODELS } from '$lib/server/openrouter';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;

	const user = db.select().from(users).where(eq(users.id, userId)).get()!;

	let maskedApiKey: string | null = null;
	let hasApiKey = false;
	if (user.openrouterApiKey) {
		try {
			const raw = decrypt(user.openrouterApiKey);
			maskedApiKey = maskApiKey(raw);
			hasApiKey = true;
		} catch {
			// corrupted key — treat as unset
		}
	}

	const userPlatforms = db
		.select()
		.from(platforms)
		.where(or(isNull(platforms.userId), eq(platforms.userId, userId)))
		.all()
		.map((p) => ({
			...p,
			isDefault: p.userId === null
		}));

	return {
		maskedApiKey,
		hasApiKey,
		preferredModel: user.preferredModel,
		systemPrompt: user.systemPrompt,
		platforms: userPlatforms,
		models: CURATED_MODELS
	};
};

export const actions: Actions = {
	updateApiKey: async ({ request, locals }) => {
		const data = await request.formData();
		const apiKey = data.get('apiKey')?.toString()?.trim();
		if (!apiKey) return fail(400, { error: 'API key is required', action: 'updateApiKey' as const });

		const encrypted = encrypt(apiKey);
		const now = new Date().toISOString();
		db.update(users)
			.set({ openrouterApiKey: encrypted, updatedAt: now })
			.where(eq(users.id, locals.user!.id))
			.run();

		return { success: true, action: 'updateApiKey' };
	},

	updateModel: async ({ request, locals }) => {
		const data = await request.formData();
		const model = data.get('model')?.toString();
		if (!model || !CURATED_MODELS.some((m) => m.id === model)) {
			return fail(400, { error: 'Invalid model', action: 'updateModel' as const });
		}

		const now = new Date().toISOString();
		db.update(users)
			.set({ preferredModel: model, updatedAt: now })
			.where(eq(users.id, locals.user!.id))
			.run();

		return { success: true, action: 'updateModel' };
	},

	updateSystemPrompt: async ({ request, locals }) => {
		const data = await request.formData();
		const prompt = data.get('systemPrompt')?.toString()?.trim() || null;

		const now = new Date().toISOString();
		db.update(users)
			.set({ systemPrompt: prompt, updatedAt: now })
			.where(eq(users.id, locals.user!.id))
			.run();

		return { success: true, action: 'updateSystemPrompt' };
	},

	addPlatform: async ({ request, locals }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString()?.trim();
		const description = data.get('description')?.toString()?.trim() || null;
		if (!name) return fail(400, { error: 'Platform name is required', action: 'addPlatform' as const });

		const slug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

		const now = new Date().toISOString();
		db.insert(platforms)
			.values({
				id: uuid(),
				userId: locals.user!.id,
				name,
				slug,
				description,
				createdAt: now
			})
			.run();

		return { success: true, action: 'addPlatform' };
	},

	removePlatform: async ({ request, locals }) => {
		const data = await request.formData();
		const platformId = data.get('platformId')?.toString();
		if (!platformId) return fail(400, { error: 'Platform ID is required', action: 'removePlatform' as const });

		// Only allow removing user-created platforms
		const platform = db
			.select()
			.from(platforms)
			.where(
				and(
					eq(platforms.id, platformId),
					eq(platforms.userId, locals.user!.id)
				)
			)
			.get();

		if (!platform) return fail(403, { error: 'Cannot remove this platform', action: 'removePlatform' as const });

		db.delete(platforms).where(eq(platforms.id, platformId)).run();

		return { success: true, action: 'removePlatform' };
	},

	logout: async ({ cookies }) => {
		cookies.delete('session', { path: '/' });
		throw redirect(303, '/auth/login');
	}
};
