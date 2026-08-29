/**
 * ShiVi X100+ Database — PostgreSQL Pool, PgVector & Schema Migration Engine
 * Standard: SAD v2.0 §24, TDA v1.1 §155
 */

import { Pool, PoolConfig } from 'pg';
import { DatabaseSchemaRepository, TenantRecord, UserRecord } from './schema.js';

export interface PostgresConfig extends PoolConfig {
  connectionString?: string;
}

export interface VectorSearchResult {
  embeddingId: string;
  tenantId: string;
  documentId: string;
  content: string;
  similarityScore: number;
}

export class PostgresPoolAdapter {
  private static pool: Pool | null = null;
  public static isConnected = false;

  public static async connect(config?: PostgresConfig): Promise<boolean> {
    if (this.pool) return true;
    
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || config?.connectionString,
      max: config?.max || 20,
      ssl: config?.ssl,
    });

    try {
      await this.pool.query('SELECT 1');
      this.isConnected = true;
      return true;
    } catch (err) {
      console.error('ShiVi DB Error: Failed to connect to PostgreSQL', err);
      return false;
    }
  }

  public static async runMigrations(): Promise<{ success: boolean; executedDDL: string }> {
    if (!this.pool) await this.connect();
    
    const ddl = DatabaseSchemaRepository.getPostgresDDL();
    try {
      await this.pool!.query(ddl);
      return {
        success: true,
        executedDDL: ddl,
      };
    } catch (err) {
      console.error('ShiVi DB Error: Migration failed', err);
      return {
        success: false,
        executedDDL: '',
      };
    }
  }

  /**
   * Insert vector embedding into multi-tenant vector table
   */
  public static async insertVector(
    embeddingId: string,
    tenantId: string,
    documentId: string,
    classification: string,
    allowedRoles: string[],
    content: string,
    vector: number[]
  ): Promise<void> {
    if (!this.pool) await this.connect();
    
    const vectorStr = `[${vector.join(',')}]`;
    
    await this.pool!.query(
      `INSERT INTO vector_embeddings 
       (embedding_id, tenant_id, document_id, classification, allowed_roles, content, embedding)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [embeddingId, tenantId, documentId, classification, allowedRoles, content, vectorStr]
    );
  }

  /**
   * Execute cosine similarity search with tenant scoping and role-based ACL filter
   */
  public static async searchVectors(
    tenantId: string,
    queryVector: number[],
    userRoles: string[],
    topK: number = 5
  ): Promise<VectorSearchResult[]> {
    if (!this.pool) await this.connect();

    const vectorStr = `[${queryVector.join(',')}]`;
    
    const result = await this.pool!.query(
      `SELECT 
         embedding_id, 
         tenant_id, 
         document_id, 
         content, 
         1 - (embedding <=> $1) as similarity_score
       FROM vector_embeddings
       WHERE tenant_id = $2
         AND allowed_roles && $3
       ORDER BY embedding <=> $1
       LIMIT $4`,
      [vectorStr, tenantId, userRoles, topK]
    );

    return result.rows.map(row => ({
      embeddingId: row.embedding_id,
      tenantId: row.tenant_id,
      documentId: row.document_id,
      content: row.content,
      similarityScore: Number(row.similarity_score.toFixed(4)),
    }));
  }

  public static async resetVectorStorage(): Promise<void> {
    if (!this.pool) await this.connect();
    await this.pool!.query(`TRUNCATE TABLE vector_embeddings`);
  }
}
