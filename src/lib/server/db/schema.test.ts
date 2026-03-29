import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

const { users, sessions, messages, listings, platforms } = schema;

function createTestDb() {
	const sqlite = new Database(':memory:');
	sqlite.pragma('foreign_keys = ON');
	const db = drizzle(sqlite, { schema });
	migrate(db, { migrationsFolder: './drizzle' });
	return db;
}

describe('Database schema', () => {
	let db: ReturnType<typeof createTestDb>;

	beforeEach(() => {
		db = createTestDb();
	});

	it('should create and retrieve a user', () => {
		const now = new Date().toISOString();
		const userId = uuid();

		db.insert(users)
			.values({
				id: userId,
				username: 'testuser',
				passwordHash: 'hashed_password',
				createdAt: now,
				updatedAt: now
			})
			.run();

		const result = db.select().from(users).where(eq(users.id, userId)).get();

		expect(result).toBeDefined();
		expect(result!.username).toBe('testuser');
		expect(result!.passwordHash).toBe('hashed_password');
		expect(result!.preferredModel).toBe('openai/gpt-4o-mini');
		expect(result!.createdAt).toBe(now);
	});

	it('should create a full chain: user -> session -> message -> listing', () => {
		const now = new Date().toISOString();
		const userId = uuid();
		const sessionId = uuid();
		const messageId = uuid();
		const platformId = uuid();
		const listingId = uuid();

		// Create user
		db.insert(users)
			.values({
				id: userId,
				username: 'seller',
				passwordHash: 'hash',
				createdAt: now,
				updatedAt: now
			})
			.run();

		// Create platform
		db.insert(platforms)
			.values({
				id: platformId,
				name: 'eBay',
				slug: 'ebay',
				description: 'eBay marketplace',
				createdAt: now
			})
			.run();

		// Create session
		db.insert(sessions)
			.values({
				id: sessionId,
				userId,
				title: 'Test Session',
				createdAt: now,
				updatedAt: now
			})
			.run();

		// Create message
		db.insert(messages)
			.values({
				id: messageId,
				sessionId,
				role: 'assistant',
				content: 'Here is your listing',
				createdAt: now
			})
			.run();

		// Create listing
		db.insert(listings)
			.values({
				id: listingId,
				messageId,
				sessionId,
				platformId,
				markdownContent: '# Great Product\nBuy now!',
				modelUsed: 'openai/gpt-4o-mini',
				createdAt: now
			})
			.run();

		// Verify the chain
		const listing = db.select().from(listings).where(eq(listings.id, listingId)).get();
		expect(listing).toBeDefined();
		expect(listing!.markdownContent).toBe('# Great Product\nBuy now!');
		expect(listing!.sessionId).toBe(sessionId);
		expect(listing!.messageId).toBe(messageId);
		expect(listing!.platformId).toBe(platformId);

		const msg = db.select().from(messages).where(eq(messages.id, messageId)).get();
		expect(msg).toBeDefined();
		expect(msg!.role).toBe('assistant');

		const sess = db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
		expect(sess).toBeDefined();
		expect(sess!.userId).toBe(userId);
	});

	it('should enforce unique username constraint', () => {
		const now = new Date().toISOString();

		db.insert(users)
			.values({
				id: uuid(),
				username: 'unique_user',
				passwordHash: 'hash1',
				createdAt: now,
				updatedAt: now
			})
			.run();

		expect(() => {
			db.insert(users)
				.values({
					id: uuid(),
					username: 'unique_user',
					passwordHash: 'hash2',
					createdAt: now,
					updatedAt: now
				})
				.run();
		}).toThrow();
	});
});
