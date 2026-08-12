/**
 * ShiVi X100+ 18 AI-Native Component Suite
 * Standard: UI/UX Spec v1.0, SAD v2.0 §35
 */

import { AgentSessionContract, ToolExecutionContract, AgentTrajectoryStep, AgentStateContract } from '@shivi/contracts';

// 1. AgentSession Component
export interface AgentSessionProps {
  session: AgentSessionContract;
  children?: any;
}
export function AgentSessionRender(props: AgentSessionProps) {
  return {
    type: 'AgentSession',
    sessionId: props.session.sessionId,
    state: props.session.state,
    riskLevel: props.session.riskLevel,
  };
}

// 2. AgentMessage Component
export interface AgentMessageProps {
  sender: 'user' | 'agent' | 'system';
  content: string;
  timestamp: number;
}
export function AgentMessageRender(props: AgentMessageProps) {
  return {
    type: 'AgentMessage',
    sender: props.sender,
    content: props.content,
    timestamp: props.timestamp,
  };
}

// 3. AgentThoughtStatus Component
export interface AgentThoughtStatusProps {
  statusText: string;
  isReasoning: boolean;
}
export function AgentThoughtStatusRender(props: AgentThoughtStatusProps) {
  return {
    type: 'AgentThoughtStatus',
    statusText: props.statusText,
    isReasoning: props.isReasoning,
  };
}

// 4. ToolExecution Component
export interface ToolExecutionProps {
  tool: ToolExecutionContract;
}
export function ToolExecutionRender(props: ToolExecutionProps) {
  return {
    type: 'ToolExecution',
    toolName: props.tool.toolName,
    status: props.tool.status,
    parameters: props.tool.parameters,
  };
}

// 5. ToolResult Component
export interface ToolResultProps {
  result: unknown;
  executionTimeMs?: number;
}
export function ToolResultRender(props: ToolResultProps) {
  return {
    type: 'ToolResult',
    result: props.result,
    executionTimeMs: props.executionTimeMs,
  };
}

// 6. EvidencePanel Component
export interface EvidencePanelProps {
  recordId: string;
  previousHash: string;
  hash: string;
  timestamp: number;
}
export function EvidencePanelRender(props: EvidencePanelProps) {
  return {
    type: 'EvidencePanel',
    recordId: props.recordId,
    hash: props.hash,
    previousHash: props.previousHash,
  };
}

// 7. Citation Component
export interface CitationProps {
  documentId: string;
  classification: string;
  similarityScore: number;
}
export function CitationRender(props: CitationProps) {
  return {
    type: 'Citation',
    documentId: props.documentId,
    classification: props.classification,
    similarityScore: props.similarityScore,
  };
}

// 8. ApprovalRequest Component
export interface ApprovalRequestProps {
  requestId: string;
  operation: string;
  riskLevel: string;
  onApprove?: () => void;
  onReject?: () => void;
}
export function ApprovalRequestRender(props: ApprovalRequestProps) {
  return {
    type: 'ApprovalRequest',
    requestId: props.requestId,
    operation: props.operation,
    riskLevel: props.riskLevel,
  };
}

// 9. CapabilityBadge Component
export interface CapabilityBadgeProps {
  capabilityId: string;
  riskLevel: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
}
export function CapabilityBadgeRender(props: CapabilityBadgeProps) {
  return {
    type: 'CapabilityBadge',
    capabilityId: props.capabilityId,
    riskLevel: props.riskLevel,
  };
}

// 10. AgentState Component
export interface AgentStateProps {
  state: AgentStateContract;
}
export function AgentStateRender(props: AgentStateProps) {
  return {
    type: 'AgentState',
    state: props.state,
  };
}

// 11. WorkflowExecution Component
export interface WorkflowExecutionProps {
  workflowId: string;
  currentStep: number;
  totalSteps: number;
  status: string;
}
export function WorkflowExecutionRender(props: WorkflowExecutionProps) {
  return {
    type: 'WorkflowExecution',
    workflowId: props.workflowId,
    progress: `${props.currentStep}/${props.totalSteps}`,
    status: props.status,
  };
}

// 12. ExecutionTimeline Component
export interface ExecutionTimelineProps {
  steps: AgentTrajectoryStep[];
}
export function ExecutionTimelineRender(props: ExecutionTimelineProps) {
  return {
    type: 'ExecutionTimeline',
    totalSteps: props.steps.length,
  };
}

// 13. ConfidenceIndicator Component
export interface ConfidenceIndicatorProps {
  score: number; // 0.0 to 1.0
}
export function ConfidenceIndicatorRender(props: ConfidenceIndicatorProps) {
  return {
    type: 'ConfidenceIndicator',
    score: props.score,
    percentage: `${(props.score * 100).toFixed(1)}%`,
  };
}

// 14. ContextInspector Component
export interface ContextInspectorProps {
  contextQualityScore: number;
  itemCount: number;
  freshnessGrade: string;
}
export function ContextInspectorRender(props: ContextInspectorProps) {
  return {
    type: 'ContextInspector',
    cqScore: props.contextQualityScore,
    itemCount: props.itemCount,
    freshnessGrade: props.freshnessGrade,
  };
}

// 15. MemoryInspector Component
export interface MemoryInspectorProps {
  workingMemoryCount: number;
  episodicMemoryCount: number;
  semanticMemoryCount: number;
  proceduralMemoryCount: number;
}
export function MemoryInspectorRender(props: MemoryInspectorProps) {
  return {
    type: 'MemoryInspector',
    totalMemories: props.workingMemoryCount + props.episodicMemoryCount + props.semanticMemoryCount + props.proceduralMemoryCount,
  };
}

// 16. PolicyDecision Component
export interface PolicyDecisionProps {
  action: string;
  allowed: boolean;
  reason?: string;
}
export function PolicyDecisionRender(props: PolicyDecisionProps) {
  return {
    type: 'PolicyDecision',
    action: props.action,
    allowed: props.allowed,
    reason: props.reason,
  };
}

// 17. AgentCheckpoint Component
export interface AgentCheckpointProps {
  checkpointId: string;
  stepIndex: number;
  timestamp: number;
}
export function AgentCheckpointRender(props: AgentCheckpointProps) {
  return {
    type: 'AgentCheckpoint',
    checkpointId: props.checkpointId,
    stepIndex: props.stepIndex,
  };
}

// 18. RecoveryState Component
export interface RecoveryStateProps {
  triggerReason: string;
  newState: string;
  workingMemoryPurged: boolean;
}
export function RecoveryStateRender(props: RecoveryStateProps) {
  return {
    type: 'RecoveryState',
    triggerReason: props.triggerReason,
    newState: props.newState,
    workingMemoryPurged: props.workingMemoryPurged,
  };
}
