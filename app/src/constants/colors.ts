export const Colors = {
  primaryBlue: '#1E63D6',
  environmentalGreen: '#2E9E5B',
  background: '#FAFAFA',
  darkText: '#1A1A1A',
  grayText: '#6B7280',
  alertOrange: '#FF6B35',
  white: '#FFFFFF',

  // border radius scale
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
  },

  // spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  shadow: {
    soft: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 0,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 0,
    },
  },
} as const;

export type ColorsType = typeof Colors;