import { useState, useEffect, useMemo } from 'react';
import { Swords } from 'lucide-react';

interface Props {
  onComplete: () => void;
  /** アニメーション全体の時間倍率（1.0が標準、1.5でゆっくり） */
  durationScale?: number;
}

export function QuoteIntro({ onComplete, durationScale = 1.3 }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [titleFadeIn, setTitleFadeIn] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const english = useMemo(() => [
    'Data is the sword of the 21st century,',
    'those who wield it well, the Samurai.'
  ], []);
  const japanese = useMemo(() => [
    'データは21世紀の刀、',
    'それを使いこなす者こそ、侍。'
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
    setT(() => setCurrentStep(2), 2500); // 著者名表示後2.5秒でタイトル表示
    setT(() => setTitleFadeIn(true), 2500); // タイトル表示と同時にフェードイン開始
    setT(() => onComplete(), 11500); // タイトル表示後9秒で完了（6秒のフェードイン + 3秒の表示）

    return () => {
      timerIds.forEach(id => clearTimeout(id));
    };
  }, [typingCompleted, onComplete]);

  // タイトル表示画面でフェードインを確実に開始
  useEffect(() => {
    if (currentStep === 2) {
      console.log('タイトル表示画面に到達。フェードインを開始します...');
      // タイトル画面が確実に表示されてからフェードイン開始
      setTimeout(() => {
        console.log('フェードインを開始します');
        console.log('titleFadeIn状態:', titleFadeIn);
        setTitleVisible(true);
        setTimeout(() => {
          setTitleFadeIn(true);
          console.log('setTitleFadeIn(true)を実行しました');
        }, 100);
      }, 500);
    }
  }, [currentStep]);

  // タイトル表示画面で拍子木の音を再生（確実な自動再生）
  useEffect(() => {
    if (currentStep === 2) {
      console.log('タイトル表示画面に到達しました。確実に自動再生を実行します...');
      
      // 確実な自動再生を実行
      const playAudioReliably = () => {
        try {
          const audio = new Audio('/audio/拍子木3.mp3');
          audio.volume = 0.8;
          audio.preload = 'auto';
          
          // 音声が読み込まれるまで待機
          audio.addEventListener('canplaythrough', () => {
            console.log('音声ファイルの読み込み完了。再生を開始します...');
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.then(() => {
                console.log('拍子木の音が自動再生されました！');
                setAudioPlayed(true);
              }).catch(() => {
                console.log('自動再生に失敗しました。ユーザーインタラクションをシミュレートします...');
                
                // ユーザーインタラクションをシミュレート
                setTimeout(() => {
                  // ページをクリックしてユーザーインタラクションをシミュレート
                  document.body.click();
                  
                  setTimeout(() => {
                    const retryAudio = new Audio('/audio/拍子木3.mp3');
                    retryAudio.volume = 0.8;
                    retryAudio.play().then(() => {
                      console.log('シミュレート後の再生に成功しました！');
                      setAudioPlayed(true);
                    }).catch(() => {
                      console.log('シミュレート後も再生失敗。スキップボタンで音声を再生してください。');
                    });
                  }, 100);
                }, 200);
              });
            }
          });
          
          // 読み込みエラーの場合
          audio.addEventListener('error', () => {
            console.log('音声ファイルの読み込みに失敗しました。直接再生を試行します...');
            audio.play().catch(() => {
              console.log('直接再生も失敗しました。スキップボタンで音声を再生してください。');
            });
          });
          
        } catch (error) {
          console.log('音声の初期化に失敗しました:', error);
        }
      };
      
      // タイトル表示画面の瞬間に1回だけ自動再生
      setTimeout(() => {
        console.log('タイトル表示画面で音声を1回だけ自動再生します...');
        playAudioReliably();
      }, 100);
    }
  }, [currentStep]);

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
    console.log('スキップボタンがクリックされました');
    
    if (isSkipping) {
      console.log('既にスキップ処理中です');
      return;
    }
    
    setIsSkipping(true);
    console.log('スキップ処理を開始します');
    
    // 音声を再生（ユーザーインタラクションとして確実に再生される）
    try {
      const audio = new Audio('/audio/拍子木3.mp3');
      audio.volume = 0.8;
      audio.preload = 'auto';
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('スキップ時に拍子木の音が再生されました！');
          setAudioPlayed(true);
        }).catch(err => {
          console.warn('スキップ時の音声再生に失敗:', err);
        });
      }
    } catch (error) {
      console.warn('スキップ時の音声初期化に失敗:', error);
    }
    
    // 少し遅延してから完了処理を実行
    setTimeout(() => {
      console.log('イントロを完了します');
      onComplete();
    }, 100);
  };

  return (
    <div className="h-screen" style={{ background: '#404040' }}>
      <div className="w-full h-full flex items-center justify-center p-4 relative overflow-hidden">
        {/* スキップボタン */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-sm px-3 py-1 rounded-lg transition-colors"
          style={{ color: 'white', background: 'rgba(255,255,255,0.2)', border: '1px solid var(--gold)' }}
          aria-label="イントロをスキップ（音声再生）"
        >
          {currentStep === 2 && !audioPlayed ? '音声付きでスキップ' : 'スキップ'}
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

          {currentStep === 2 && (
            <div className="fixed inset-0 w-full h-full flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)'
            }}>
              {/* 動く桜の花びらエフェクト - 40個版 */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(40)].map((_, i) => {
                  const size = Math.random() * 7 + 4; // 4-11px
                  const startX = Math.random() * 120 - 10; // 画面外から開始
                  const startY = Math.random() * 30 - 30; // 斜め上から
                  const duration = 6; // 固定6秒
                  const delay = Math.random() * 3; // 0-3秒の遅延（短縮）
                  const rotation = Math.random() * 360; // 初期回転
                  const opacity = Math.random() * 0.2 + 0.2; // 0.2-0.4の透明度
                  
                  return (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${startX}%`,
                        top: `${startY}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        background: `radial-gradient(circle at 30% 30%, #ffb3d1, #ff69b4, #ff1493)`,
                        borderRadius: '50% 10% 50% 10%',
                        transform: `rotate(${rotation}deg)`,
                        animation: `sakura6Sec ${duration}s linear forwards`,
                        animationDelay: `${delay}s`,
                        opacity: opacity,
                        boxShadow: '0 0 8px rgba(255, 105, 180, 0.3)',
                        filter: 'blur(0.5px)',
                      }}
                    />
                  );
                })}
              </div>

              <div 
                className="space-y-8"
                style={{
                  opacity: titleVisible ? (titleFadeIn ? 1 : 0) : 0,
                  transform: titleVisible ? (titleFadeIn ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)') : 'translateY(12px) scale(0.95)',
                  transition: titleVisible ? 'opacity 6s ease-out 0s, transform 6s ease-out 0s' : 'none',
                  willChange: 'opacity, transform'
                }}
              >
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <Swords 
                    className="w-16 h-16" 
                    style={{ 
                      color: 'var(--gold)',
                      transition: titleVisible ? 'opacity 6s ease-out 0s, transform 6s ease-out 0s' : 'none',
                      opacity: titleVisible ? (titleFadeIn ? 1 : 0) : 0,
                      transform: titleVisible ? (titleFadeIn ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-5deg)') : 'scale(0.8) rotate(-5deg)',
                      willChange: 'opacity, transform'
                    }} 
                  />
                  <h1 
                    className="text-6xl font-bold text-white tracking-wider" 
                    style={{ 
                      textShadow: '0 0 20px rgba(255,255,255,0.8)',
                      transition: titleVisible ? 'opacity 6s ease-out 0s, transform 6s ease-out 0s' : 'none',
                      opacity: titleVisible ? (titleFadeIn ? 1 : 0) : 0,
                      transform: titleVisible ? (titleFadeIn ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)') : 'translateY(20px) scale(0.9)',
                      willChange: 'opacity, transform'
                    }}
                  >
                    samurAI
                  </h1>
                </div>
                <p 
                  className="text-2xl text-white/90 font-light tracking-wide" 
                  style={{ 
                    textShadow: '0 0 10px rgba(255,255,255,0.6)',
                    transition: titleVisible ? 'opacity 6s ease-out 0.5s, transform 6s ease-out 0.5s' : 'none',
                    opacity: titleVisible ? (titleFadeIn ? 1 : 0) : 0,
                    transform: titleVisible ? (titleFadeIn ? 'translateY(0) scale(1)' : 'translateY(15px) scale(0.95)') : 'translateY(15px) scale(0.95)',
                    willChange: 'opacity, transform'
                  }}
                >
                  機械学習で天下統一
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}