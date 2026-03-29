import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data', 'uploads');

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const filePath = params.path;

	if (!filePath || !filePath.startsWith(locals.user.id)) {
		throw error(403, 'Forbidden');
	}

	const fullPath = join(DATA_DIR, filePath);

	// Prevent directory traversal
	if (!fullPath.startsWith(DATA_DIR)) {
		throw error(403, 'Forbidden');
	}

	if (!existsSync(fullPath)) {
		throw error(404, 'Not found');
	}

	const buffer = readFileSync(fullPath);

	return new Response(buffer, {
		headers: {
			'Content-Type': 'image/jpeg',
			'Cache-Control': 'private, max-age=86400'
		}
	});
};
