import { useState } from 'react';
import { Swords } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-amber-900 to-red-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg shadow-2xl border-4 border-amber-700 overflow-hidden">
          <div className="bg-gradient-to-r from-red-800 to-red-900 p-8 text-center">
            <Swords className="w-20 h-20 mx-auto text-yellow-300 mb-4" />
            <h1 className="text-5xl font-bold text-yellow-100 tracking-wide mb-2">
              samurAI
            </h1>
            <p className="text-2xl text-yellow-200">
              機械学習で天下統一
            </p>
          </div>

          <div className="p-12">
            <div className="mb-8 text-center">
              <p className="text-lg text-amber-900 leading-relaxed">
                戦国時代の日本。各地の藩が抱える課題を、
                <br />
                <span className="font-bold text-red-800">機械学習の力</span>で解決し、天下統一を目指せ！
              </p>
            </div>

            {/* 機械学習とは何か？ */}
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300 mb-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">?</span>
                機械学習って何？
              </h2>
              <p className="text-blue-800 leading-relaxed mb-3">
                機械学習は、コンピューターがデータからパターンを見つけて、予測や判断をする技術です。
              </p>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>例：</strong>「過去の天気データから明日の天気を予測する」「写真を見て猫か犬かを判断する」
                </p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-6 border-2 border-amber-600 mb-8">
              <h2 className="text-xl font-bold text-amber-900 mb-4">ゲームの流れ（ステップバイステップ）</h2>
              <ol className="space-y-4 text-amber-800">
                <li className="flex items-start">
                  <span className="font-bold mr-3 text-red-800 bg-red-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  <div>
                    <span className="font-semibold">日本地図から地域を選択</span>
                    <p className="text-sm text-amber-700 mt-1">地図上のピンをクリックして、挑戦したい地域を選ぼう</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-3 text-red-800 bg-red-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  <div>
                    <span className="font-semibold">データを探索する</span>
                    <p className="text-sm text-amber-700 mt-1">グラフや表を見て、データの特徴や傾向を発見しよう</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-3 text-red-800 bg-red-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                  <div>
                    <span className="font-semibold">重要な特徴を選ぶ</span>
                    <p className="text-sm text-amber-700 mt-1">どのデータが答えに関係しそうか考えて選択しよう</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-3 text-red-800 bg-red-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                  <div>
                    <span className="font-semibold">AIモデルを選ぶ</span>
                    <p className="text-sm text-amber-700 mt-1">問題に合ったAIの種類を選んで、設定を調整しよう</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-3 text-red-800 bg-red-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
                  <div>
                    <span className="font-semibold">結果を確認する</span>
                    <p className="text-sm text-amber-700 mt-1">AIの予測がどれくらい正確かチェックして、改善しよう</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* 学習のヒント */}
            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-300 mb-8">
              <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">💡</span>
                学習のコツ
              </h2>
              <ul className="space-y-2 text-green-800">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>まずはデータをじっくり観察しよう</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>間違えても大丈夫！何度でも挑戦できるよ</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>いろいろな設定を試してみよう</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>グラフや表をよく見て、パターンを見つけよう</span>
                </li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-lg font-bold text-amber-900 mb-2"
                >
                  あなたの将軍名を入力してください
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: 織田信長"
                  className="w-full px-4 py-3 border-2 border-amber-600 rounded-lg text-lg focus:outline-none focus:border-red-600 bg-white"
                  required
                  minLength={2}
                  maxLength={20}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white py-4 rounded-lg text-xl font-bold shadow-lg border-4 border-yellow-600 transition-all transform hover:scale-105"
              >
                天下統一の旅を始める
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center text-yellow-100 text-sm">
          <p>このゲームでは実際の機械学習アルゴリズムを使用します</p>
          <p className="mt-1">中学生でも理解できるよう、分かりやすく説明します</p>
        </div>
      </div>
    </div>
  );
}
