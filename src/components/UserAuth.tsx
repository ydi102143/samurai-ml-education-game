import { useState, useEffect } from 'react';
import { User, Crown, Trophy, Target, Zap } from 'lucide-react';
import { userManager, type User as UserType } from '../utils/userManager';

interface UserAuthProps {
  onUserReady: (user: UserType) => void;
}

export function UserAuth({ onUserReady }: UserAuthProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    // 既存のユーザーを確認
    const existingUser = userManager.getCurrentUser();
    if (existingUser) {
      setCurrentUser(existingUser);
      onUserReady(existingUser);
    }
  }, [onUserReady]);

  const handleLogin = async () => {
    if (!username.trim()) return;

    setIsLoading(true);
    try {
      const user = userManager.loginUser(username.trim(), email.trim() || undefined);
      setCurrentUser(user);
      onUserReady(user);
    } catch (error) {
      console.error('ログインに失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    userManager.logout();
    setCurrentUser(null);
    setUsername('');
    setEmail('');
  };

  if (currentUser) {
    const stats = userManager.getUserStats();
    
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl border-4 p-8" style={{ borderColor: 'var(--gold)' }}>
            {/* ユーザー情報 */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4" style={{ borderColor: 'var(--gold)' }}>
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">{currentUser.username}</h2>
              <div className="text-sm text-slate-600">
                レベル {currentUser.level} • 経験値 {currentUser.experience}
              </div>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-900">{currentUser.wins}</div>
                <div className="text-sm text-blue-700">勝利数</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-900">{Math.round(currentUser.winRate * 100)}%</div>
                <div className="text-sm text-green-700">勝率</div>
              </div>
            </div>

            {/* 経験値バー */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>レベル {currentUser.level}</span>
                <span>{Math.round(stats.progress)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                次のレベルまで {stats.nextLevelExp - currentUser.experience} EXP
              </div>
            </div>

            {/* アクションボタン */}
            <div className="space-y-3">
              <button
                onClick={() => onUserReady(currentUser)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                <Zap className="w-5 h-5 inline-block mr-2" />
                対戦を開始
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-slate-600 hover:text-slate-800 py-2 px-4 rounded-lg border-2 border-slate-300 hover:border-slate-400 transition-colors"
              >
                別のユーザーでログイン
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl border-4 p-8" style={{ borderColor: 'var(--gold)' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">プレイヤー登録</h1>
            <p className="text-slate-600">オンライン対戦に参加するためのユーザー情報を入力してください</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ユーザー名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="プレイヤー名を入力"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                メールアドレス（任意）
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレス（任意）"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={!username.trim() || isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  ログイン中...
                </div>
              ) : (
                <>
                  <Crown className="w-5 h-5 inline-block mr-2" />
                  対戦を開始
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              ユーザー情報はローカルに保存され、統計やリーダーボードに反映されます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

