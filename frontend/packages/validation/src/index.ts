export const emailSchema = { parse: (v: string) => v.includes('@') };
export const passwordSchema = { parse: (v: string) => v.length >= 8 };
export const tenantIdSchema = { parse: (v: string) => v.length > 0 };
