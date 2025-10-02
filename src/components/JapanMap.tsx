import { ArrowLeft, Lock, CheckCircle, Star, MapPin, Award, Info } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { useState } from 'react';

// 各地域の座標（日本地図上の相対位置）
const regionPositions = {
  kyoto: { x: 45, y: 35, name: '京都', daimyo: '足利将軍家' },
  sakai: { x: 40, y: 45, name: '堺', daimyo: '商人自治' },
  kai: { x: 55, y: 40, name: '甲斐', daimyo: '武田信玄' },
  echigo: { x: 60, y: 30, name: '越後', daimyo: '上杉謙信' },
  owari: { x: 50, y: 45, name: '尾張', daimyo: '織田信長' },
  satsuma: { x: 25, y: 70, name: '薩摩', daimyo: '島津義弘' }
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
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-blue-50 to-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center space-x-2 text-white hover:text-blue-100 transition-colors bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">ホームに戻る</span>
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-white text-center flex-1">
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

            {/* 日本地図 */}
            <div className="relative bg-gradient-to-br from-green-100 via-green-50 to-blue-50 rounded-2xl border-4 border-green-200 shadow-2xl overflow-hidden mb-8">
              {/* 地図の背景パターン */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-20 w-32 h-32 bg-green-300 rounded-full blur-3xl"></div>
                <div className="absolute top-40 right-20 w-24 h-24 bg-blue-300 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 left-40 w-40 h-40 bg-emerald-300 rounded-full blur-3xl"></div>
                <div className="absolute bottom-40 right-40 w-28 h-28 bg-cyan-300 rounded-full blur-2xl"></div>
              </div>

              {/* 日本列島のシルエット */}
              <div className="relative w-full h-96 md:h-[500px]">
                {/* 本州のシルエット */}
                <div className="absolute top-8 left-1/4 w-1/2 h-80 bg-gradient-to-br from-green-200 to-green-300 rounded-t-full rounded-b-3xl shadow-lg"></div>
                {/* 四国 */}
                <div className="absolute bottom-16 left-1/3 w-16 h-20 bg-gradient-to-br from-green-200 to-green-300 rounded-t-2xl shadow-md"></div>
                {/* 九州 */}
                <div className="absolute bottom-8 left-1/4 w-20 h-24 bg-gradient-to-br from-green-200 to-green-300 rounded-t-2xl shadow-md"></div>
                {/* 北海道 */}
                <div className="absolute top-0 left-1/2 w-24 h-32 bg-gradient-to-br from-green-200 to-green-300 rounded-b-2xl shadow-md"></div>

                {/* 地域ピン */}
                {regions.map((region) => {
                  const position = regionPositions[region.id as keyof typeof regionPositions];
                  if (!position) return null;

                  const regionProgress = progress[region.id];
                  const isUnlocked = regionProgress?.is_unlocked || false;
                  const isCompleted = regionProgress?.is_completed || false;
                  const stars = regionProgress?.stars || 0;

                  return (
                    <div
                      key={region.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                      }}
                      onClick={() => handlePinClick(region.id)}
                    >
                      {/* ピンの影 */}
                      <div className="absolute w-8 h-8 bg-black/20 rounded-full blur-sm transform translate-x-1 translate-y-1"></div>
                      
                      {/* ピンの本体 */}
                      <div className={`relative w-12 h-12 rounded-full border-4 border-white shadow-lg transition-all duration-300 group-hover:scale-125 ${
                        isCompleted 
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                          : isUnlocked 
                            ? 'bg-gradient-to-br from-blue-400 to-cyan-500' 
                            : 'bg-gradient-to-br from-gray-400 to-gray-500'
                      }`}>
                        {/* ピンのアイコン */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : isUnlocked ? (
                            <MapPin className="w-6 h-6 text-white" />
                          ) : (
                            <Lock className="w-6 h-6 text-white" />
                          )}
                        </div>

                        {/* 星の表示 */}
                        {isCompleted && stars > 0 && (
                          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{stars}</span>
                          </div>
                        )}

                        {/* パルス効果 */}
                        {isUnlocked && !isCompleted && (
                          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30"></div>
                        )}
                      </div>

                      {/* 地域名ラベル */}
                      <div className={`absolute top-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-sm font-bold transition-all duration-300 group-hover:scale-110 ${
                        isUnlocked 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : 'bg-gray-500 text-white shadow-lg'
                      }`}>
                        {position.name}
                      </div>

                      {/* 大名ラベル */}
                      <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded text-xs transition-all duration-300 group-hover:scale-110 ${
                        isUnlocked 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {position.daimyo}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 地図の装飾要素 */}
              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span>挑戦可能</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>クリア済み</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>ロック中</span>
                </div>
              </div>
            </div>

            {/* 選択された地域の詳細 */}
            {selectedRegion && (
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border-2 border-blue-200 shadow-xl p-6 mb-8">
                {(() => {
                  const region = regions.find(r => r.id === selectedRegion);
                  const regionProgress = progress[selectedRegion];
                  const isUnlocked = regionProgress?.is_unlocked || false;
                  const isCompleted = regionProgress?.is_completed || false;
                  const stars = regionProgress?.stars || 0;
                  const accuracy = regionProgress?.best_accuracy || 0;

                  if (!region) return null;

                  return (
                    <div className="flex items-start space-x-6">
                      <div className={`p-4 rounded-xl ${isUnlocked ? 'bg-blue-100' : 'bg-gray-200'}`}>
                        <MapPin className={`w-8 h-8 ${isUnlocked ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <h3 className={`text-2xl font-bold ${isUnlocked ? 'text-gray-900' : 'text-gray-600'}`}>
                            {region.name}
                          </h3>
                          <p className={`text-lg ${isUnlocked ? 'text-blue-600' : 'text-gray-500'}`}>
                            {region.daimyo}
                          </p>
                          {isCompleted && (
                            <div className="flex items-center space-x-1">
                              <Award className="w-5 h-5 text-yellow-500" />
                              <span className="text-lg font-bold text-gray-700">
                                {(accuracy * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div className={`mb-4 ${isUnlocked ? 'text-gray-700' : 'text-gray-500'}`}>
                          <p className="text-base leading-relaxed">
                            {region.description}
                          </p>
                        </div>

                        <div className={`p-4 rounded-xl mb-4 ${isUnlocked ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-100 border border-gray-200'}`}>
                          <div className="text-sm font-medium mb-2 text-gray-600">課題の内容</div>
                          <p className={`text-base ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                            {region.problem_description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mb-4">
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
                            <div className="flex justify-center space-x-1">
                              {[...Array(3)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-2xl ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {isUnlocked ? (
                          <button
                            onClick={() => handleRegionClick(region.id)}
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