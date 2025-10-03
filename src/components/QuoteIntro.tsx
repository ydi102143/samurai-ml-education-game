import { useState, useEffect, useMemo } from 'react';
import { Swords, Quote } from 'lucide-react';

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

    // タイミング（ms）をまとめて定義し、倍率を適用（少しだけ早く）
    // 0: フェードイン開始, 1: タイプライタ開始(英日同時), 2:（未使用）, 3: 次セクション, 4: ローディング, 5: 完了
    const times = [700, 3200, 0, 8000, 12000, 16000].map((t, i) => i === 2 ? 0 : Math.round(t * durationScale));
    setT(() => setIsVisible(true), times[0]);
    setT(() => setCurrentStep(1), times[1]);
    // step2（日本語単独）はスキップ
    setT(() => setCurrentStep(3), times[3]);
    setT(() => setCurrentStep(4), times[4]);
    setT(() => onComplete(), times[5]);

    return () => {
      timerIds.forEach(id => clearTimeout(id));
    };
  }, [onComplete, durationScale]);

  // ステップ2：タイプライタ（英日同時）
  useEffect(() => {
    if (currentStep !== 1) return;
    let i = 0, j = 0, line = 0;
    const timer = setInterval(() => {
      if (line === 0) {
        if (i <= english[0].length) {
          // 英語の方が少し早く進む
          setTypedEng(prev => [english[0].slice(0, i), prev[1]]);
          setTypedJpn(prev => [japanese[0].slice(0, Math.min(j, japanese[0].length)), prev[1]]);
          i++; j = Math.floor(i * 0.5);
        } else {
          line = 1; i = 0; j = 0;
        }
      } else if (line === 1) {
        if (i <= english[1].length) {
          setTypedEng(prev => [prev[0], english[1].slice(0, i)]);
          setTypedJpn(prev => [prev[0], japanese[1].slice(0, Math.min(Math.floor(i * 0.55), japanese[1].length))]);
          i++;
        } else {
          clearInterval(timer);
          // タイプライタ完了後に著者名を表示（少し早めに表示）
          setTimeout(() => setShowAuthor(true), 1000);
        }
      }
    }, Math.max(50, 80 * durationScale));
    return () => clearInterval(timer);
  }, [currentStep, durationScale, english, japanese]);

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
    <div className="h-screen" style={{ background: 'var(--paper)' }}>
      <div className="w-full h-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* スキップボタン */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 text-sm px-3 py-1 rounded-lg transition-colors"
        style={{ color: 'var(--ink)', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--gold)' }}
        aria-label="イントロをスキップ"
      >
        スキップ
      </button>
      {/* 背景エフェクト（CRT風） */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 2px, transparent 3px)' }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.15), transparent 40%)' }} />
      </div>

      {/* 微細な光の粒子 */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 max-w-4xl w-full text-center transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* ステップ1: タイトル表示 */}
        {currentStep === 0 && (
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <div className="flex items-center justify-center mb-8">
              <Swords className="w-16 h-16" style={{ color: 'var(--accent-strong)' }} />
              <div className="ml-4 text-center">
                <h1 className="text-5xl md:text-7xl font-bold tracking-wider" style={{ color: 'white' }}>
                  samurAI
                </h1>
                <p className="mt-3 text-xl md:text-2xl font-light" style={{ color: 'var(--gold)' }}>
                  機械学習で天下統一
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ステップ2: 引用文表示 */}
        {currentStep === 1 && (
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="rounded-3xl p-8 md:p-12 border" style={{ background: 'rgba(10,25,47,0.85)', borderColor: 'var(--gold)' }}>
              <Quote className="w-10 h-10 mx-auto mb-6" style={{ color: 'var(--gold)' }} />
              <div className="space-y-3">
                <div>
                  <p className="text-3xl md:text-5xl font-light" style={{ color: 'var(--gold)' }}>{typedEng[0]}</p>
                  <p className="text-base md:text-lg opacity-95" style={{ color: '#e0e8f0' }}>{typedJpn[0]}</p>
                </div>
                <div>
                  <p className="text-3xl md:text-5xl font-light" style={{ color: 'var(--gold)' }}>{typedEng[1]}</p>
                  <p className="text-base md:text-lg opacity-95" style={{ color: '#e0e8f0' }}>{typedJpn[1]}</p>
                </div>
              </div>
              <cite 
                className={`block mt-6 text-sm md:text-base font-light transition-all duration-3000 ${
                  showAuthor ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`} 
                style={{ color: '#d0dae8' }}
              >
                — Jonathan Rosenberg
              </cite>
            </div>
          </div>
        )}

        {/* ステップ3: 日本語訳（不要のため非表示） */}

        {/* ステップ4: 説明文表示 */}
        {currentStep === 3 && (
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="rounded-3xl p-12 md:p-16 border" style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'var(--gold)' }}>
              <p className="text-xl md:text-3xl leading-relaxed font-light" style={{ color: 'white' }}>
                戦国時代の日本。各地の藩が抱える課題を、
                <br />
                <span className="font-medium" style={{ color: 'var(--gold)' }}>機械学習の力</span>で解決し、天下統一を目指せ！
              </p>
            </div>
          </div>
        )}

        {/* ステップ5: ローディング表示 */}
        {currentStep === 4 && (
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <div className="rounded-3xl p-12 md:p-16 border" style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'var(--gold)' }}>
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-4 h-4 rounded-full animate-bounce" style={{ background: 'white', animationDelay: '0s' }} />
                <div className="w-4 h-4 rounded-full animate-bounce" style={{ background: 'var(--gold)', animationDelay: '0.1s' }} />
                <div className="w-4 h-4 rounded-full animate-bounce" style={{ background: 'white', animationDelay: '0.2s' }} />
              </div>
              <p className="text-xl md:text-2xl font-light" style={{ color: 'white' }}>
                ゲームを準備中...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
