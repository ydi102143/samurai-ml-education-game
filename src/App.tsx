import { GameProvider, useGameState } from './hooks/useGameState';
import { QuoteIntro } from './components/QuoteIntro';
import { ShogunRoom } from './components/ShogunRoom';
import { JapanMap } from './components/JapanMap';
import { ChallengeView } from './components/ChallengeView';
import { SimpleOnlineBattleNew } from './components/SimpleOnlineBattleNew';
import { UserAuth } from './components/UserAuth';
import { userManager } from './utils/userManager';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

function GameContent() {
  const { user, currentView, loading, error, setCurrentView: handleSetCurrentView } = useGameState();
  const [showUserAuth, setShowUserAuth] = useState(false);
  const [showQuoteIntro, setShowQuoteIntro] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  useEffect(() => {
    try {
      console.log('GameContent useEffect開始');
      // ユーザー認証を最初に確認
      const user = userManager.getCurrentUser();
      console.log('userManager.getCurrentUser():', user);
      
      if (user) {
        setCurrentUser(user);
        // ユーザーがいる場合はイントロを表示
        setShowQuoteIntro(true);
      } else {
        // ユーザーがいない場合は認証画面を表示
        setShowUserAuth(true);
      }
    } catch (error) {
      console.error('GameContent useEffect エラー:', error);
    }
  }, []);

  // useGameStateのユーザーと同期
  useEffect(() => {
    if (currentUser && user) {
      console.log('ユーザー同期完了:', { currentUser, user });
    }
  }, [currentUser, user]);

  // デバッグ用ログ
  console.log('App.tsx state:', { 
    showUserAuth, 
    showQuoteIntro, 
    currentUser: !!currentUser, 
    user: !!user, 
    currentView,
    loading,
    error
  });

  const handleUserReady = (user: any) => {
    setCurrentUser(user);
    setShowUserAuth(false);
    // 認証後は直接メイン画面に遷移（イントロをスキップ）
    setShowQuoteIntro(false);
  };


  if (showUserAuth) {
    return <UserAuth onUserReady={handleUserReady} />;
  }

  if (showQuoteIntro) {
    return <QuoteIntro onComplete={() => setShowQuoteIntro(false)} durationScale={1.3} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4" />
          <p className="text-2xl text-yellow-100 font-bold">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-orange-900 flex items-center justify-center p-4">
        <div className="max-w-md bg-white/95 rounded-lg shadow-2xl p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-4">エラーが発生しました</h2>
          <p className="text-red-800 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            <span>ページを再読み込み</span>
          </button>
        </div>
      </div>
    );
  }

  // 認証されたユーザーがいる場合はメイン画面を表示
  if (currentUser || user) {
    console.log('App.tsx currentView:', currentView);
    console.log('App.tsx user:', user);
    console.log('App.tsx currentUser:', currentUser);
        // currentViewに基づいて適切なコンポーネントを表示
        if (currentView === 'map') {
          console.log('日本地図を表示します');
          return <JapanMap />;
        } else if (currentView === 'challenge') {
          console.log('チャレンジ画面を表示します');
          return <ChallengeView />;
        } else if ((currentView as string) === 'online') {
          console.log('オンライン対戦画面を表示します');
          return <SimpleOnlineBattleNew onBack={() => handleSetCurrentView('home')} />;
        } else {
          console.log('ホーム画面を表示します');
          return <ShogunRoom />;
        }
  }

  // ユーザーがいない場合は認証画面を表示
  return <UserAuth onUserReady={handleUserReady} />;
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;