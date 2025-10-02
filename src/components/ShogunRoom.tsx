import { Map, Scroll, Award } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';

export function ShogunRoom() {
  const { user, regions, progress, setCurrentView } = useGameState();

  if (!user) return null;

  const completedRegions = Object.values(progress).filter(p => p.is_completed).length;
  const totalStars = Object.values(progress).reduce((sum, p) => sum + p.stars, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-100 rounded-lg shadow-2xl border-4 border-amber-700 overflow-hidden">
          <div className="border-b-4 border-amber-700 bg-gradient-to-r from-red-800 to-red-900 p-6">
            <h1 className="text-4xl font-bold text-yellow-100 text-center tracking-wide">
              samurAI - 機械学習で天下統一
            </h1>
          </div>

          <div className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white/80 rounded-lg p-8 shadow-lg border-2 border-amber-600">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold text-amber-900">{user.shogun_name}様</h2>
                    <span className="text-2xl font-bold text-red-800 bg-yellow-200 px-4 py-2 rounded-full border-2 border-red-800">
                      {user.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-300">
                      <div className="text-3xl font-bold text-amber-900">{user.level}</div>
                      <div className="text-sm text-amber-700 mt-1">レベル</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-300">
                      <div className="text-3xl font-bold text-amber-900">{completedRegions}/{regions.length}</div>
                      <div className="text-sm text-amber-700 mt-1">地域制覇</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-300">
                      <div className="text-3xl font-bold text-amber-900">{totalStars}</div>
                      <div className="text-sm text-amber-700 mt-1">獲得星数</div>
                    </div>
                  </div>

                  <div className="mt-6 bg-amber-100 rounded-full h-6 border-2 border-amber-600 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-red-600 h-full transition-all duration-500"
                      style={{
                        width: `${Math.min((user.total_xp % 1000) / 10, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-center text-sm text-amber-700 mt-2">
                    経験値: {user.total_xp} / {Math.ceil(user.total_xp / 1000) * 1000}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentView('map')}
                  className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white p-8 rounded-lg shadow-xl border-4 border-yellow-600 transition-all transform hover:scale-105 group"
                >
                  <div className="flex items-center justify-center space-x-4">
                    <Map className="w-16 h-16 group-hover:rotate-12 transition-transform" />
                    <div className="text-left">
                      <div className="text-3xl font-bold">日本地図を開く</div>
                      <div className="text-xl text-yellow-200 mt-2">各地の課題に挑戦しよう</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-white/80 rounded-lg p-6 shadow-lg border-2 border-amber-600">
                  <div className="flex items-center space-x-2 mb-4">
                    <Scroll className="w-6 h-6 text-amber-900" />
                    <h3 className="text-xl font-bold text-amber-900">機械学習とは？</h3>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    機械学習は、コンピュータがデータから自動的にパターンを見つけ出す技術です。
                    このゲームでは、実際のMLモデルを使って戦国時代の様々な課題を解決します。
                  </p>
                </div>

                <div className="bg-white/80 rounded-lg p-6 shadow-lg border-2 border-amber-600">
                  <div className="flex items-center space-x-2 mb-4">
                    <Award className="w-6 h-6 text-amber-900" />
                    <h3 className="text-xl font-bold text-amber-900">最近の実績</h3>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(progress)
                      .filter(([, p]) => p.is_completed)
                      .slice(0, 3)
                      .map(([regionId, p]) => {
                        const region = regions.find(r => r.id === regionId);
                        return (
                          <div
                            key={regionId}
                            className="flex items-center justify-between p-3 bg-amber-50 rounded border border-amber-300"
                          >
                            <span className="text-sm font-medium text-amber-900">{region?.name}</span>
                            <div className="flex">
                              {[...Array(3)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${i < p.stars ? 'text-yellow-500' : 'text-gray-300'}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    {Object.values(progress).filter(p => p.is_completed).length === 0 && (
                      <p className="text-sm text-amber-700 text-center py-4">
                        まだ実績がありません
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
