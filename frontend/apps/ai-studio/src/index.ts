/**
 * @shivi/app-ai-studio
 * AI Studio Portal Configuration Types & Module Exports
 */

export interface ModelSandboxConfig {
  defaultModelId: string;
  availableModels: string[];
  maxTokensLimit: number;
  temperatureRange: [number, number];
  enableStreaming: boolean;
  systemPromptPreset: string;
}

export interface PromptStudioConfig {
  enablePromptVersioning: boolean;
  autoSaveDrafts: boolean;
  maxPromptLength: number;
  variableSyntax: 'mustache' | 'f-string' | 'custom';
  enablePromptOptimization: boolean;
}

export interface AgentBuilderConfig {
  allowCustomTools: boolean;
  maxSubAgents: number;
  enableMemoryPersistence: boolean;
  defaultMemoryType: 'vector' | 'buffer' | 'summary' | 'graph';
  enableToolSandboxing: boolean;
}

export interface FineTuningConfig {
  supportedProviders: ('openai' | 'anthropic' | 'google' | 'huggingface' | 'local')[];
  maxBatchSize: number;
  defaultLearningRate: number;
  enableHyperparameterTuning: boolean;
}

export interface EvaluationConfig {
  benchmarks: string[];
  metrics: ('accuracy' | 'latency' | 'cost' | 'hallucination' | 'safety')[];
  autoEvaluateOnDeploy: boolean;
}

export interface DatasetManagerConfig {
  maxDatasetSizeBytes: number;
  supportedFormats: ('jsonl' | 'csv' | 'parquet' | 'tsv')[];
  enableSyntheticDataGen: boolean;
}

export interface WorkflowDesignerConfig {
  enableVisualCanvas: boolean;
  gridSnap: boolean;
  maxNodesPerWorkflow: number;
  autoFormatLayout: boolean;
}

export interface StudioConfig {
  sandbox: ModelSandboxConfig;
  promptStudio: PromptStudioConfig;
  agentBuilder: AgentBuilderConfig;
  fineTuning: FineTuningConfig;
  evaluation: EvaluationConfig;
  datasetManager: DatasetManagerConfig;
  workflowDesigner: WorkflowDesignerConfig;
}

export class AIStudioManager {
  private config: StudioConfig;

  constructor(initialConfig?: Partial<StudioConfig>) {
    this.config = {
      sandbox: {
        defaultModelId: 'gpt-4o',
        availableModels: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro', 'llama-3'],
        maxTokensLimit: 128000,
        temperatureRange: [0, 2],
        enableStreaming: true,
        systemPromptPreset: 'You are a helpful AI assistant.',
      },
      promptStudio: {
        enablePromptVersioning: true,
        autoSaveDrafts: true,
        maxPromptLength: 32000,
        variableSyntax: 'mustache',
        enablePromptOptimization: true,
      },
      agentBuilder: {
        allowCustomTools: true,
        maxSubAgents: 10,
        enableMemoryPersistence: true,
        defaultMemoryType: 'vector',
        enableToolSandboxing: true,
      },
      fineTuning: {
        supportedProviders: ['openai', 'anthropic', 'google', 'huggingface', 'local'],
        maxBatchSize: 128,
        defaultLearningRate: 0.0001,
        enableHyperparameterTuning: true,
      },
      evaluation: {
        benchmarks: ['MMLU', 'GSM8K', 'HumanEval'],
        metrics: ['accuracy', 'latency', 'cost', 'hallucination', 'safety'],
        autoEvaluateOnDeploy: true,
      },
      datasetManager: {
        maxDatasetSizeBytes: 1073741824, // 1GB
        supportedFormats: ['jsonl', 'csv', 'parquet', 'tsv'],
        enableSyntheticDataGen: true,
      },
      workflowDesigner: {
        enableVisualCanvas: true,
        gridSnap: true,
        maxNodesPerWorkflow: 50,
        autoFormatLayout: true,
      },
      ...initialConfig,
    };
  }

  public getConfig(): StudioConfig {
    return { ...this.config };
  }
}

export function createStudioConfig(overrides?: Partial<StudioConfig>): StudioConfig {
  return new AIStudioManager(overrides).getConfig();
}
