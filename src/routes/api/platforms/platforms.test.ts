import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';
import * as schema from '$lib/server/db/schema';

const { users, platforms } = schema;

function createTestDb() {
	const sqlite = new Database(':memory:');
	sqlite.pragma('foreign_keys = ON');
	const db = drizzle(sqlite, { schema });
	migrate(db, { migrationsFolder: './drizzle' });
	return db;
}

function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

describe('POST /api/platforms', () => {
	let db: ReturnType<typeof createTestDb>;
	let userId: string;

	beforeEach(() => {
		db = createTestDb();
		userId = uuid();
		const now = new Date().toISOString();
		db.insert(users)
			.values({
				id: userId,
				username: 'testuser',
				passwordHash: 'hashed',
				createdAt: now,
				updatedAt: now
			})
			.run();
	});

	it('should insert a platform and retrieve it', () => {
		const id = uuid();
		const name = 'My Custom Platform';
		const slug = generateSlug(name);
		const description = 'A custom selling platform';
		const now = new Date().toISOString();

		db.insert(platforms)
			.values({ id, userId, name, slug, description, createdAt: now })
			.run();

		const result = db.select().from(platforms).where(eq(platforms.id, id)).get();

		expect(result).toBeDefined();
		expect(result!.name).toBe('My Custom Platform');
		expect(result!.slug).toBe('my-custom-platform');
		expect(result!.description).toBe('A custom selling platform');
		expect(result!.userId).toBe(userId);
	});

	it('should insert a platform with null description', () => {
		const id = uuid();
		const name = 'Etsy';
		const slug = generateSlug(name);
		const now = new Date().toISOString();

		db.insert(platforms)
			.values({ id, userId, name, slug, description: null, createdAt: now })
			.run();

		const result = db.select().from(platforms).where(eq(platforms.id, id)).get();

		expect(result).toBeDefined();
		expect(result!.name).toBe('Etsy');
		expect(result!.description).toBeNull();
	});

	it('should generate correct slugs from names', () => {
		expect(generateSlug('eBay')).toBe('ebay');
		expect(generateSlug('Facebook Marketplace')).toBe('facebook-marketplace');
		expect(generateSlug('  Spaces & Symbols!! ')).toBe('spaces-symbols');
		expect(generateSlug('---leading-trailing---')).toBe('leading-trailing');
		expect(generateSlug('UPPER CASE')).toBe('upper-case');
		expect(generateSlug('dots.and" quotes')).toBe('dots-and-quotes');
	});
});
