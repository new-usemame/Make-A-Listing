import { db } from './index';
import { platforms } from './schema';
import { v4 as uuid } from 'uuid';
import { isNull } from 'drizzle-orm';

const DEFAULT_PLATFORMS = [
	{
		name: 'eBay',
		slug: 'ebay',
		description:
			'eBay marketplace — 80 char title limit, bullet point descriptions, item specifics'
	},
	{
		name: 'Poshmark',
		slug: 'poshmark',
		description:
			'Poshmark — stylish 20-word title, style tags, 850 char listing limit'
	},
	{
		name: 'Depop',
		slug: 'depop',
		description: 'Depop — trendy descriptions, 5 hashtags, Gen-Z aesthetic'
	},
	{
		name: 'Mercari',
		slug: 'mercari',
		description:
			'Mercari — concise descriptions, keyword-rich titles, condition details'
	}
];

export function seedDefaults() {
	const existing = db.select().from(platforms).where(isNull(platforms.userId)).all();
	if (existing.length > 0) return;

	const now = new Date().toISOString();
	for (const p of DEFAULT_PLATFORMS) {
		db.insert(platforms)
			.values({
				id: uuid(),
				name: p.name,
				slug: p.slug,
				description: p.description,
				createdAt: now
			})
			.run();
	}
}
