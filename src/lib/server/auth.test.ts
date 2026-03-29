import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import * as schema from './db/schema';
import { createAuthService } from './auth';

describe('Auth Service', () => {
	let db: ReturnType<typeof drizzle>;
	let auth: ReturnType<typeof createAuthService>;
	let sqlite: InstanceType<typeof Database>;

	beforeEach(() => {
		sqlite = new Database(':memory:');
		db = drizzle(sqlite, { schema });
		migrate(db, { migrationsFolder: './drizzle' });
		auth = createAuthService(db);
	});

	it('should register a new user successfully', () => {
		const result = auth.register('testuser', 'password123');
		expect(result).toHaveProperty('id');
		expect(result.username).toBe('testuser');
	});

	it('should reject duplicate username with "Username already taken"', () => {
		auth.register('testuser', 'password123');
		expect(() => auth.register('testuser', 'other')).toThrowError('Username already taken');
	});

	it('should login with correct credentials and return token', () => {
		auth.register('testuser', 'password123');
		const result = auth.login('testuser', 'password123');
		expect(result).toHaveProperty('token');
		expect(result).toHaveProperty('userId');
	});

	it('should reject wrong password with "Invalid credentials"', () => {
		auth.register('testuser', 'password123');
		expect(() => auth.login('testuser', 'wrongpassword')).toThrowError('Invalid credentials');
	});

	it('should reject nonexistent user with "Invalid credentials"', () => {
		expect(() => auth.login('nouser', 'password123')).toThrowError('Invalid credentials');
	});

	it('should validate a session token and return user', () => {
		auth.register('testuser', 'password123');
		const { token } = auth.login('testuser', 'password123');
		const user = auth.validateSession(token);
		expect(user).not.toBeNull();
		expect(user!.username).toBe('testuser');
	});

	it('should reject expired session', () => {
		auth.register('testuser', 'password123');
		const { token } = auth.login('testuser', 'password123');

		// Manually set expiresAt to the past
		db.update(schema.authSessions)
			.set({ expiresAt: new Date('2000-01-01').toISOString() })
			.where(eq(schema.authSessions.id, token))
			.run();

		const result = auth.validateSession(token);
		expect(result).toBeNull();
	});

	it('should logout and delete the session', () => {
		auth.register('testuser', 'password123');
		const { token } = auth.login('testuser', 'password123');
		auth.logout(token);
		const result = auth.validateSession(token);
		expect(result).toBeNull();
	});
});
