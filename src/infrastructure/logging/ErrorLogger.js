export class ErrorLogger {
  constructor() {
    this.isDevelopment = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development';
    this.errorLogServer = 'http://localhost:3000/log';
    this.isEnabled = this.isDevelopment && this.isLocalhost();
    
    // デバッグ情報をコンソールに出力
    console.log('ErrorLogger initialized:', {
      isDevelopment: this.isDevelopment,
      isLocalhost: this.isLocalhost(),
      isEnabled: this.isEnabled,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
      __DEV__: typeof __DEV__ !== 'undefined' ? __DEV__ : 'undefined',
      NODE_ENV: process.env.NODE_ENV
    });
  }

  // ローカルホストかどうかを判定
  isLocalhost() {
    // React Native環境の場合は常にローカル環境として扱う
    if (typeof window === 'undefined') return true;
    
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || 
                   hostname === '127.0.0.1' || 
                   hostname === '0.0.0.0' ||
                   hostname.startsWith('192.168.') ||
                   hostname.startsWith('10.') ||
                   hostname.startsWith('172.');
    
    console.log('isLocalhost check:', { hostname, isLocal });
    return isLocal;
  }

  // エラーをサーバーに送信
  async sendError(errorData) {
    console.log('sendError called:', { isEnabled: this.isEnabled, errorData });
    
    if (!this.isEnabled) {
      console.log('Error logging disabled, skipping send');
      return;
    }

    const payload = {
      ...errorData,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      sessionId: this.getSessionId()
    };
    
    console.log('Sending error to server:', payload);

    try {
      const response = await fetch(this.errorLogServer, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // 無限ループを防ぐため、元のconsole.warnを使用
        const originalWarn = console.warn.__original || console.warn;
        originalWarn('Failed to send error log:', response.status, response.statusText);
      } else {
        // 無限ループを防ぐため、元のconsole.logを使用
        const originalLog = console.log.__original || console.log;
        originalLog('Error log sent successfully');
      }
    } catch (error) {
      // エラーログ送信自体が失敗した場合は何もしない（無限ループを防ぐため）
      // console.error('Failed to send error to server:', error);
    }
  }

  // セッションIDを取得または生成
  getSessionId() {
    if (typeof window === 'undefined') return 'server-session';
    
    let sessionId = sessionStorage.getItem('error-log-session-id');
    if (!sessionId) {
      sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('error-log-session-id', sessionId);
    }
    return sessionId;
  }

  // JavaScriptエラーをログ
  logJavaScriptError(error, errorInfo = {}) {
    const errorData = {
      type: 'javascript-error',
      error: error.toString(),
      stack: error.stack || '',
      line: errorInfo.lineno,
      column: errorInfo.colno,
      filename: errorInfo.filename,
      componentStack: errorInfo.componentStack
    };

    this.sendError(errorData);
  }

  // React エラーバウンダリーエラーをログ
  logReactError(error, errorInfo) {
    const errorData = {
      type: 'react-error',
      error: error.toString(),
      stack: error.stack || '',
      componentStack: errorInfo.componentStack
    };

    this.sendError(errorData);
  }

  // Promise拒否エラーをログ
  logPromiseRejection(reason, promise) {
    const errorData = {
      type: 'unhandled-promise-rejection',
      error: 'Unhandled Promise Rejection: ' + (reason ? reason.toString() : 'Unknown'),
      stack: reason && reason.stack ? reason.stack : '',
      reason: reason
    };

    this.sendError(errorData);
  }

  // ネットワークエラーをログ
  logNetworkError(url, status, statusText, error) {
    const errorData = {
      type: 'network-error',
      error: `Network Error: ${status} ${statusText}`,
      stack: error ? error.stack : '',
      networkUrl: url,
      status: status,
      statusText: statusText
    };

    this.sendError(errorData);
  }

  // カスタムエラーをログ
  logCustomError(message, details = {}) {
    const errorData = {
      type: 'custom-error',
      error: message,
      details: details
    };

    this.sendError(errorData);
  }

  // デバッグ情報をログ
  logDebugInfo(message, data = {}) {
    if (!this.isEnabled) return;

    const errorData = {
      type: 'debug-info',
      error: message,
      debugData: data
    };

    this.sendError(errorData);
  }

  // テスト用のエラーログ送信
  testErrorLogging() {
    console.log('Testing error logging...');
    this.logCustomError('Test error from ErrorLogger', {
      test: true,
      timestamp: new Date().toISOString()
    });
  }
}