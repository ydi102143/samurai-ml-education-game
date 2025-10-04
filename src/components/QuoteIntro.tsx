import { useState, useEffect, useMemo } from 'react';

interface Props {
  onComplete: () => void;
  /** アニメーション全体の時間倍率（1.0が標準、1.5でゆっくり） */
  durationScale?: number;
}

export function QuoteIntro({ onComplete, durationScale = 1.3 }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const english = useMemo(() => [
    'Data is the sword of the 21st century,',
    'those who wield it well, the Samurai.'
  ], []);
  const japanese = useMemo(() => [
    'データは21世紀の刀、',
    'それを使いこなす者こそ、サムライ。'
  ], []);
  const [typedEng, setTypedEng] = useState(['', '']);
  const [typedJpn, setTypedJpn] = useState(['', '']);
  const [showAuthor, setShowAuthor] = useState(false);
  const [typingCompleted, setTypingCompleted] = useState(false);

  useEffect(() => {
    // 視覚効果を減らす設定に配慮
    const prefersReduced = typeof window !== 'undefined' &&
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      onComplete();
      return;
    }

    const timerIds: number[] = [];
    const setT = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timerIds.push(id);
    };

    // タイミング（ms）をまとめて定義し、倍率を適用
    // 0: タイプライタ開始(英日同時)
    const times = [200].map(t => Math.round(t * durationScale));
    setT(() => setIsVisible(true), times[0]);
    setT(() => setCurrentStep(1), times[0]);

    return () => {
      timerIds.forEach(id => clearTimeout(id));
    };
  }, [durationScale, onComplete]);

  // ステップ2：タイプライタ（英日同時）
  useEffect(() => {
    if (currentStep !== 1) return;
    let i = 0, j = 0, line = 0;
    const timer = setInterval(() => {
      if (line === 0) {
        if (i <= english[0].length) {
          // 英語の方が早く進む
          setTypedEng(prev => [english[0].slice(0, i), prev[1]]);
          setTypedJpn(prev => [japanese[0].slice(0, Math.min(j, japanese[0].length)), prev[1]]);
          i++; j = Math.floor(i * 0.3);
        } else {
          line = 1; i = 0; j = 0;
        }
      } else if (line === 1) {
        if (i <= english[1].length) {
          setTypedEng(prev => [prev[0], english[1].slice(0, i)]);
          setTypedJpn(prev => [prev[0], japanese[1].slice(0, Math.min(Math.floor(i * 0.43), japanese[1].length))]);
          i++;
        } else {
          clearInterval(timer);
          setTypingCompleted(true);
          // タイプライタ完了後に著者名を表示（少し早めに表示）
          setTimeout(() => setShowAuthor(true), 1000);
        }
      }
    }, Math.max(40, 70 * durationScale));
    return () => clearInterval(timer);
  }, [currentStep, durationScale, english, japanese]);

  // タイプライタ完了後の画面遷移制御
  useEffect(() => {
    if (!typingCompleted) return;
    
    const timerIds: number[] = [];
    const setT = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timerIds.push(id);
    };

    // タイプライタ完了後の流れ
    setT(() => onComplete(), 2500); // 著者名表示後2.5秒で完了

    return () => {
      timerIds.forEach(id => clearTimeout(id));
    };
  }, [typingCompleted, onComplete]);

  // Escキーでスキップ
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onComplete]);

  const handleSkip = () => {
    if (isSkipping) return;
    setIsSkipping(true);
    onComplete();
  };

  return (
    <div className="h-screen" style={{ background: '#404040' }}>
      <div className="w-full h-full flex items-center justify-center p-4 relative overflow-hidden">
        {/* スキップボタン */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-sm px-3 py-1 rounded-lg transition-colors"
          style={{ color: 'white', background: 'rgba(255,255,255,0.2)', border: '1px solid var(--gold)' }}
          aria-label="イントロをスキップ"
        >
          スキップ
        </button>
        
        {/* テレビノイズ風背景 */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255,255,255,0.08) 0%, transparent 50%),
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              rgba(255,255,255,0.02) 1px,
              transparent 2px,
              rgba(0,0,0,0.02) 3px,
              transparent 4px
            )
          `,
          animation: 'noise 0.2s steps(8) infinite'
        }} />

        {/* 微細な光の粒子 */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full animate-pulse"
              style={{
                background: 'var(--gold)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>

        {/* メインコンテンツ */}
        <div className={`text-center z-10 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>

          {currentStep === 1 && (
            <div className="fixed inset-0 w-full h-full flex items-center justify-center" style={{
              background: '#404040'
            }}>
              {/* 黒色ノイズエフェクト - 画面全体 */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    transparent 0px,
                    rgba(0,0,0,0.3) 0.5px,
                    transparent 1px,
                    rgba(0,0,0,0.4) 1.5px,
                    transparent 2px,
                    rgba(0,0,0,0.2) 2.5px,
                    transparent 3px,
                    rgba(0,0,0,0.5) 3.5px,
                    transparent 4px,
                    rgba(0,0,0,0.1) 4.5px,
                    transparent 5px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    transparent 0px,
                    rgba(0,0,0,0.25) 0.3px,
                    transparent 0.8px,
                    rgba(0,0,0,0.35) 1.3px,
                    transparent 1.8px,
                    rgba(0,0,0,0.15) 2.3px,
                    transparent 2.8px,
                    rgba(0,0,0,0.45) 3.3px,
                    transparent 3.8px
                  ),
                  repeating-linear-gradient(
                    45deg,
                    transparent 0px,
                    rgba(0,0,0,0.2) 0.2px,
                    transparent 0.6px,
                    rgba(0,0,0,0.3) 1.1px,
                    transparent 1.6px,
                    rgba(0,0,0,0.1) 2.1px,
                    transparent 2.6px
                  ),
                  repeating-linear-gradient(
                    135deg,
                    transparent 0px,
                    rgba(0,0,0,0.18) 0.1px,
                    transparent 0.5px,
                    rgba(0,0,0,0.28) 1px,
                    transparent 1.5px,
                    rgba(0,0,0,0.08) 2px,
                    transparent 2.5px
                  )
                `,
                animation: 'tvNoise 0.005s steps(1) infinite'
              }} />
              
              {/* 追加の黒色ノイズ */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `
                  radial-gradient(circle at 5% 10%, rgba(0,0,0,0.4) 0%, transparent 0.2px),
                  radial-gradient(circle at 15% 25%, rgba(0,0,0,0.5) 0%, transparent 0.1px),
                  radial-gradient(circle at 25% 40%, rgba(0,0,0,0.3) 0%, transparent 0.3px),
                  radial-gradient(circle at 35% 55%, rgba(0,0,0,0.6) 0%, transparent 0.15px),
                  radial-gradient(circle at 45% 70%, rgba(0,0,0,0.35) 0%, transparent 0.4px),
                  radial-gradient(circle at 55% 15%, rgba(0,0,0,0.7) 0%, transparent 0.08px),
                  radial-gradient(circle at 65% 30%, rgba(0,0,0,0.25) 0%, transparent 0.6px),
                  radial-gradient(circle at 75% 45%, rgba(0,0,0,0.55) 0%, transparent 0.2px),
                  radial-gradient(circle at 85% 60%, rgba(0,0,0,0.45) 0%, transparent 0.35px),
                  radial-gradient(circle at 95% 75%, rgba(0,0,0,0.65) 0%, transparent 0.12px)
                `,
                animation: 'tvNoise 0.003s steps(1) infinite'
              }} />
              
              <div className="space-y-8 w-full px-4 relative z-10" style={{ maxWidth: '90vw' }}>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="text-3xl font-bold leading-relaxed" style={{ 
                      color: '#ffffff',
                      textShadow: '0 0 5px #ffffff, 0 0 10px #ffffff, 0 0 15px #ffffff, 0 0 20px #ffffff',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      {typedEng[0]}
                    </div>
                    <div className="text-lg font-medium leading-relaxed" style={{ 
                      color: '#cccccc',
                      textShadow: '0 0 3px #cccccc, 0 0 6px #cccccc, 0 0 9px #cccccc',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}>
                      {typedJpn[0]}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold leading-relaxed" style={{ 
                      color: '#ffffff',
                      textShadow: '0 0 5px #ffffff, 0 0 10px #ffffff, 0 0 15px #ffffff, 0 0 20px #ffffff',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      {typedEng[1]}
                    </div>
                    <div className="text-lg font-medium leading-relaxed" style={{ 
                      color: '#cccccc',
                      textShadow: '0 0 3px #cccccc, 0 0 6px #cccccc, 0 0 9px #cccccc',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}>
                      {typedJpn[1]}
                    </div>
                  </div>
                </div>
                
                {showAuthor && (
                  <div className={`transition-all duration-3000 mt-6 ${showAuthor ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <p className="text-xl font-light text-center" style={{ 
                      color: '#999999',
                      textShadow: '0 0 3px #999999, 0 0 6px #999999',
                      fontFamily: 'monospace'
                    }}>
                      — Jonathan Rosenberg
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}