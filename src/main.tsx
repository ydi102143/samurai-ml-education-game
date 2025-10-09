import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SecurityManager } from './utils/securityManager';

// アプリケーション起動時の初期化
async function initializeApp() {
  try {
    // セキュリティチェック
    SecurityManager.showSecurityWarning();
    
    // 本番環境では環境変数が必須
    if (import.meta.env.PROD) {
      SecurityManager.checkProductionSecurity();
    }

    console.log('🚀 アプリケーション初期化開始...');
    console.log('🎯 アプリケーション初期化完了');
  } catch (error) {
    console.error('アプリケーション初期化エラー:', error);
    // 本番環境ではアプリケーションを停止
    if (import.meta.env.PROD) {
      throw error;
    }
  }
}

// 初期化を実行
initializeApp();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
