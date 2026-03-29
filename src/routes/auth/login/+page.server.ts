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

		if (!username || !password) {
			return fail(400, { error: 'Username and password required', username });
		}

		try {
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
