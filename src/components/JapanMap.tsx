import { ArrowLeft, Lock, CheckCircle, MapPin, Award, Info } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { useState } from 'react';

// 各地域の座標（画像に基づいて調整）
const regionPositions = {
  kyoto: { x: 46, y: 62, name: '京都', daimyo: '足利将軍家' },
  sakai: { x: 45, y: 67, name: '堺', daimyo: '商人自治' },
  kai: { x: 58, y: 55, name: '甲斐', daimyo: '武田信玄' },
  echigo: { x: 62, y: 47, name: '越後', daimyo: '上杉謙信' },
  owari: { x: 53, y: 63, name: '尾張', daimyo: '織田信長' },
  satsuma: { x: 20, y: 85, name: '薩摩', daimyo: '島津義弘' },
  hizen: { x: 17, y: 73, name: '肥前', daimyo: '鍋島直茂' },
  sagami: { x: 62, y: 62, name: '相模', daimyo: '北条氏康' },
  dewa: { x: 74, y: 35, name: '出羽', daimyo: '最上義光' },
  morioka: { x: 72, y: 25, name: '盛岡', daimyo: '南部信直' },
  sendai: { x: 72, y: 43, name: '仙台', daimyo: '伊達政宗' },
  kanazawa: { x: 54, y: 49, name: '金沢', daimyo: '前田利家' },
  takamatsu: { x: 38, y: 68, name: '高松', daimyo: '生駒親正' },
  kumamoto: { x: 23, y: 81, name: '熊本', daimyo: '加藤清正' },
  yamaguchi: { x: 26, y: 67, name: '長門', daimyo: '毛利元就' },
  kaga: { x: 52, y: 57, name: '加賀', daimyo: '一向一揆' },
  tosa: { x: 35, y: 74, name: '土佐', daimyo: '長宗我部元親' }
} as const;

// ピン重なりの軽減用微調整（px）
const pinOffsets: Record<string, { dx: number; dy: number }> = {
  kyoto: { dx: -8, dy: 8 },
  sakai: { dx: -14, dy: 18 },
  kai: { dx: 10, dy: 10 },
  echigo: { dx: 10, dy: -2 },
  owari: { dx: 12, dy: 24 },
  sagami: { dx: 18, dy: 14 },
  hizen: { dx: 6, dy: 8 },
  satsuma: { dx: 0, dy: 6 },
  dewa: { dx: 6, dy: -4 },
  morioka: { dx: 8, dy: -6 },
  sendai: { dx: 12, dy: -2 },
  kanazawa: { dx: -4, dy: 6 },
  takamatsu: { dx: -8, dy: 12 },
  kumamoto: { dx: 4, dy: 8 },
  yamaguchi: { dx: -6, dy: 4 },
  kaga: { dx: 2, dy: -2 },
  tosa: { dx: -4, dy: 10 },
};

