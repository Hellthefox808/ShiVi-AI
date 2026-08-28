/**
 * ShiVi AI Studio App
 */
export interface AIStudioConfig {
  basePath: string;
  modelPlaygroundEnabled?: boolean;
  maxConcurrentAgents?: number;
}

export class AIStudioApp {
  constructor(private config: AIStudioConfig) {}

  public getConfig(): AIStudioConfig {
    return this.config;
  }
}
export default AIStudioApp;
