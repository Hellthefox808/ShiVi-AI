export const emailSchema = { parse: (v: string) => v.includes('@') };
export const passwordSchema = { parse: (v: string) => v.length >= 8 };
export const tenantIdSchema = { parse: (v: string) => v.length > 0 };

export class ValidationSchemas {
  static validateEmail(email: string): boolean {
    return email.includes('@') && email.includes('.');
  }

  static validatePassword(password: string): boolean {
    return password.length >= 8;
  }

  static validateTenantId(tenantId: string): boolean {
    return Boolean(tenantId && tenantId.trim().length > 0);
  }
}
