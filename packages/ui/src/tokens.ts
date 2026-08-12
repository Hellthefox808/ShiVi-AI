/**
 * ShiVi X100+ UI/UX Design System — Visual Design Tokens
 * Standard: UI/UX Specification v1.0 §3.1-3.3
 */

export type DensityMode = 'COMPACT' | 'COMFORTABLE' | 'SPACIOUS';

export interface ColorToken {
  name: string;
  value: string;
  description: string;
}

export const ShiViDesignTokens = {
  surfaces: {
    background: '#090d16',
    surfaceL1: '#0f172a',
    surfaceL2: '#1e293b',
    surfaceL3: '#334155',
    glassmorphismOverlay: 'rgba(15, 23, 42, 0.75)',
  },
  colors: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    border: '#1e293b',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    headings: {
      h1: { fontSize: '2rem', lineHeight: '2.5rem', fontWeight: 700 },
      h2: { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: 600 },
      h3: { fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 600 },
    },
    body: {
      regular: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 400 },
      mono: { fontFamily: '"Fira Code", monospace', fontSize: '0.8125rem' },
    },
  },
  densityPadding: {
    COMPACT: { cell: '4px 8px', card: '12px' },
    COMFORTABLE: { cell: '8px 12px', card: '16px' },
    SPACIOUS: { cell: '12px 16px', card: '24px' },
  },
};
