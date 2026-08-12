/**
 * ShiVi Design System
 * 24 enterprise components with 15 documented states each
 */
export type ComponentState = 'default' | 'hover' | 'focus' | 'active' | 'disabled' | 'loading' | 'success' | 'warning' | 'error' | 'readonly' | 'unauthorized' | 'degraded' | 'offline' | 'approval_required' | 'quarantined';

export interface ComponentProps { state?: ComponentState; className?: string; disabled?: boolean; }

// Core Components
export interface ButtonProps extends ComponentProps { variant: 'primary' | 'secondary' | 'ghost' | 'destructive'; size: 'sm' | 'md' | 'lg'; }
export interface InputProps extends ComponentProps { type: 'text' | 'email' | 'password' | 'search' | 'number'; placeholder?: string; }
export interface SelectProps extends ComponentProps { options: { label: string; value: string }[]; multiple?: boolean; }
export interface DialogProps extends ComponentProps { open: boolean; onClose: () => void; title: string; }
export interface DrawerProps extends ComponentProps { open: boolean; side: 'left' | 'right'; onClose: () => void; }
export interface TableProps extends ComponentProps { columns: unknown[]; data: unknown[]; sortable?: boolean; }
export interface DataGridProps extends ComponentProps { columns: unknown[]; rows: unknown[]; virtualScroll?: boolean; }

// Data Visualization
export interface ChartProps extends ComponentProps { type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'; data: unknown; }
export interface TimelineProps extends ComponentProps { events: { timestamp: string; label: string; type: string }[]; }

// Platform Components
export interface CommandPaletteProps extends ComponentProps { commands: { id: string; label: string; action: () => void }[]; }
export interface ToastProps extends ComponentProps { variant: 'info' | 'success' | 'warning' | 'error'; message: string; }
export interface NotificationCenterProps extends ComponentProps { notifications: unknown[]; unreadCount: number; }
export interface ApprovalPanelProps extends ComponentProps { request: unknown; onApprove: () => void; onReject: () => void; }
export interface AgentPanelProps extends ComponentProps { agentId: string; agentState: string; trajectory: unknown[]; }
export interface ToolActivityProps extends ComponentProps { toolName: string; invocations: unknown[]; }
export interface EvidencePanelProps extends ComponentProps { evidenceChain: unknown[]; verified: boolean; }
export interface PolicyStatusProps extends ComponentProps { policies: { name: string; status: 'pass' | 'fail' | 'pending' }[]; }
export interface RiskBadgeProps extends ComponentProps { tier: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5'; }
export interface SecurityAlertProps extends ComponentProps { severity: 'low' | 'medium' | 'high' | 'critical'; message: string; }
export interface WorkflowCanvasProps extends ComponentProps { nodes: unknown[]; edges: unknown[]; onNodeClick: (id: string) => void; }
export interface AgentCanvasProps extends ComponentProps { agents: unknown[]; connections: unknown[]; }
export interface KnowledgeGraphProps extends ComponentProps { nodes: unknown[]; edges: unknown[]; layout: 'force' | 'tree' | 'radial'; }
export interface TraceViewerProps extends ComponentProps { traceId: string; spans: unknown[]; }
