/**
 * Theme Type Definitions
 * TypeScript interfaces for type-safe theme usage across the application
 */

import { tokens, Tokens } from './tokens';

// Extract token keys for type-safe access
export type ColorKey = keyof typeof tokens.colors;
export type SpacingKey = keyof typeof tokens.spacing;
export type FontSizeKey = keyof typeof tokens.typography.fontSize;
export type FontWeightKey = keyof typeof tokens.typography.fontWeight;
export type BorderRadiusKey = keyof typeof tokens.borderRadius;
export type ShadowKey = keyof typeof tokens.shadows;
export type BreakpointKey = keyof typeof tokens.breakpoints;
export type ZIndexKey = keyof typeof tokens.zIndex;

// Theme interface for the complete theme object
export interface Theme {
  colors: typeof tokens.colors;
  typography: typeof tokens.typography;
  spacing: typeof tokens.spacing;
  borderRadius: typeof tokens.borderRadius;
  shadows: typeof tokens.shadows;
  breakpoints: typeof tokens.breakpoints;
  zIndex: typeof tokens.zIndex;
  transition: typeof tokens.transition;
}

// React Native StyleSheet style types
export interface NativeStyles {
  [key: string]: {
    [key: string]: any;
  };
}

// CSS custom properties for web
export interface CSSVariables {
  [key: `--${string}`]: string | number;
}

// Helper types for responsive design
export interface ResponsiveValue<T> {
  mobile: T;
  tablet?: T;
  desktop?: T;
}

// Common style prop types
export interface FlexStyle {
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap?: SpacingKey | number;
  padding?: SpacingKey | number;
  margin?: SpacingKey | number;
}

// Component style variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type InputSize = 'sm' | 'md' | 'lg';

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
}

export interface InputStyleProps {
  size?: InputSize;
  disabled?: boolean;
  error?: boolean;
  focused?: boolean;
}

// Export the Theme type for use in components
export type { Tokens };
