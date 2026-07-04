export const Typography = {
  fontFamily: {

    sans: 'System',
  },
  fontSize: {
    h1: 28,
    h2: 22,
    body: 16,
    caption: 12,
  },
  fontWeight: {
    bold: '700' as const,
    semibold: '600' as const,
    regular: '400' as const,
  },
  lineHeight: {
    h1: 34,
    h2: 28,
    body: 22,
    caption: 16,
  },
} as const;

export type TypographyType = typeof Typography;
