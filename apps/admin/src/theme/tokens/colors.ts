export const colors = {
  primary: {
    50: '#EAF1FF',
    100: '#D9E6FF',
    500: '#2F6BFF',
    600: '#1F56E0',
    700: '#1848BD'
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    900: '#0F172A'
  },
  success: {
    50: '#ECFDF3',
    500: '#22C55E',
    600: '#16A34A'
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706'
  },
  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626'
  },
  info: {
    50: '#F0F9FF',
    500: '#0EA5E9',
    600: '#0284C7'
  }
} as const;

export const semanticColors = {
  actionPrimary: colors.primary[500],
  actionPrimaryHover: colors.primary[600],
  actionPrimaryActive: colors.primary[700],
  actionPrimarySoft: colors.primary[50],
  textPrimary: colors.neutral[900],
  textSecondary: colors.neutral[600],
  textMuted: colors.neutral[400],
  textInverse: colors.neutral[0],
  bgBase: colors.neutral[50],
  bgLayout: colors.neutral[50],
  bgSurface: colors.neutral[0],
  borderDefault: colors.neutral[200],
  borderSoft: colors.neutral[100]
} as const;
