import React from 'react';
import { Text, View } from 'react-native';
import { ErrorLogger } from '../../infrastructure/logging/ErrorLogger.js';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.errorLogger = new ErrorLogger();
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    
    // エラーログを送信
    this.errorLogger.logReactError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: 20,
          backgroundColor: '#f8f9fa'
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            marginBottom: 10,
            color: '#dc3545'
          }}>
            申し訳ございません
          </Text>
          <Text style={{ 
            fontSize: 14, 
            textAlign: 'center',
            color: '#6c757d',
            marginBottom: 20
          }}>
            予期しないエラーが発生しました。{'\n'}
            アプリを再起動してください。
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={{ 
              fontSize: 12, 
              color: '#dc3545',
              textAlign: 'center',
              fontFamily: 'monospace'
            }}>
              {this.state.error.toString()}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}