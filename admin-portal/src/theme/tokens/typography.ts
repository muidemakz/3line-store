export const fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const typography = {
  display: { fontSize: 72, lineHeight: 84, fontWeight: 700, letterSpacing: '-0.02em' },
  h1: { fontSize: 48, lineHeight: 56, fontWeight: 700, letterSpacing: '-0.01em' },
  h2: { fontSize: 36, lineHeight: 44, fontWeight: 700, letterSpacing: '-0.01em' },
  h3: { fontSize: 30, lineHeight: 38, fontWeight: 600, letterSpacing: '-0.01em' },
  titleLg: { fontSize: 24, lineHeight: 32, fontWeight: 600, letterSpacing: '-0.01em' },
  titleMd: { fontSize: 20, lineHeight: 28, fontWeight: 600, letterSpacing: '-0.01em' },
  titleSm: { fontSize: 18, lineHeight: 26, fontWeight: 600, letterSpacing: '-0.01em' },
  body: { fontSize: 14, lineHeight: 22, fontWeight: 400, letterSpacing: '0' },
  bodySmall: { fontSize: 13, lineHeight: 20, fontWeight: 400, letterSpacing: '0' },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: 400, letterSpacing: '0' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: 500, letterSpacing: '0' },
  button: { fontSize: 14, lineHeight: 20, fontWeight: 500, letterSpacing: '0' }
} as const;

export type TypographyVariant = keyof typeof typography;
