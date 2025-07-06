# エラーログ機能

このアプリには、ローカル開発時のみ有効になるエラーログ送信機能が組み込まれています。

## 機能概要

- **ローカル開発時のみ動作**: `localhost`、`127.0.0.1`、プライベートIPアドレスからのアクセス時のみ有効
- **自動エラー収集**: JavaScriptエラー、React Native エラー、Promise拒否、ネットワークエラーを自動収集
- **エラーログサーバー**: `http://localhost:3000/log` にPOST送信

## エラーログサーバーの設定

エラーログを受信するローカルサーバーが `http://localhost:3000/log` で起動している必要があります。

### 使用方法

1. **自動エラー収集**
   - アプリが自動的にエラーを検出し、ログサーバーに送信します
   - 開発環境でのみ動作するため、本番環境では無効です

2. **手動エラーログ送信**
   ```javascript
   import { logError, logNetworkError, logDebug } from './src/infrastructure/logging/setupErrorHandlers';

   // 一般的なエラーをログ
   try {
     // エラーが発生する可能性のあるコード
   } catch (error) {
     logError(error, { context: 'additional info' });
   }

   // ネットワークエラーをログ
   logNetworkError('https://api.example.com', 500, new Error('Server Error'));

   // デバッグ情報をログ
   logDebug('User action', { userId: 123, action: 'button_click' });
   ```

## 送信されるデータ形式

```json
{
  "type": "javascript-error",
  "error": "TypeError: Cannot read property 'name' of undefined",
  "stack": "at CustomerScreen.js:212:43...",
  "url": "http://localhost:8081",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "sessionId": "session-1642248600000-abc123",
  "line": 212,
  "column": 43,
  "filename": "CustomerScreen.js"
}
```

## エラータイプ

1. **javascript-error**: 一般的なJavaScriptエラー
2. **react-error**: React ErrorBoundaryで捕捉されたエラー
3. **unhandled-promise-rejection**: 未処理のPromise拒否
4. **network-error**: HTTPリクエストエラー
5. **custom-error**: 手動でログしたカスタムエラー
6. **debug-info**: デバッグ情報

## 開発時の動作確認

1. エラーログサーバーを起動
2. アプリでエラーを発生させる
3. ローカルサーバーでログを確認

## 注意事項

- **プライバシー**: ローカル開発時のみ動作し、本番環境では無効
- **パフォーマンス**: エラーログ送信は非同期で行われ、アプリの動作に影響しません
- **ログサーバー**: 外部のログサーバーが利用できない場合は、コンソールにエラーメッセージが表示されます