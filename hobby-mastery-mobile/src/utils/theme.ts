const palette = {
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  sky: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
  },
  violet: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
  },
  rose: {
    400: '#FB7185',
    500: '#F43F5E',
  },
} as const;

export const Theme = {
  colors: {
    primary: palette.slate[900],
    primaryLight: palette.slate[800],
    accent: palette.amber[400],
    accentDark: palette.amber[600],

    background: palette.slate[50],
    surface: '#FFFFFF',
    surfaceElevated: palette.slate[100],

    text: {
      primary: palette.slate[900],
      secondary: palette.slate[600],
      muted: palette.slate[400],
      inverse: '#FFFFFF',
    },

    border: palette.slate[200],
    borderLight: palette.slate[100],

    success: palette.emerald[500],
    successLight: palette.emerald[50],
    successBorder: palette.emerald[200],
    successDark: palette.emerald[700],

    danger: palette.red[500],
    dangerLight: palette.red[50],

    info: palette.sky[400],
    infoLight: palette.sky[50],
    infoBorder: palette.sky[200],
    infoDark: palette.sky[600],

    warning: palette.amber[500],
    warningLight: palette.amber[50],

    palette,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 999,
  },

  typography: {
    displayLg: { fontSize: 36, fontWeight: '800' as const, letterSpacing: -0.5 },
    displayMd: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.3 },
    displaySm: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.3 },
    headingLg: { fontSize: 18, fontWeight: '700' as const },
    headingMd: { fontSize: 16, fontWeight: '700' as const },
    headingSm: { fontSize: 14, fontWeight: '700' as const },
    bodyLg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 26 },
    bodyMd: { fontSize: 14, fontWeight: '500' as const, lineHeight: 22 },
    bodySm: { fontSize: 12, fontWeight: '500' as const },
    label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1 },
    caption: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.5 },
  },

  shadow: {
    sm: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 0,
    },
    md: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 0,
    },
    lg: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 0,
    },
  },
} as const;
