import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { createAuthService } from '$lib/server/auth';

const auth = createAuthService(db);

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(303, '/app');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString()?.trim();
		const password = data.get('password')?.toString();
		const confirmPassword = data.get('confirmPassword')?.toString();

		if (!username || !password) {
			return fail(400, { error: 'Username and password required', username });
		}
		if (username.length < 3) {
			return fail(400, { error: 'Username must be at least 3 characters', username });
		}
		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters', username });
		}
		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match', username });
		}

		try {
			auth.register(username, password);
			const session = auth.login(username, password);
			cookies.set('session', session.token, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 30 * 24 * 60 * 60
			});
		} catch (e: any) {
			return fail(400, { error: e.message, username });
		}

		throw redirect(303, '/app');
	}
};
