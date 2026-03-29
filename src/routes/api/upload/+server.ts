import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveImage } from '$lib/server/files';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const formData = await request.formData();
	const sessionId = formData.get('sessionId');

	if (!sessionId || typeof sessionId !== 'string') {
		return json({ error: 'Missing sessionId' }, { status: 400 });
	}

	const images = formData.getAll('images') as File[];

	if (!images.length) {
		return json({ error: 'No images provided' }, { status: 400 });
	}

	const paths: string[] = [];
	const errors: string[] = [];

	for (const file of images) {
		if (file.size > MAX_FILE_SIZE) {
			errors.push(`${file.name} exceeds 20MB limit`);
			continue;
		}

		if (!file.type.startsWith('image/')) {
			errors.push(`${file.name} is not an image`);
			continue;
		}

		try {
			const path = await saveImage(file, locals.user.id, sessionId);
			paths.push(path);
		} catch (err) {
			errors.push(`Failed to process ${file.name}`);
		}
	}

	return json({ paths, errors });
};
