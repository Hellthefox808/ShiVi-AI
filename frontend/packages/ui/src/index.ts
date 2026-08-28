export * from './edge-states.js';

export interface UIComponentProps {
  className?: string;
  children?: any;
  disabled?: boolean;
}

export class UIComponents {
  static renderButton(label: string, onClick?: () => void) {
    return { type: 'button', label, onClick };
  }
}
