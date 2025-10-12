import { Map, Sword } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { userManager } from '../utils/userManager';

export function ShogunRoom() {
  const { user, regions, progress, setCurrentView } = useGameState();

  if (!user) return null;

  // userManagerから現在のユーザー情報を取得
  const currentUser = userManager.getCurrentUser();
  const displayName = currentUser?.username || user.shogun_name || 'プレイヤー';

  const completedRegions = Object.values(progress).filter(p => p.is_completed).length;
  const totalStars = Object.values(progress).reduce((sum, p) => sum + p.stars, 0);


  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--paper)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl shadow-2xl overflow-hidden border-4" style={{ borderColor: 'var(--gold)', background: 'var(--ink-white)' }}>
          <div className="p-6 md:p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--accent-strong), var(--accent), var(--gold-light))' }}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-5xl font-bold text-white text-center tracking-wide mb-2">
                samurAI
              </h1>
              <p className="text-lg md:text-xl text-white/90 text-center font-medium">
                機械学習で天下統一
              </p>
            </div>
          </div>

          <div className="p-4 md:p-8 lg:p-12">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 md:gap-8">
              <div className="xl:col-span-3 space-y-6 md:space-y-8">
                <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border-2 relative overflow-hidden" style={{ borderColor: 'var(--gold)' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-var(--gold-light)/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--ink)' }}>{displayName}様</h2>
                        <p className="text-sm md:text-base mt-1" style={{ color: 'var(--ink-light)' }}>戦国大名としての道を歩む</p>
                      </div>
                      <span className="text-lg md:text-xl font-bold text-white px-4 py-2 rounded-full border-2 self-start sm:self-auto shadow-lg" style={{ background: 'linear-gradient(135deg, var(--accent-strong), var(--accent))', borderColor: 'var(--gold)' }}>
                        {user.title}
                      </span>
                    </div>

                  <div className="grid grid-cols-3 gap-3 md:gap-4 mt-6">
                    <div className="text-center p-4 md:p-5 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" style={{ background: 'linear-gradient(135deg, var(--silver-light), white)', borderColor: 'var(--gold)' }}>
                      <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--ink)' }}>{user.level}</div>
                      <div className="text-sm font-medium" style={{ color: 'var(--ink-light)' }}>レベル</div>
                    </div>
                    <div className="text-center p-4 md:p-5 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" style={{ background: 'linear-gradient(135deg, var(--silver-light), white)', borderColor: 'var(--gold)' }}>
                      <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--ink)' }}>{completedRegions}/{regions.length}</div>
                      <div className="text-sm font-medium" style={{ color: 'var(--ink-light)' }}>地域制覇</div>
                    </div>
                    <div className="text-center p-4 md:p-5 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" style={{ background: 'linear-gradient(135deg, var(--silver-light), white)', borderColor: 'var(--gold)' }}>
                      <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--ink)' }}>{totalStars}</div>
                      <div className="text-sm font-medium" style={{ color: 'var(--ink-light)' }}>獲得星数</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--ink-light)' }}>経験値</span>
                      <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{user.total_xp} / {Math.ceil(user.total_xp / 1000) * 1000}</span>
                    </div>
                    <div className="rounded-full h-6 border-2 overflow-hidden shadow-inner" style={{ background: 'var(--silver-light)', borderColor: 'var(--gold)' }}>
                      <div
                        className="h-full transition-all duration-700 relative"
                        style={{
                          background: 'linear-gradient(90deg, var(--accent), var(--accent-strong), var(--gold-light))',
                          width: `${Math.min((user.total_xp % 1000) / 10, 100)}%`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    console.log('日本地図ボタンがクリックされました');
                    console.log('setCurrentViewを呼び出します: map');
                    setCurrentView('map');
                    console.log('setCurrentView呼び出し完了');
                  }}
                  className="w-full text-white p-8 rounded-2xl shadow-2xl border-4 transition-all transform hover:scale-105 group relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong), var(--gold-light))', borderColor: 'var(--gold)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="flex items-center justify-center space-x-6 relative z-10">
                    <div className="p-4 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors shadow-lg">
                      <Map className="w-16 h-16 group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <div className="text-left">
                      <div className="text-3xl font-bold">日本地図を開く</div>
                      <div className="text-xl mt-2 opacity-90">各地の課題に挑戦しよう</div>
                      <div className="text-sm mt-1 opacity-75">戦国時代の日本を制覇せよ！</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="space-y-6">
                {/* オンライン対戦 */}
                <button
                  onClick={() => {
                    console.log('オンライン対戦ボタンがクリックされました');
                    console.log('setCurrentViewを呼び出します: online');
                    setCurrentView('online');
                    console.log('setCurrentView呼び出し完了');
                  }}
                  className="w-full text-white p-8 rounded-2xl shadow-2xl border-4 transition-all transform hover:scale-105 group relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)', borderColor: 'var(--gold)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="flex items-center justify-center space-x-6 relative z-10">
                    <div className="p-4 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors shadow-lg">
                      <Sword className="w-16 h-16 group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <div className="text-left">
                      <div className="text-3xl font-bold">オンライン対戦</div>
                      <div className="text-xl mt-2 opacity-90">リアルタイム競技</div>
                      <div className="text-sm mt-1 opacity-75">週次問題で他のプレイヤーと競い合おう！</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
