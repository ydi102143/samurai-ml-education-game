import { useState, useEffect } from 'react';
import { Swords, Quote } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export function QuoteIntro({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // アニメーション開始
    const timer1 = setTimeout(() => setIsVisible(true), 500);
    
    // ステップ進行
    const timer2 = setTimeout(() => setCurrentStep(1), 2000);
    const timer3 = setTimeout(() => setCurrentStep(2), 4000);
    const timer4 = setTimeout(() => setCurrentStep(3), 6000);
    const timer5 = setTimeout(() => setCurrentStep(4), 8000);
    
    // 完了
    const timer6 = setTimeout(() => onComplete(), 10000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-8 relative overflow-hidden">
      {/* 背景エフェクト */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-2xl animate-ping" />
      </div>

      {/* 星のエフェクト */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 max-w-4xl w-full text-center transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* ステップ1: タイトル表示 */}
        {currentStep >= 0 && (
          <div className={`transition-all duration-1000 ${
            currentStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <div className="flex items-center justify-center mb-8">
              <Swords className="w-16 h-16 text-red-400 mr-4 animate-pulse" />
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-red-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent tracking-wider">
                samurAI
              </h1>
            </div>
            <p className="text-2xl md:text-3xl text-gray-300 mb-12 font-light">
              機械学習で天下統一
            </p>
          </div>
        )}

        {/* ステップ2: 引用文表示 */}
        {currentStep >= 1 && (
          <div className={`transition-all duration-1000 ${
            currentStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="bg-gradient-to-br from-amber-900/90 to-red-900/90 backdrop-blur-sm rounded-2xl p-8 md:p-12 border-2 border-amber-600/50 shadow-2xl">
              <Quote className="w-12 h-12 text-amber-400 mx-auto mb-6 animate-bounce" />
              <blockquote className="text-2xl md:text-4xl leading-relaxed font-medium text-amber-100 italic mb-6">
                "<span className="bg-gradient-to-r from-red-300 to-amber-300 bg-clip-text text-transparent font-bold">
                  Data is the sword of the 21st century
                </span>,
                <br />
                those who wield it well, the Samurai."
              </blockquote>
              <cite className="text-lg md:text-xl text-amber-300 font-semibold">
                — Jonathan Rosenberg
              </cite>
            </div>
          </div>
        )}

        {/* ステップ3: 日本語訳表示 */}
        {currentStep >= 2 && (
          <div className={`transition-all duration-1000 ${
            currentStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="mt-8 bg-gradient-to-br from-gray-800/90 to-slate-800/90 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-600/50 shadow-xl">
              <p className="text-xl md:text-2xl text-gray-200 leading-relaxed">
                「<span className="font-bold text-red-300">データは21世紀の刀</span>。
                <br />
                それを使いこなす者こそ、<span className="font-bold text-amber-300">サムライ</span>である」
              </p>
            </div>
          </div>
        )}

        {/* ステップ4: 説明文表示 */}
        {currentStep >= 3 && (
          <div className={`transition-all duration-1000 ${
            currentStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="mt-8 bg-gradient-to-r from-blue-900/80 to-cyan-900/80 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-blue-500/50 shadow-xl">
              <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                戦国時代の日本。各地の藩が抱える課題を、
                <br />
                <span className="font-bold text-cyan-300">機械学習の力</span>で解決し、天下統一を目指せ！
              </p>
            </div>
          </div>
        )}

        {/* ステップ5: ローディング表示 */}
        {currentStep >= 4 && (
          <div className={`transition-all duration-1000 ${
            currentStep >= 5 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <div className="mt-12">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <p className="text-lg text-gray-300 font-medium">
                ゲームを準備中...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
