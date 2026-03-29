import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	openrouterApiKey: text('openrouter_api_key'),
	preferredModel: text('preferred_model').notNull().default('openai/gpt-4o-mini'),
	systemPrompt: text('system_prompt'),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull()
});

export const authSessions = sqliteTable('auth_sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: text('expires_at').notNull(),
	createdAt: text('created_at').notNull()
});

export const platforms = sqliteTable('platforms', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	description: text('description'),
	createdAt: text('created_at').notNull()
});

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	title: text('title'),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull()
});

export const messages = sqliteTable('messages', {
	id: text('id').primaryKey(),
	sessionId: text('session_id')
		.notNull()
		.references(() => sessions.id, { onDelete: 'cascade' }),
	role: text('role').notNull(),
	content: text('content').notNull(),
	images: text('images'),
	pdfText: text('pdf_text'),
	createdAt: text('created_at').notNull()
});

export const listings = sqliteTable('listings', {
	id: text('id').primaryKey(),
	messageId: text('message_id')
		.notNull()
		.references(() => messages.id, { onDelete: 'cascade' }),
	sessionId: text('session_id')
		.notNull()
		.references(() => sessions.id, { onDelete: 'cascade' }),
	platformId: text('platform_id')
		.notNull()
		.references(() => platforms.id),
	markdownContent: text('markdown_content').notNull(),
	modelUsed: text('model_used').notNull(),
	createdAt: text('created_at').notNull()
});
