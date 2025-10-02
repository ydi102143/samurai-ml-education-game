import { ArrowLeft, Lock, CheckCircle, Star, MapPin, Award } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';

export function JapanMap() {
  const { regions, progress, setCurrentView, setSelectedRegion } = useGameState();

  const handleRegionClick = (regionId: string) => {
    const regionProgress = progress[regionId];
    if (regionProgress && regionProgress.is_unlocked) {
      setSelectedRegion(regionId);
      setCurrentView('challenge');
    }
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
                全国各地の課題を解決して、データ分析のスキルを磨こう！
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regions.map((region) => {
                const regionProgress = progress[region.id];
                const isUnlocked = regionProgress?.is_unlocked || false;
                const isCompleted = regionProgress?.is_completed || false;
                const stars = regionProgress?.stars || 0;
                const accuracy = regionProgress?.best_accuracy || 0;

                return (
                  <div
                    key={region.id}
                    className={`relative rounded-xl border-2 transition-all ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-white to-blue-50 border-blue-300 shadow-lg hover:shadow-xl hover:scale-105'
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 opacity-75'
                    }`}
                  >
                    <div className="absolute -top-3 -right-3 z-10">
                      {!isUnlocked && (
                        <div className="bg-gray-500 text-white rounded-full p-2 shadow-lg">
                          <Lock className="w-5 h-5" />
                        </div>
                      )}
                      {isCompleted && (
                        <div className="bg-green-500 text-white rounded-full p-2 shadow-lg">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      )}
                      {isUnlocked && !isCompleted && (
                        <div className="bg-yellow-500 text-white rounded-full p-2 shadow-lg animate-pulse">
                          <Star className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-start space-x-3 mb-4">
                        <div className={`p-3 rounded-lg ${isUnlocked ? 'bg-blue-100' : 'bg-gray-200'}`}>
                          <MapPin className={`w-6 h-6 ${isUnlocked ? 'text-blue-600' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold mb-1 ${isUnlocked ? 'text-gray-900' : 'text-gray-600'}`}>
                            {region.name}
                          </h3>
                          <p className={`text-sm ${isUnlocked ? 'text-blue-600' : 'text-gray-500'}`}>
                            {region.daimyo}
                          </p>
                        </div>
                      </div>

                      <div className={`mb-4 ${isUnlocked ? 'text-gray-700' : 'text-gray-500'}`}>
                        <p className="text-sm leading-relaxed line-clamp-3">
                          {region.description}
                        </p>
                      </div>

                      <div className={`p-3 rounded-lg mb-4 ${isUnlocked ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-100 border border-gray-200'}`}>
                        <div className="text-xs font-medium mb-1 text-gray-600">課題の内容</div>
                        <p className={`text-sm ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                          {region.problem_description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-gray-600">難易度:</span>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-4 rounded-sm ${
                                  i < region.difficulty
                                    ? isUnlocked ? 'bg-orange-400' : 'bg-gray-400'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {isCompleted && (
                          <div className="flex items-center space-x-1">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-bold text-gray-700">
                              {(accuracy * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {isCompleted && (
                        <div className="flex justify-center space-x-1 mb-4">
                          {[...Array(3)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-3xl ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}

                      {isUnlocked ? (
                        <button
                          onClick={() => handleRegionClick(region.id)}
                          className={`w-full py-3 rounded-lg font-bold transition-all ${
                            isCompleted
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md hover:shadow-lg'
                          }`}
                        >
                          {isCompleted ? '再挑戦する' : '挑戦する'}
                        </button>
                      ) : (
                        <div className="bg-gray-200 text-gray-500 py-3 rounded-lg text-center font-medium">
                          前の課題をクリアしよう
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500 text-white rounded-full p-3">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">進め方のヒント</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2">1.</span>
                      <span>最初は簡単な課題から始めよう</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2.</span>
                      <span>データをよく観察して、特徴を見つけよう</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3.</span>
                      <span>いろいろなモデルを試して、比べてみよう</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">4.</span>
                      <span>うまくいかないときは、設定を変えて再挑戦してみよう</span>
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
