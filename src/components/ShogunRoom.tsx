import { Map, Scroll, Award } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';

export function ShogunRoom() {
  const { user, regions, progress, setCurrentView } = useGameState();

  if (!user) return null;

  const completedRegions = Object.values(progress).filter(p => p.is_completed).length;
  const totalStars = Object.values(progress).reduce((sum, p) => sum + p.stars, 0);

  return (
    <div className="min-h-screen p-8" style={{ background: 'radial-gradient(circle at 20% 40%, rgba(214,193,113,0.18), transparent 60%), var(--paper)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="rounded-lg shadow-2xl overflow-hidden border-4" style={{ borderColor: 'var(--gold)', background: 'rgba(255,255,255,0.9)' }}>
          <div className="p-6" style={{ background: 'linear-gradient(to right, var(--accent-strong), var(--accent))' }}>
            <h1 className="text-4xl font-bold text-yellow-100 text-center tracking-wide">
              samurAI - 機械学習で天下統一
            </h1>
          </div>

          <div className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2" style={{ borderColor: 'var(--gold)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold text-gray-900">{user.shogun_name}様</h2>
                    <span className="text-2xl font-bold text-white px-4 py-2 rounded-full border-2" style={{ background: 'var(--accent-strong)', borderColor: 'var(--gold)' }}>
                      {user.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border-2" style={{ borderColor: 'var(--gold)' }}>
                      <div className="text-3xl font-bold text-gray-900">{user.level}</div>
                      <div className="text-sm text-gray-700 mt-1">レベル</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border-2" style={{ borderColor: 'var(--gold)' }}>
                      <div className="text-3xl font-bold text-gray-900">{completedRegions}/{regions.length}</div>
                      <div className="text-sm text-gray-700 mt-1">地域制覇</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border-2" style={{ borderColor: 'var(--gold)' }}>
                      <div className="text-3xl font-bold text-gray-900">{totalStars}</div>
                      <div className="text-sm text-gray-700 mt-1">獲得星数</div>
                    </div>
                  </div>

                  <div className="mt-6 bg-gray-200 rounded-full h-6 border-2 overflow-hidden" style={{ borderColor: 'var(--gold)' }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        background: 'linear-gradient(to right, var(--accent), var(--accent-strong))',
                        width: `${Math.min((user.total_xp % 1000) / 10, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-center text-sm text-gray-700 mt-2">
                    経験値: {user.total_xp} / {Math.ceil(user.total_xp / 1000) * 1000}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentView('map')}
                  className="w-full text-white p-8 rounded-lg shadow-xl border-4 transition-all transform hover:scale-105 group"
                  style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-strong))', borderColor: 'var(--gold)' }}
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
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2" style={{ borderColor: 'var(--gold)' }}>
                  <div className="flex items-center space-x-2 mb-4">
                    <Scroll className="w-6 h-6" style={{ color: 'var(--accent-strong)' }} />
                    <h3 className="text-xl font-bold text-gray-900">機械学習とは？</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    機械学習は、コンピュータがデータから自動的にパターンを見つけ出す技術です。
                    このゲームでは、実際のMLモデルを使って戦国時代の様々な課題を解決します。
                  </p>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2" style={{ borderColor: 'var(--gold)' }}>
                  <div className="flex items-center space-x-2 mb-4">
                    <Award className="w-6 h-6" style={{ color: 'var(--accent-strong)' }} />
                    <h3 className="text-xl font-bold text-gray-900">最近の実績</h3>
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
                            className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-2" 
                            style={{ borderColor: 'var(--gold)' }}
                          >
                            <span className="text-sm font-medium text-gray-900">{region?.name}</span>
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
                      <p className="text-sm text-gray-700 text-center py-4">
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
