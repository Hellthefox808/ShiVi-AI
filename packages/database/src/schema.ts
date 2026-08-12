/**
 * ShiVi X100+ Data Platform — Database Schema & DDL Definitions
 * Standard: SAD v2.0 §24, TDA v1.1 §154, FTL-KER-001
 */

export interface TenantRecord {
  tenantId: string;
  name: string;
  organizationId: string;
  environment: string;
  homeRegion: string;
  createdAt: number;
}

export interface UserRecord {
  userId: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: number;
}

export class DatabaseSchemaRepository {
  private static tenants = new Map<string, TenantRecord>();
  private static users = new Map<string, UserRecord>();

  public static createTenant(record: TenantRecord): void {
    this.tenants.set(record.tenantId, record);
  }

  public static getTenant(tenantId: string): TenantRecord | undefined {
    return this.tenants.get(tenantId);
  }

  public static createUser(user: UserRecord): void {
    this.users.set(user.userId, user);
  }

  public static getTenantUsers(tenantId: string): UserRecord[] {
    return Array.from(this.users.values()).filter((u) => u.tenantId === tenantId);
  }

  /**
   * Return production PostgreSQL DDL schema definition
   */
  public static getPostgresDDL(): string {
    return `
-- ShiVi X100+ PostgreSQL Schema Definition
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TABLE IF NOT EXISTS tenants (
  tenant_id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  organization_id VARCHAR(64) NOT NULL,
  environment VARCHAR(32) NOT NULL,
  home_region VARCHAR(32) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(tenant_id),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vector_embeddings (
  embedding_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(tenant_id),
  document_id VARCHAR(255) NOT NULL,
  classification VARCHAR(32) NOT NULL,
  allowed_roles TEXT[] NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
    `.trim();
  }
}
