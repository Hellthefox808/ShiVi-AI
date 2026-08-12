import { describe, it, expect } from 'vitest';
import { DatabaseSchemaRepository, SyntheticEnterpriseGenerator } from '../index.js';

describe('ShiVi Data Platform & Schema Repository Suite', () => {
  it('should generate valid PostgreSQL DDL with pgvector extension', () => {
    const ddl = DatabaseSchemaRepository.getPostgresDDL();
    expect(ddl).toContain('CREATE EXTENSION IF NOT EXISTS "vector"');
    expect(ddl).toContain('CREATE TABLE IF NOT EXISTS tenants');
    expect(ddl).toContain('CREATE TABLE IF NOT EXISTS vector_embeddings');
  });

  it('should generate synthetic enterprise with tenant and users', () => {
    const syn = SyntheticEnterpriseGenerator.generateEnterprise('Acme Corp', 'staging', 5);
    expect(syn.tenant.name).toBe('Acme Corp');
    expect(syn.tenant.environment).toBe('staging');
    expect(syn.users.length).toBe(5);

    const retrievedUsers = DatabaseSchemaRepository.getTenantUsers(syn.tenant.tenantId);
    expect(retrievedUsers.length).toBe(5);
  });
});
