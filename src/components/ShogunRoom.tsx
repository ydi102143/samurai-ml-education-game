import { Map, Sword, Trophy } from 'lucide-react';
import { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { OnlineBattle } from './OnlineBattle';
import { Leaderboard } from './Leaderboard';
import { userManager } from '../utils/userManager';

export function ShogunRoom() {
  const { user, regions, progress, setCurrentView } = useGameState();
  const [showOnlineBattle, setShowOnlineBattle] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  if (!user) return null;

  // userManagerから現在のユーザー情報を取得
  const currentUser = userManager.getCurrentUser();
  const displayName = currentUser?.username || user.shogun_name || 'プレイヤー';

  const completedRegions = Object.values(progress).filter(p => p.is_completed).length;
  const totalStars = Object.values(progress).reduce((sum, p) => sum + p.stars, 0);


  if (showOnlineBattle) {
    return <OnlineBattle onBack={() => setShowOnlineBattle(false)} />;
  }

  if (showLeaderboard) {
    return <Leaderboard onBack={() => setShowLeaderboard(false)} />;
  }


  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--paper)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="rounded-lg shadow-2xl overflow-hidden border-4" style={{ borderColor: 'var(--gold)', background: 'var(--ink-white)' }}>
          <div className="p-6" style={{ background: 'linear-gradient(to right, var(--accent-strong), var(--accent))' }}>
            <h1 className="text-4xl font-bold text-white text-center tracking-wide">
              samurAI - 機械学習で天下統一
            </h1>
          </div>

          <div className="p-6 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border-2" style={{ borderColor: 'var(--gold)' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                    <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--ink)' }}>{displayName}様</h2>
                    <span className="text-lg md:text-2xl font-bold text-white px-4 py-2 rounded-full border-2 self-start sm:self-auto" style={{ background: 'var(--accent-strong)', borderColor: 'var(--gold)' }}>
                      {user.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 md:gap-4 mt-6">
                    <div className="text-center p-3 md:p-4 rounded-lg border-2" style={{ background: 'var(--silver-light)', borderColor: 'var(--gold)' }}>
                      <div className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--ink)' }}>{user.level}</div>
                      <div className="text-xs md:text-sm mt-1" style={{ color: 'var(--ink-light)' }}>レベル</div>
                    </div>
                    <div className="text-center p-3 md:p-4 rounded-lg border-2" style={{ background: 'var(--silver-light)', borderColor: 'var(--gold)' }}>
                      <div className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--ink)' }}>{completedRegions}/{regions.length}</div>
                      <div className="text-xs md:text-sm mt-1" style={{ color: 'var(--ink-light)' }}>地域制覇</div>
                    </div>
                    <div className="text-center p-3 md:p-4 rounded-lg border-2" style={{ background: 'var(--silver-light)', borderColor: 'var(--gold)' }}>
                      <div className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--ink)' }}>{totalStars}</div>
                      <div className="text-xs md:text-sm mt-1" style={{ color: 'var(--ink-light)' }}>獲得星数</div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-full h-6 border-2 overflow-hidden" style={{ background: 'var(--silver-light)', borderColor: 'var(--gold)' }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        background: 'linear-gradient(to right, var(--accent), var(--accent-strong))',
                        width: `${Math.min((user.total_xp % 1000) / 10, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-center text-sm mt-2" style={{ color: 'var(--ink-light)' }}>
                    経験値: {user.total_xp} / {Math.ceil(user.total_xp / 1000) * 1000}
                  </div>
                </div>

                <button
                  onClick={() => {
                    console.log('日本地図ボタンがクリックされました');
                    setCurrentView('map');
                  }}
                  className="w-full text-white p-8 rounded-lg shadow-xl border-4 transition-all transform hover:scale-105 group"
                  style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-strong))', borderColor: 'var(--gold)' }}
                >
                  <div className="flex items-center justify-center space-x-4">
                    <Map className="w-16 h-16 group-hover:rotate-12 transition-transform" />
                    <div className="text-left">
                      <div className="text-3xl font-bold">日本地図を開く</div>
                      <div className="text-xl mt-2" style={{ color: 'var(--gold-light)' }}>各地の課題に挑戦しよう</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="space-y-6">
                {/* オンライン対戦 */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2" style={{ borderColor: 'var(--gold)' }}>
                  <div className="flex items-center space-x-2 mb-4">
                    <Sword className="w-6 h-6" style={{ color: 'var(--accent-strong)' }} />
                    <h3 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>オンライン対戦</h3>
                  </div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--ink-light)' }}>
                    週次問題で他のプレイヤーと競い合おう！
                  </p>
                  <button
                    onClick={() => setShowOnlineBattle(true)}
                    className="w-full text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                    style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-strong))' }}
                  >
                    ⚔️ オンライン対戦
                  </button>
                </div>

                       {/* リーダーボード */}
                       <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2" style={{ borderColor: 'var(--gold)' }}>
                         <div className="flex items-center space-x-2 mb-4">
                           <Trophy className="w-6 h-6" style={{ color: 'var(--accent-strong)' }} />
                           <h3 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>リーダーボード</h3>
                         </div>
                         <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--ink-light)' }}>
                           他のプレイヤーとスコアを競い合おう！
                         </p>
                         <button
                           onClick={() => setShowLeaderboard(true)}
                           className="w-full text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                           style={{ background: 'linear-gradient(to right, #f59e0b, #d97706)' }}
                         >
                           🏆 リーダーボードを見る
                         </button>
                       </div>


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
