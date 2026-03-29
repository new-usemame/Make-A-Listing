import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { getUploadDir } from './files';

describe('getUploadDir', () => {
	it('generates correct path for user and session', () => {
		const dir = getUploadDir('user-123', 'session-456');
		const expected = join(process.cwd(), 'data', 'uploads', 'user-123', 'session-456');
		expect(dir).toBe(expected);
	});

	it('returns same path on repeated calls', () => {
		const dir1 = getUploadDir('user-123', 'session-456');
		const dir2 = getUploadDir('user-123', 'session-456');
		expect(dir1).toBe(dir2);
	});

	it('generates different paths for different sessions', () => {
		const dir1 = getUploadDir('user-123', 'session-a');
		const dir2 = getUploadDir('user-123', 'session-b');
		expect(dir1).not.toBe(dir2);
	});
});
