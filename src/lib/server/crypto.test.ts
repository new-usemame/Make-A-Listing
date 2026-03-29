import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt, maskApiKey } from './crypto';

describe('Encryption', () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-at-least-32-chars!!';
  });

  it('should encrypt and decrypt a string', () => {
    const plaintext = 'sk-or-v1-abc123def456';
    const encrypted = encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(encrypted).toContain(':');
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertexts for same input', () => {
    const plaintext = 'sk-or-v1-abc123def456';
    const a = encrypt(plaintext);
    const b = encrypt(plaintext);
    expect(a).not.toBe(b);
  });

  it('should throw on tampered ciphertext', () => {
    const encrypted = encrypt('secret');
    const parts = encrypted.split(':');
    parts[2] = 'tampered' + parts[2];
    expect(() => decrypt(parts.join(':'))).toThrow();
  });

  it('should mask API keys correctly', () => {
    expect(maskApiKey('sk-or-v1-abcdef123456')).toBe('sk-or-...3456');
    expect(maskApiKey('short')).toBe('****');
  });
});
