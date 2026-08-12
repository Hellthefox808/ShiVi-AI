export interface UIState { sidebarOpen: boolean; theme: 'light' | 'dark' | 'system'; commandPaletteOpen: boolean; activeModal: string | null; }
export interface NavigationState { currentPath: string; breadcrumbs: { label: string; path: string }[]; }
export interface NotificationState { items: unknown[]; unreadCount: number; }
export function createUIStore(initial?: Partial<UIState>): UIState { return { sidebarOpen: true, theme: 'system', commandPaletteOpen: false, activeModal: null, ...initial }; }
