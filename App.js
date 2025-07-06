import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './src/presentation/theme';
import MainNavigator from './src/presentation/navigation/MainNavigator';
import { ErrorBoundary } from './src/presentation/components/ErrorBoundary';
// import { setupErrorHandlers } from './src/infrastructure/logging/setupErrorHandlers';

// エラーハンドラーを一時的に無効化
// setupErrorHandlers();

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <MainNavigator />
          <StatusBar style="auto" />
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
