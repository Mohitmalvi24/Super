export const Theme = {
  colors: {
    primary: '#1B5E20',
    primaryLight: '#E8F5E9',
    primaryDark: '#0D3B12',
    primaryDisabled: '#A5D6A7',
    accent: '#F59E0B',
    accentLight: '#FEF3C7',
    background: '#F5F5F0',
    surface: '#FFFFFF',
    surfaceElevated: '#FAFAF7',
    text: {
      primary: '#1A1A1A',
      secondary: '#4A4A4A',
      muted: '#8A8A8A',
      inverse: '#FFFFFF',
    },
    border: '#E5E5E0',
    borderLight: '#F0F0EB',
    status: {
      mastered: {
        bg: '#E8F5E9',
        border: '#4CAF50',
        text: '#1B5E20',
      },
      learning: {
        bg: '#FFF3E0',
        border: '#FF9800',
        text: '#E65100',
      },
      notStarted: {
        bg: '#FFFFFF',
        border: '#E5E5E0',
        text: '#4A4A4A',
      },
      skipped: {
        bg: '#F5F5F5',
        border: '#BDBDBD',
        text: '#757575',
      }
    },
    danger: '#D32F2F',
    success: '#2E7D32',
    achievement: {
      bg: '#FFF8E1',
      title: '#F57F17',
      subtitle: '#F9A825',
    },
    hero: {
      gradientStart: '#1B5E20',
      gradientEnd: '#2E7D32',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 999,
  },
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};
