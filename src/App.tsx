import { GameProvider, useGameState } from './hooks/useGameState';
import { QuoteIntro } from './components/QuoteIntro';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ShogunRoom } from './components/ShogunRoom';
import { JapanMap } from './components/JapanMap';
import { ChallengeView } from './components/ChallengeView';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

function GameContent() {
  const { user, currentView, loading, error, initializeUser } = useGameState();
  const [showQuoteIntro, setShowQuoteIntro] = useState(true);
  
  // 現在の画面を判定（簡素化）
  const getCurrentScreen = (): string => {
    if (showQuoteIntro) return 'intro';
    if (!user) return 'home';
    return currentView || 'home';
  };

  useEffect(() => {
    // 毎回イントロを表示（デバッグ用）
    setShowQuoteIntro(true);
  }, []);

  const handleQuoteIntroComplete = () => {
    setShowQuoteIntro(false);
    localStorage.setItem('samurai_has_seen_intro', 'true');
  };

  if (showQuoteIntro) {
    return (
      <QuoteIntro onComplete={handleQuoteIntroComplete} durationScale={1.3} />
    );
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

  if (!user) {
    return (
      <WelcomeScreen onStart={initializeUser} />
    );
  }

  const currentScreen = getCurrentScreen();

  switch (currentView) {
    case 'home':
      return (
        <ShogunRoom />
      );
    case 'map':
      return (
        <JapanMap />
      );
    case 'challenge':
      return (
        <ChallengeView />
      );
    default:
      return (
        <ShogunRoom />
      );
  }
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;