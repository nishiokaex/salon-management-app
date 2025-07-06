import { ErrorLogger } from './ErrorLogger.js';

let errorLogger = null;

export function setupErrorHandlers() {
  errorLogger = new ErrorLogger();

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

  // React NativeのLogBoxエラーハンドリング
  if (errorLogger.isEnabled && typeof global !== 'undefined' && global.HermesInternal) {
    console.log('Setting up React Native Hermes error handling');
  }

  // Web環境でのグローバルエラーハンドラー
  if (typeof window !== 'undefined' && errorLogger.isEnabled) {
    console.log('Setting up web error handlers');
    
    // JavaScriptエラー
    window.addEventListener('error', function(event) {
      console.error('Global Error caught:', event.error || event.message);
      console.log('Event details:', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
      
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

    // XMLHttpRequestエラーのインターセプト
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._errorLoggerUrl = url;
      this._errorLoggerMethod = method;
      return originalXHROpen.apply(this, [method, url, ...args]);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      this.addEventListener('error', () => {
        if (errorLogger.isEnabled) {
          errorLogger.logNetworkError(
            this._errorLoggerUrl,
            this.status,
            this.statusText,
            new Error('XMLHttpRequest failed')
          );
        }
      });

      this.addEventListener('load', () => {
        if (this.status >= 400 && errorLogger.isEnabled) {
          errorLogger.logNetworkError(
            this._errorLoggerUrl,
            this.status,
            this.statusText,
            new Error(`HTTP ${this.status}: ${this.statusText}`)
          );
        }
      });

      return originalXHRSend.apply(this, args);
    };

    // Fetchエラーのインターセプト
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
      return originalFetch(url, options)
        .then(response => {
          if (!response.ok && errorLogger.isEnabled) {
            errorLogger.logNetworkError(
              url,
              response.status,
              response.statusText,
              new Error(`Fetch failed: ${response.status} ${response.statusText}`)
            );
          }
          return response;
        })
        .catch(error => {
          if (errorLogger.isEnabled) {
            errorLogger.logNetworkError(
              url,
              0,
              'Network Error',
              error
            );
          }
          throw error;
        });
    };
  }

  console.log('Error handlers setup completed. Logging enabled:', errorLogger.isEnabled);
  
  // 開発時のテスト用関数をグローバルに公開
  if (errorLogger.isEnabled && typeof window !== 'undefined') {
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

  // console.error と console.warn をインターセプト（React Nativeの警告をキャッチ）
  if (errorLogger.isEnabled) {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;
    
    // 元の関数への参照を保存
    console.error.__original = originalConsoleError;
    console.warn.__original = originalConsoleWarn;
    console.log.__original = originalConsoleLog;
    
    // 無限ループを防ぐためのフラグ
    let isLoggingError = false;

    console.error = function(...args) {
      // 元のconsole.errorを呼び出す
      originalConsoleError.apply(console, args);
      
      // 無限ループを防ぐ
      if (isLoggingError) return;
      
      const errorMessage = args.join(' ');
      
      // エラーロガー自体のエラーは無視
      if (errorMessage.includes('Failed to send error to server') || 
          errorMessage.includes('ErrorLogger')) {
        return;
      }
      
      // React NativeのViewエラーなど特定のエラーをキャッチ
      if (errorMessage.includes('Unexpected text node') || 
          errorMessage.includes('text node cannot be a child') ||
          errorMessage.includes('Warning:')) {
        
        isLoggingError = true;
        
        try {
          originalConsoleError('Intercepted console.error:', errorMessage);
          
          errorLogger.logCustomError('Console Error', {
            type: 'console-error',
            message: errorMessage,
            args: args,
            stack: new Error().stack
          });
        } catch (logError) {
          // ログ処理でエラーが発生した場合は何もしない
        } finally {
          isLoggingError = false;
        }
      }
    };

    console.warn = function(...args) {
      // 元のconsole.warnを呼び出す
      originalConsoleWarn.apply(console, args);
      
      // 無限ループを防ぐ
      if (isLoggingError) return;
      
      const warnMessage = args.join(' ');
      
      // 重要な警告をログサーバーに送信
      if (warnMessage.includes('Warning:') || 
          warnMessage.includes('Deprecated') ||
          warnMessage.includes('Failed')) {
        
        isLoggingError = true;
        
        try {
          originalConsoleError('Intercepted console.warn:', warnMessage);
          
          errorLogger.logCustomError('Console Warning', {
            type: 'console-warning',
            message: warnMessage,
            args: args,
            stack: new Error().stack
          });
        } catch (logError) {
          // ログ処理でエラーが発生した場合は何もしない
        } finally {
          isLoggingError = false;
        }
      }
    };
  }
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