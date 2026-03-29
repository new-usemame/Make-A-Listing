import { eq } from 'drizzle-orm';
import { hashSync, compareSync } from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './db/schema';

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function createAuthService(db: BetterSQLite3Database<typeof schema>) {
	return {
		register(username: string, password: string) {
			const existing = db
				.select()
				.from(schema.users)
				.where(eq(schema.users.username, username))
				.get();
			if (existing) throw new Error('Username already taken');

			const now = new Date().toISOString();
			const user = {
				id: uuid(),
				username,
				passwordHash: hashSync(password, 12),
				preferredModel: 'openai/gpt-4o-mini',
				createdAt: now,
				updatedAt: now
			};
			db.insert(schema.users).values(user).run();
			return { id: user.id, username: user.username };
		},

		login(username: string, password: string) {
			const user = db
				.select()
				.from(schema.users)
				.where(eq(schema.users.username, username))
				.get();
			if (!user || !compareSync(password, user.passwordHash)) {
				throw new Error('Invalid credentials');
			}

			const token = uuid();
			const now = new Date().toISOString();
			const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

			db.insert(schema.authSessions)
				.values({
					id: token,
					userId: user.id,
					expiresAt,
					createdAt: now
				})
				.run();

			return { token, userId: user.id };
		},

		validateSession(token: string) {
			const session = db
				.select()
				.from(schema.authSessions)
				.where(eq(schema.authSessions.id, token))
				.get();

			if (!session || new Date(session.expiresAt) < new Date()) {
				return null;
			}

			const user = db
				.select()
				.from(schema.users)
				.where(eq(schema.users.id, session.userId))
				.get();
			if (!user) return null;

			// Rolling renewal
			const newExpiry = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
			db.update(schema.authSessions)
				.set({ expiresAt: newExpiry })
				.where(eq(schema.authSessions.id, token))
				.run();

			return { id: user.id, username: user.username };
		},

		logout(token: string) {
			db.delete(schema.authSessions).where(eq(schema.authSessions.id, token)).run();
		}
	};
}
