import { ErrorLogger } from './ErrorLogger.js';
import { getHttpService } from '../http/HttpService.js';

let errorLogger = null;
let httpService = null;

export function setupErrorHandlers() {
  errorLogger = new ErrorLogger();
  httpService = getHttpService(); // HttpServiceを初期化してaxiosインターセプターを設定

  // React Nativeのグローバルエラーハンドラー（開発時のみ）
  if (errorLogger.isEnabled && typeof ErrorUtils !== 'undefined') {
    console.log('Setting up React Native ErrorUtils handler');
    const originalHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('Global Error Handler:', error, 'isFatal:', isFatal);
      
      errorLogger.logJavaScriptError(error, {
        isFatal,
        type: 'react-native-global-error'
      });

      // 元のハンドラーも呼び出す
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  } else {
    console.log('ErrorUtils not available or logging disabled');
  }

  // Web環境でのグローバルエラーハンドラー
  if (typeof window !== 'undefined' && errorLogger.isEnabled) {
    console.log('Setting up web error handlers');
    
    // JavaScriptエラー
    window.addEventListener('error', function(event) {
      console.error('Global Error caught:', event.error || event.message);
      
      errorLogger.logJavaScriptError(
        event.error || new Error(event.message),
        {
          lineno: event.lineno,
          colno: event.colno,
          filename: event.filename
        }
      );
    });

    // Promise拒否エラー
    window.addEventListener('unhandledrejection', function(event) {
      console.error('Unhandled Promise Rejection:', event.reason);
      
      errorLogger.logPromiseRejection(event.reason, event.promise);
    });

    // 開発時のテスト用関数をグローバルに公開
    window.testErrorLogging = () => {
      console.log('Manual error test triggered');
      errorLogger.testErrorLogging();
    };
    
    window.triggerTestError = () => {
      console.log('Triggering test error...');
      throw new Error('This is a test error from window.triggerTestError()');
    };
    
    console.log('Test functions available: window.testErrorLogging(), window.triggerTestError()');
  }

  console.log('Error handlers setup completed. Logging enabled:', errorLogger.isEnabled);
  console.log('HttpService initialized for network error handling');
}

// エラーロガーインスタンスを取得
export function getErrorLogger() {
  if (!errorLogger) {
    errorLogger = new ErrorLogger();
  }
  return errorLogger;
}

// 手動でエラーをログする関数
export function logError(error, context = {}) {
  const logger = getErrorLogger();
  logger.logCustomError(error.toString(), {
    stack: error.stack,
    context
  });
}

// ネットワークエラーをログする関数
export function logNetworkError(url, status, error) {
  const logger = getErrorLogger();
  logger.logNetworkError(url, status, '', error);
}

// デバッグ情報をログする関数
export function logDebug(message, data = {}) {
  const logger = getErrorLogger();
  logger.logDebugInfo(message, data);
}