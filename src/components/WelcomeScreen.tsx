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
                機械学習の力で解決し、天下統一を目指せ！
              </p>
            </div>

            <div className="bg-amber-50 rounded-lg p-6 border-2 border-amber-600 mb-8">
              <h2 className="text-xl font-bold text-amber-900 mb-4">ゲームの流れ</h2>
              <ol className="space-y-3 text-amber-800">
                <li className="flex items-start">
                  <span className="font-bold mr-3 text-red-800">1.</span>
                  <span>日本地図から地域を選択</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-3 text-red-800">2.</span>
                  <span>その地域の課題を確認</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-3 text-red-800">3.</span>
                  <span>機械学習モデルを選んでパラメータ調整</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-3 text-red-800">4.</span>
                  <span>モデルを訓練して課題を解決</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-3 text-red-800">5.</span>
                  <span>高精度を達成して次の地域を解放</span>
                </li>
              </ol>
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
