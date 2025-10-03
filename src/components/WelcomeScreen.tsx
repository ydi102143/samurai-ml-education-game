import { useState } from 'react';
import { Swords, MapPin, Brain, Target, Award, Users, BookOpen, Zap } from 'lucide-react';

interface Props {
  onStart: (name: string) => void;
}

export function WelcomeScreen({ onStart }: Props) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(circle at 20% 40%, rgba(201,176,100,0.12), transparent 60%), var(--paper)' }}>
      <div className="max-w-6xl mx-auto p-8">
        {/* メインヘッダー */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl shadow-2xl p-12 mb-8">
            <div className="flex items-center justify-center mb-6">
              <Swords className="w-24 h-24 text-yellow-300 mr-6" />
              <div>
                <h1 className="text-6xl md:text-8xl font-bold text-white tracking-wider mb-4">
                  samurAI
                </h1>
                <p className="text-2xl md:text-3xl text-yellow-200 font-light">
                  機械学習で天下統一
                </p>
              </div>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              戦国時代の日本。各地の藩が抱える課題を、
              <span className="font-bold text-yellow-300">機械学習の力</span>で解決し、天下統一を目指せ！
            </p>
          </div>
        </div>

        {/* ゲームの特徴 */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2" style={{ borderColor: 'var(--gold)' }}>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">機械学習学習</h3>
              <p className="text-gray-700 leading-relaxed">
                データ分析からモデル選択まで、実際の機械学習の流れを体験できます
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2" style={{ borderColor: 'var(--gold)' }}>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">全国17地域</h3>
              <p className="text-gray-700 leading-relaxed">
                京都、薩摩、毛利氏など、有名な藩の課題に挑戦して天下統一を目指そう
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2" style={{ borderColor: 'var(--gold)' }}>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">段階的学習</h3>
              <p className="text-gray-700 leading-relaxed">
                簡単な課題から始めて、徐々に高度な機械学習技術を身につけよう
              </p>
            </div>
          </div>
        </div>

        {/* 学習フロー */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 mb-12 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">学習の流れ</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">1</div>
              <h3 className="font-bold text-gray-900 mb-2">データ探索</h3>
              <p className="text-sm text-gray-700">データを観察して特徴を見つける</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">2</div>
              <h3 className="font-bold text-gray-900 mb-2">前処理</h3>
              <p className="text-sm text-gray-700">データを整理して機械学習用に準備</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">3</div>
              <h3 className="font-bold text-gray-900 mb-2">モデル選択</h3>
              <p className="text-sm text-gray-700">適切な機械学習モデルを選択</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">4</div>
              <h3 className="font-bold text-gray-900 mb-2">評価</h3>
              <p className="text-sm text-gray-700">結果を評価して改善点を見つける</p>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">17</div>
            <div className="text-sm text-gray-600">挑戦可能な地域</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
            <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">4</div>
            <div className="text-sm text-gray-600">学習ステップ</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
            <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">6+</div>
            <div className="text-sm text-gray-600">機械学習モデル</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
            <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">∞</div>
            <div className="text-sm text-gray-600">学習の可能性</div>
          </div>
        </div>

        {/* ユーザー名入力 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2" style={{ borderColor: 'var(--gold)' }}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">戦国大名として参戦しよう！</h2>
            <p className="text-gray-600">あなたの名前を入力して、天下統一の旅を始めよう</p>
          </div>


          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-lg font-bold text-gray-900 mb-3">
                あなたの名前を入力してください
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例：織田信長"
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              天下統一を始める！
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
