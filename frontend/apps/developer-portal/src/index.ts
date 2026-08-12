export interface DevPortalConfig { readonly basePath: string; readonly apiDocsEnabled: boolean; readonly sandboxEnabled: boolean; }
export class DeveloperPortalApp { constructor(private config: DevPortalConfig) {} }
