# CLAUDE.md

このファイルは、このリポジトリ内のコードを操作する際に Claude Code (claude.ai/code) にガイダンスを提供します。

## 開発日誌を作成すること

`diary/yyyy-mm-dd_hhmm.md`のファイルを作成し、開発日誌を作成してください。内容は以下の通りです。

- **日付**: yyyy-mm-dd hh:mm
- **作業内容**:
  - 何をしたか
  - どのような問題が発生したか
  - どのように解決したか
- **次回の予定**:
- **感想**: 気分や愚痴を書く

## 開発コマンド

- `npm run web` - Expo Web開発サーバーを起動

## 技術要件

- Expo SDK v52
- Zustand (Class構文を使ったストア定義)
- @react-native-async-storage/async-storage (データ永続化)
- @react-navigation/native react-native-screens react-native-safe-area-context (ナビゲーション)
- クリーンアーキテクチャ (Domain Layer、Infrastructure Layer、Presentation Layer)

## 構成管理

- ソースコードはgithubで管理します
- コミットは、feature/[エンハンス内容] という名前の機能ブランチのみに行う

## 機能開発プロセス

1. feature/[エンハンス内容] という名前の機能ブランチを作成する
2. 機能を開発する
3. Web版でビルドして動作確認し、正しく動作するまで修正する
4. 変更内容をコミットする
5. ghコマンドでPull Requestを作成する。マージで機能ブランチを削除する設定で作成する。

### 開発ガイドライン

- ドキュメントやコメントは日本語で記述
- セキュリティ・パフォーマンス・保守性を重視した設計
