import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { createAuthService } from '$lib/server/auth';
import { seedDefaults } from '$lib/server/db/seed';

const auth = createAuthService(db);

// Run seed on startup
seedDefaults();

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('session');

	if (sessionToken) {
		event.locals.user = auth.validateSession(sessionToken);
	} else {
		event.locals.user = null;
	}

	// Protect /app/* routes
	if (event.url.pathname.startsWith('/app') && !event.locals.user) {
		throw redirect(303, '/auth/login');
	}

	return resolve(event);
};
