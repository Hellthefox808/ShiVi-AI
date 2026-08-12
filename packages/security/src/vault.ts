/**
 * ShiVi X100+ Security — Vault Secret Manager & Cryptographic KMS Encryption
 * Standard: SAD v2.0 §14, TDA v1.1 §72
 */

import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class VaultSecretManager {
  private static secrets = new Map<string, string>();
  private static masterKey = randomBytes(32);

  /**
   * Store encrypted secret in Vault
   */
  public static setSecret(tenantId: string, secretName: string, secretValue: string): void {
    const key = `vault:${tenantId}:${secretName}`;
    const encrypted = this.encrypt(secretValue);
    this.secrets.set(key, encrypted);
  }

  /**
   * Retrieve and decrypt secret from Vault
   */
  public static getSecret(tenantId: string, secretName: string): string | null {
    const key = `vault:${tenantId}:${secretName}`;
    const encrypted = this.secrets.get(key);
    if (!encrypted) return null;
    return this.decrypt(encrypted);
  }

  /**
   * Sanitize environment payload string
   */
  public static sanitizeEnvVariables(envObj: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    for (const [k, v] of Object.entries(envObj)) {
      if (k.toLowerCase().includes('secret') || k.toLowerCase().includes('password') || k.toLowerCase().includes('token')) {
        sanitized[k] = '[REDACTED_SECRET]';
      } else {
        sanitized[k] = v;
      }
    }
    return sanitized;
  }

  private static encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.masterKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private static decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = createDecipheriv('aes-256-cbc', this.masterKey, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  public static resetVault(): void {
    this.secrets.clear();
  }
}
