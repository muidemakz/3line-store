import bcrypt from 'bcryptjs';
import { env } from '../config/env';

/**
 * Hashes a plain-text password.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, env.BCRYPT_SALT_ROUNDS);
}

/**
 * Compares a plain-text password against a stored hash.
 */
export async function comparePasswords(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
