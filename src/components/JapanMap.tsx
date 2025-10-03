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
            <div className="relative bg-gradient-to-br from-blue-100 via-cyan-50 to-green-50 rounded-2xl border-4 border-blue-300 shadow-2xl overflow-hidden mb-8">
              {/* 海の波模様 */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-200/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-blue-300/40 to-transparent"></div>
                {/* 波の模様 */}
                <div className="absolute top-20 left-10 w-40 h-2 bg-blue-300/30 rounded-full blur-sm"></div>
                <div className="absolute top-32 left-20 w-32 h-2 bg-blue-300/30 rounded-full blur-sm"></div>
                <div className="absolute top-44 left-5 w-36 h-2 bg-blue-300/30 rounded-full blur-sm"></div>
                <div className="absolute bottom-32 right-10 w-44 h-2 bg-blue-300/30 rounded-full blur-sm"></div>
                <div className="absolute bottom-20 right-20 w-28 h-2 bg-blue-300/30 rounded-full blur-sm"></div>
              </div>

              {/* 日本列島の詳細なシルエット */}
              <div className="relative w-full h-96 md:h-[500px]">
                {/* 北海道 - より詳細な形状 */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                  <div className="w-28 h-32 bg-gradient-to-br from-green-300 to-green-400 rounded-b-2xl shadow-lg relative">
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gradient-to-br from-green-300 to-green-400 rounded-full"></div>
                    <div className="absolute top-4 left-2 w-6 h-6 bg-green-400/50 rounded-full"></div>
                    <div className="absolute top-8 right-3 w-4 h-4 bg-green-400/50 rounded-full"></div>
                  </div>
                </div>

                {/* 本州 - より詳細な形状 */}
                <div className="absolute top-8 left-1/4 w-1/2 h-80 relative">
                  {/* 本州本体 */}
                  <div className="w-full h-full bg-gradient-to-br from-green-200 to-green-300 rounded-t-full rounded-b-3xl shadow-lg relative overflow-hidden">
                    {/* 内陸の山脈 */}
                    <div className="absolute top-16 left-1/4 w-8 h-16 bg-green-400/30 rounded-full transform rotate-12"></div>
                    <div className="absolute top-20 right-1/4 w-6 h-12 bg-green-400/30 rounded-full transform -rotate-12"></div>
                    <div className="absolute top-32 left-1/2 w-10 h-20 bg-green-400/30 rounded-full transform -translate-x-1/2"></div>
                    <div className="absolute bottom-20 left-1/3 w-8 h-16 bg-green-400/30 rounded-full transform rotate-45"></div>
                    
                    {/* 海岸線の詳細 */}
                    <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-green-100 to-green-200 rounded-t-full"></div>
                    <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-r from-green-100 to-green-200 rounded-b-3xl"></div>
                  </div>
                  
                  {/* 本州の半島 */}
                  <div className="absolute bottom-8 left-1/3 w-12 h-16 bg-gradient-to-br from-green-200 to-green-300 rounded-t-2xl shadow-md transform -rotate-12"></div>
                  <div className="absolute bottom-12 right-1/4 w-10 h-14 bg-gradient-to-br from-green-200 to-green-300 rounded-t-2xl shadow-md transform rotate-12"></div>
                </div>

                {/* 四国 - より詳細な形状 */}
                <div className="absolute bottom-16 left-1/3 transform -translate-x-1/2">
                  <div className="w-20 h-24 bg-gradient-to-br from-green-200 to-green-300 rounded-t-2xl shadow-md relative">
                    <div className="absolute top-2 left-2 w-4 h-4 bg-green-400/50 rounded-full"></div>
                    <div className="absolute top-6 right-2 w-3 h-3 bg-green-400/50 rounded-full"></div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-green-400/30 rounded-full"></div>
                  </div>
                </div>

                {/* 九州 - より詳細な形状 */}
                <div className="absolute bottom-8 left-1/4 w-24 h-28 relative">
                  <div className="w-full h-full bg-gradient-to-br from-green-200 to-green-300 rounded-t-2xl shadow-md relative overflow-hidden">
                    {/* 九州の山脈 */}
                    <div className="absolute top-4 left-1/4 w-6 h-12 bg-green-400/30 rounded-full transform rotate-12"></div>
                    <div className="absolute top-6 right-1/4 w-5 h-10 bg-green-400/30 rounded-full transform -rotate-12"></div>
                    <div className="absolute bottom-8 left-1/2 w-8 h-16 bg-green-400/30 rounded-full transform -translate-x-1/2"></div>
                    
                    {/* 海岸線の詳細 */}
                    <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-green-100 to-green-200 rounded-t-2xl"></div>
                  </div>
                  
                  {/* 九州の半島 */}
                  <div className="absolute bottom-4 left-0 w-8 h-12 bg-gradient-to-br from-green-200 to-green-300 rounded-t-xl shadow-sm transform -rotate-6"></div>
                  <div className="absolute bottom-6 right-0 w-6 h-10 bg-gradient-to-br from-green-200 to-green-300 rounded-t-xl shadow-sm transform rotate-6"></div>
                </div>

                {/* 沖縄諸島 */}
                <div className="absolute bottom-4 right-1/4 flex space-x-1">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <div className="w-3 h-2 bg-green-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                </div>

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
                      <div className="absolute w-10 h-10 bg-black/30 rounded-full blur-md transform translate-x-2 translate-y-2"></div>
                      
                      {/* ピンの本体 */}
                      <div className={`relative w-16 h-16 rounded-full border-4 border-white shadow-xl transition-all duration-300 group-hover:scale-125 group-hover:shadow-2xl ${
                        isCompleted 
                          ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-green-600' 
                          : isUnlocked 
                            ? 'bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600' 
                            : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600'
                      }`}>
                        {/* ピンの内側の光沢 */}
                        <div className="absolute inset-1 rounded-full bg-white/20"></div>
                        
                        {/* ピンのアイコン */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isCompleted ? (
                            <CheckCircle className="w-8 h-8 text-white drop-shadow-lg" />
                          ) : isUnlocked ? (
                            <MapPin className="w-8 h-8 text-white drop-shadow-lg" />
                          ) : (
                            <Lock className="w-8 h-8 text-white drop-shadow-lg" />
                          )}
                        </div>

                        {/* 星の表示 */}
                        {isCompleted && stars > 0 && (
                          <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white">
                            <span className="text-white text-sm font-bold">{stars}</span>
                          </div>
                        )}

                        {/* パルス効果 */}
                        {isUnlocked && !isCompleted && (
                          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-40"></div>
                        )}

                        {/* 光る効果 */}
                        <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse"></div>
                      </div>

                      {/* 地域名ラベル */}
                      <div className={`absolute top-18 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 group-hover:scale-110 shadow-lg border-2 ${
                        isUnlocked 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-300' 
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-300'
                      }`}>
                        {position.name}
                      </div>

                      {/* 大名ラベル */}
                      <div className={`absolute top-26 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 group-hover:scale-110 shadow-md border ${
                        isUnlocked 
                          ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200' 
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-gray-200'
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