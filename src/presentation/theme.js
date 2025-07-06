import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3B82F6',
    secondary: '#6B7280',
    tertiary: '#8B5CF6',
    surface: '#F8FAFC',
    surfaceVariant: '#E2E8F0',
    onSurface: '#1F2937',
    onSurfaceVariant: '#4B5563',
    outline: '#D1D5DB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  fonts: {
    ...DefaultTheme.fonts,
  },
  roundness: 8,
};