export function JapanMap() {
  const { regions, progress, setCurrentView, setSelectedRegion } = useGameState();
  const [selectedRegion, setSelectedRegionState] = useState<string | null>(null);

  const handleRegionClick = (regionId: string) => {
    const regionProgress = progress[regionId];
    if (regionProgress && regionProgress.is_unlocked) {
      setSelectedRegion(regionId);
      setCurrentView('challenge');
    }
  };

  const handlePinClick = (regionId: string) => {
    setSelectedRegionState(regionId);
  };

  const completedCount = Object.values(progress).filter(p => p.is_completed).length;
  const unlockedCount = Object.values(progress).filter(p => p.is_unlocked).length;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'radial-gradient(circle at 20% 40%, rgba(201,176,100,0.12), transparent 60%), var(--paper)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl shadow-xl overflow-hidden border-4" style={{ borderColor: 'var(--gold)', background: 'rgba(255,255,255,0.9)' }}>
          <div className="p-6" style={{ background: 'linear-gradient(to right, var(--accent-strong), var(--accent))' }}>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center space-x-2 text-yellow-100 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">ホームに戻る</span>
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-yellow-100 text-center flex-1">
                全国の課題マップ
              </h1>
              <div className="w-32" />
            </div>

            <div className="mt-6 flex items-center justify-center space-x-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 text-center">
                <div className="text-2xl font-bold text-white">{completedCount}/{regions.length}</div>
                <div className="text-sm text-blue-100">クリア済み</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 text-center">
                <div className="text-2xl font-bold text-white">{unlockedCount}</div>
                <div className="text-sm text-blue-100">挑戦可能</div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-12">
            <div className="mb-8 text-center">
              <p className="text-gray-700 text-lg">
                日本地図上のピンをクリックして、各地域の課題を確認しよう！
              </p>
            </div>

            {/* 日本地図（伊能忠敬風） */}
            <div className="relative rounded-2xl border-4 border-[var(--gold)] shadow-2xl overflow-hidden mb-8" style={{ background: 'rgba(10,18,36,0.06)' }}>
              {/* 古紙の格子模様 */}
              <div className="absolute inset-0 opacity-30 pointer-events-none"
                   style={{
                     backgroundImage:
                       'linear-gradient(0deg, transparent 24%, rgba(139,105,20,0.08) 25%, rgba(139,105,20,0.08) 26%, transparent 27%, transparent 74%, rgba(139,105,20,0.08) 75%, rgba(139,105,20,0.08) 76%, transparent 77%, transparent),\
                        linear-gradient(90deg, transparent 24%, rgba(139,105,20,0.08) 25%, rgba(139,105,20,0.08) 26%, transparent 27%, transparent 74%, rgba(139,105,20,0.08) 75%, rgba(139,105,20,0.08) 76%, transparent 77%, transparent)'
                     , backgroundSize: '50px 50px'
                   }} />
              {/* 古紙の濃淡 */}
              <div className="absolute inset-0 opacity-15 pointer-events-none"
                   style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(214,193,113,0.35), transparent 60%)' }} />

              <div className="relative w-full h-[900px] md:h-[1100px]">
                <div className="absolute inset-0 z-0">
                  <img
                    src="./japan-map.png"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = './japan-oldmap.png/Gemini_Generated_Image_9k83oi9k83oi9k83.png'; }}
                    alt="日本地図"
                    className="w-full h-full object-cover"
                    style={{ transform: 'translateX(-3%) scale(1.25)', transformOrigin: '50% 42%', filter: 'saturate(0.95) contrast(1.02)', pointerEvents: 'none' }}
                  />
                </div>

                {/* 地域ピン（表示用） */}
                <div className="absolute inset-0 z-30">
                  {regions.map((region) => {
                    const position = regionPositions[region.id as keyof typeof regionPositions];
                    if (!position) return null;

                    const regionProgress = progress[region.id];
                    const isUnlocked = regionProgress?.is_unlocked || false;
                    const isCompleted = regionProgress?.is_completed || false;
                    const stars = regionProgress?.stars || 0;
                    const offset = pinOffsets[region.id] || { dx: 0, dy: 0 };

                    return (
                      <div
                        key={region.id}
                        className="absolute group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                        style={{
                          left: `${position.x}%`,
                          top: `${position.y}%`,
                          transform: `translate(-50%, -50%) translate(${offset.dx}px, ${offset.dy}px)`
                        }}
                        onClick={() => handlePinClick(region.id)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${position.name} - ${isCompleted ? 'クリア済み' : isUnlocked ? '挑戦可能' : 'ロック中'}`}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePinClick(region.id); }}
                      >
                        <div className="absolute w-3 h-3 bg-black/30 rounded-full blur-sm translate-x-1 translate-y-1" />
                        <div className={`relative w-8 h-8 rounded-full border-2 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl ${
                          isCompleted
                            ? 'bg-gradient-to-br from-[#5fbad1] via-[#6ad6e2] to-[#7fe0da] border-[#e7f0f3]'
                            : isUnlocked
                              ? 'bg-gradient-to-br from-[#3a8fb7] via-[#4fa3c3] to-[#6bb7d1] border-[#e7f0f3]'
                              : 'bg-gradient-to-br from-[#9aa7b1] via-[#8d99a6] to-[#7c8794] border-[#e7f0f3]'
                        } border-white/60`}>
                          <div className="absolute inset-0.5 rounded-full bg-white/20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-white drop-shadow-lg" />
                            ) : isUnlocked ? (
                              <MapPin className="w-4 h-4 text-white drop-shadow-lg" />
                            ) : (
                              <Lock className="w-4 h-4 text-white drop-shadow-lg" />
                            )}
                          </div>
                          {isCompleted && stars > 0 && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full w-4 h-4 flex items-center justify-center shadow-lg border border-white">
                              <span className="text-white text-[8px] font-bold">{stars}</span>
                            </div>
                          )}
                          {isUnlocked && !isCompleted && (
                            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-40" />
                          )}
                          <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse" />
                        </div>
                        <div className={`absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full text-[11px] font-medium transition-all duration-300 group-hover:scale-105 shadow-md border ${
                          isUnlocked ? 'bg-gradient-to-r from-[#2e6f9e] to-[#3e8bb9] text-white border-[#cfe3ec]' : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-300'
                        }`}>
                          {position.name}
                        </div>
                        <div className={`hidden sm:block absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded-full text-[9px] font-medium transition-all duration-300 group-hover:scale-105 shadow-sm border ${
                          isUnlocked ? 'bg-gradient-to-r from-[#e6f2f7] to-[#d9eef6] text-[#0a192f] border-[#cfe3ec]' : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-gray-200'
                        }`}>
                          {position.daimyo}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 地図の装飾要素 */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 text-sm text-gray-700 shadow-lg border border-white/50">
                  <div className="font-bold text-gray-800 mb-2 text-center">凡例</div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full shadow-sm border border-blue-300"></div>
                      <span className="text-xs">挑戦可能</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-sm border border-green-300"></div>
                      <span className="text-xs">クリア済み</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full shadow-sm border border-gray-300"></div>
                      <span className="text-xs">ロック中</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 選択された地域の詳細ポップアップ */}
            {selectedRegion && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl border-2 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ borderColor: 'var(--gold)' }}>
                  <div className="p-6">
                    {(() => {
                      const region = regions.find(r => r.id === selectedRegion);
                      const regionProgress = progress[selectedRegion];
                      const isUnlocked = regionProgress?.is_unlocked || false;
                      const isCompleted = regionProgress?.is_completed || false;
                      const stars = regionProgress?.stars || 0;
                      const accuracy = regionProgress?.best_accuracy || 0;

                      if (!region) return null;

                      return (
                        <div>
                          {/* ヘッダー */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-blue-100' : 'bg-gray-200'}`}>
                                <MapPin className={`w-8 h-8 ${isUnlocked ? 'text-blue-600' : 'text-gray-500'}`} />
                              </div>
                              <div>
                                <h3 className={`text-2xl font-bold ${isUnlocked ? 'text-gray-900' : 'text-gray-600'}`}>
                                  {region.name}
                                </h3>
                                <p className={`text-lg ${isUnlocked ? 'text-blue-600' : 'text-gray-500'}`}>
                                  {region.daimyo}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedRegionState(null)}
                              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                              ×
                            </button>
                          </div>

                          {/* 内容 */}
                          <div className="space-y-4">
                            <div className={`p-4 rounded-xl ${isUnlocked ? 'bg-blue-50 border border-blue-200' : 'bg-gray-100 border border-gray-200'}`}>
                              <div className="text-sm font-medium mb-2 text-gray-600">地域の説明</div>
                              <p className={`text-base leading-relaxed ${isUnlocked ? 'text-gray-700' : 'text-gray-500'}`}>
                                {region.description}
                              </p>
                            </div>

                            <div className={`p-4 rounded-xl ${isUnlocked ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-100 border border-gray-200'}`}>
                              <div className="text-sm font-medium mb-2 text-gray-600">課題の内容</div>
                              <p className={`text-base ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                                {region.problem_description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-600">難易度:</span>
                                <div className="flex space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-3 h-5 rounded-sm ${
                                        i < region.difficulty
                                          ? isUnlocked ? 'bg-orange-400' : 'bg-gray-400'
                                          : 'bg-gray-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {isCompleted && (
                                <div className="flex items-center space-x-2">
                                  <Award className="w-5 h-5 text-yellow-500" />
                                  <span className="text-lg font-bold text-gray-700">
                                    {(accuracy * 100).toFixed(0)}%
                                  </span>
                                  <div className="flex space-x-1">
                                    {[...Array(3)].map((_, i) => (
                                      <span
                                        key={i}
                                        className={`text-xl ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {isUnlocked ? (
                              <button
                                onClick={() => {
                                  handleRegionClick(region.id);
                                  setSelectedRegionState(null);
                                }}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                                  isCompleted
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md hover:shadow-lg'
                                }`}
                              >
                                {isCompleted ? '再挑戦する' : '挑戦する'}
                              </button>
                            ) : (
                              <div className="bg-gray-200 text-gray-500 py-4 rounded-xl text-center font-medium text-lg">
                                前の課題をクリアしよう
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* ヒントセクション */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500 text-white rounded-full p-3">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">進め方のヒント</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2">1.</span>
                      <span>地図上のピンをクリックして地域の詳細を確認しよう</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2.</span>
                      <span>最初は簡単な課題から始めよう</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3.</span>
                      <span>データをよく観察して、特徴を見つけよう</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">4.</span>
                      <span>いろいろなモデルを試して、比べてみよう</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}