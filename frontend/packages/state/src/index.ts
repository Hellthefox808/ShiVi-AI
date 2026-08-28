export interface UIState { sidebarOpen: boolean; theme: 'light' | 'dark' | 'system'; commandPaletteOpen: boolean; activeModal: string | null; }
export interface NavigationState { currentPath: string; breadcrumbs: { label: string; path: string }[]; }
export interface NotificationState { items: unknown[]; unreadCount: number; }
export function createUIStore(initial?: Partial<UIState>): UIState { return { sidebarOpen: true, theme: 'system', commandPaletteOpen: false, activeModal: null, ...initial }; }

export class StateStore {
  private state: UIState;

  constructor(initial?: Partial<UIState>) {
    this.state = createUIStore(initial);
  }

  public getState(): UIState {
    return this.state;
  }

  public toggleSidebar(): void {
    this.state.sidebarOpen = !this.state.sidebarOpen;
  }

  public setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.state.theme = theme;
  }
}
