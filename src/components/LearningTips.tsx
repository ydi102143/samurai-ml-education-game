import { Lightbulb, Target, TrendingUp, AlertCircle } from 'lucide-react';

interface Props {
  accuracy: number;
  requiredAccuracy: number;
  modelType: string;
}

export function LearningTips({ accuracy, requiredAccuracy, modelType }: Props) {
  const isPassed = accuracy >= requiredAccuracy;
  const accuracyGap = requiredAccuracy - accuracy;

  const getTips = () => {
    const tips = [];

    if (!isPassed) {
      if (accuracyGap > 0.2) {
        tips.push({
          icon: AlertCircle,
          title: 'データをよく観察しよう',
          description: 'グラフや表を見て、データの特徴やパターンを見つけてみよう。何か気づくことはないかな？',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        });
      }

      if (modelType === 'logistic_regression' || modelType === 'linear_regression') {
        tips.push({
          icon: TrendingUp,
          title: '学習速度を調整してみよう',
          description: '学習速度が速すぎると、AIがうまく学習できないことがあるよ。少し遅くしてみよう。',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        });
      }

      if (modelType === 'knn') {
        tips.push({
          icon: Target,
          title: '近くのデータ数を変えてみよう',
          description: 'k近傍法では、参考にする近くのデータの数が重要だよ。3〜7の間で試してみよう。',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        });
      }

      tips.push({
        icon: Lightbulb,
        title: '特徴選択を見直してみよう',
        description: '選んだ特徴が本当に答えに関係しているかな？他の特徴も試してみよう。',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      });
    } else {
      tips.push({
        icon: Target,
        title: '素晴らしい！',
        description: 'AIの設定が完璧だったね！他の地域の課題にも挑戦してみよう。',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      });
    }

    return tips;
  };

  const tips = getTips();

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-300 shadow-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="w-6 h-6 text-yellow-600" />
        <h3 className="text-lg font-bold text-yellow-900">学習のヒント</h3>
      </div>
      
      <div className="space-y-3">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${tip.bgColor} ${tip.borderColor}`}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`w-5 h-5 mt-0.5 ${tip.color}`} />
                <div>
                  <h4 className={`font-semibold ${tip.color} mb-1`}>
                    {tip.title}
                  </h4>
                  <p className="text-sm text-gray-700">
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!isPassed && (
        <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-300">
          <p className="text-sm text-orange-800">
            <strong>💡 コツ：</strong> 間違えても大丈夫！何度でも挑戦できるから、いろいろな設定を試してみよう。
            データをよく観察することが一番大切だよ！
          </p>
        </div>
      )}
    </div>
  );
}
