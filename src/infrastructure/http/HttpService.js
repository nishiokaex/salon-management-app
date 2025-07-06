import axios from 'axios';
import { ErrorLogger } from '../logging/ErrorLogger.js';

export class HttpService {
  constructor() {
    this.isDevelopment = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development';
    this.isEnabled = this.isDevelopment && this.isLocalhost();
    this.errorLogger = new ErrorLogger();
    
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  // ローカルホストかどうかを判定
  isLocalhost() {
    if (typeof window === 'undefined') return true;
    
    const hostname = window.location.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname === '0.0.0.0' ||
           hostname.startsWith('192.168.') ||
           hostname.startsWith('10.') ||
           hostname.startsWith('172.');
  }

  // ErrorLoggerのインスタンスを設定
  setErrorLogger(errorLogger) {
    this.errorLogger = errorLogger;
  }

  // axiosインスタンスを作成
  createAxiosInstance() {
    const config = {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    return axios.create(config);
  }

  // インターセプターを設定
  setupInterceptors() {
    // リクエストインターセプター
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.isEnabled) {
          console.log('HTTP Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL || ''}${config.url}`,
          });
        }
        return config;
      },
      (error) => {
        if (this.isEnabled && this.errorLogger) {
          this.errorLogger.logNetworkError(
            error.config?.url || 'Unknown URL',
            0,
            'Request Setup Error',
            error
          );
        }
        return Promise.reject(error);
      }
    );

    // レスポンスインターセプター
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (this.isEnabled) {
          console.log('HTTP Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.config?.url,
            method: response.config?.method?.toUpperCase(),
          });
        }
        return response;
      },
      (error) => {
        if (this.isEnabled && this.errorLogger) {
          const url = error.config?.url || 'Unknown URL';
          const status = error.response?.status || 0;
          const statusText = error.response?.statusText || error.message;
          
          this.errorLogger.logNetworkError(url, status, statusText, error);
        }
        return Promise.reject(error);
      }
    );
  }

  // GET リクエスト
  async get(url, config = {}) {
    return this.axiosInstance.get(url, config);
  }

  // POST リクエスト
  async post(url, data, config = {}) {
    return this.axiosInstance.post(url, data, config);
  }

  // PUT リクエスト
  async put(url, data, config = {}) {
    return this.axiosInstance.put(url, data, config);
  }

  // DELETE リクエスト
  async delete(url, config = {}) {
    return this.axiosInstance.delete(url, config);
  }

  // PATCH リクエスト
  async patch(url, data, config = {}) {
    return this.axiosInstance.patch(url, data, config);
  }

  // 直接axiosインスタンスを取得（必要に応じて）
  getAxiosInstance() {
    return this.axiosInstance;
  }

  // ベースURLを設定
  setBaseURL(baseURL) {
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  // 共通ヘッダーを設定
  setCommonHeader(name, value) {
    this.axiosInstance.defaults.headers.common[name] = value;
  }

  // 共通ヘッダーを削除
  removeCommonHeader(name) {
    delete this.axiosInstance.defaults.headers.common[name];
  }
}

// シングルトンインスタンス
let httpServiceInstance = null;

export function getHttpService() {
  if (!httpServiceInstance) {
    httpServiceInstance = new HttpService();
  }
  return httpServiceInstance;
}

export default HttpService;