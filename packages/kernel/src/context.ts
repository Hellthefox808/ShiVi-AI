/**
 * ShiVi X100+ Kernel — Context Engineering & Firewall Primitives
 * Standard: SAD v2.0 §22, TDA v1.1 §66, FTL-KER-007
 */

import { TenancyContext, TenancyManager, DataClassification } from './tenancy.js';
import { PrincipalIdentity } from './identity.js';

export interface ContextItem {
  id: string;
  source: string;
  classification: DataClassification;
  content: string;
  metadata: Record<string, string | number | boolean>;
  timestamp: number;
}

export interface CompiledContextWindow {
  tenantId: string;
  principalId: string;
  systemRules: string[];
  authorizedKnowledge: ContextItem[];
  totalTokensEstimate: number;
  compiledAt: number;
}

export class ContextCompiler {
  /**
   * Filter and compile authorized context items for an LLM prompt
   */
  public static compileContext(
    tenancyContext: TenancyContext,
    principal: PrincipalIdentity,
    systemRules: string[],
    rawKnowledge: ContextItem[],
    maxTokenBudget: number = 4000
  ): CompiledContextWindow {
    const authorizedItems: ContextItem[] = [];
    let currentTokenEstimate = 0;

    for (const item of rawKnowledge) {
      if (!TenancyManager.validateClassificationAccess(tenancyContext, item.classification)) {
        continue; // Firewall out unauthorized classified data
      }

      const itemTokens = Math.ceil(item.content.length / 4);
      if (currentTokenEstimate + itemTokens > maxTokenBudget) {
        break; // Stop compiling once context budget is reached
      }

      authorizedItems.push(item);
      currentTokenEstimate += itemTokens;
    }

    return {
      tenantId: tenancyContext.tenantId,
      principalId: principal.id,
      systemRules,
      authorizedKnowledge: authorizedItems,
      totalTokensEstimate: currentTokenEstimate,
      compiledAt: Date.now(),
    };
  }
}
