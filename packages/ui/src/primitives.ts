/**
 * ShiVi Experience Platform — AI Interaction & Governance Component Primitives
 * Standard: UI/UX Specification v1.0 §3.1-3.4
 */

import { UxState, UxStateMachineEvaluator } from './state-machine.js';

export interface ComponentViewModel<T> {
  componentId: string;
  uxState: UxState;
  stateMetadata: ReturnType<typeof UxStateMachineEvaluator.getMetadata>;
  data: T;
}

export class ShiViInteractionPrimitives {
  public static createApprovalPrimitive(id: string, taskId: string, riskLevel: string, requiredRole: string): ComponentViewModel<{ taskId: string; riskLevel: string; requiredRole: string }> {
    return {
      componentId: id,
      uxState: 'approval_required',
      stateMetadata: UxStateMachineEvaluator.getMetadata('approval_required'),
      data: { taskId, riskLevel, requiredRole }
    };
  }

  public static createToolExecutionPanel(id: string, toolName: string, args: Record<string, unknown>, state: UxState): ComponentViewModel<{ toolName: string; args: Record<string, unknown> }> {
    return {
      componentId: id,
      uxState: state,
      stateMetadata: UxStateMachineEvaluator.getMetadata(state),
      data: { toolName, args }
    };
  }

  public static createEvidencePanel(id: string, citationText: string, chunkHash: string, verified: boolean): ComponentViewModel<{ citationText: string; chunkHash: string; verified: boolean }> {
    const uxState: UxState = verified ? 'success' : 'warning';
    return {
      componentId: id,
      uxState,
      stateMetadata: UxStateMachineEvaluator.getMetadata(uxState),
      data: { citationText, chunkHash, verified }
    };
  }

  public static createTenantSwitcher(id: string, currentTenantId: string, availableTenants: string[]): ComponentViewModel<{ currentTenantId: string; availableTenants: string[] }> {
    return {
      componentId: id,
      uxState: 'idle',
      stateMetadata: UxStateMachineEvaluator.getMetadata('idle'),
      data: { currentTenantId, availableTenants }
    };
  }
}
