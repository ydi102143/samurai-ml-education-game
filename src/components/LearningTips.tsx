import { Lightbulb, TrendingUp, Target, AlertCircle } from 'lucide-react';

interface LearningTipsProps {
  accuracy: number;
  requiredAccuracy: number;
}

export function LearningTips({ accuracy, requiredAccuracy }: LearningTipsProps) {
  const isPassed = accuracy >= requiredAccuracy;
  const accuracyGap = requiredAccuracy - accuracy;

  const getTips = () => {
    if (isPassed) {
      return [
        {
          icon: <TrendingUp className="w-4 h-4" />,
          text: "素晴らしい！課題をクリアしました。次の地域に挑戦しましょう！",
          type: "success" as const
        },
        {
          icon: <Target className="w-4 h-4" />,
          text: "より高い精度を目指して、さらなる改善に挑戦してみてください。",
          type: "info" as const
        }
      ];
    }

    const tips = [
      {
        icon: <Lightbulb className="w-4 h-4" />,
        text: "パラメータを調整してみましょう。学習率を変更すると結果が改善するかもしれません。",
        type: "warning" as const
      },
      {
        icon: <AlertCircle className="w-4 h-4" />,
        text: "別のモデルを試してみるのも良い方法です。",
        type: "warning" as const
      }
    ];

    if (accuracyGap > 0.1) {
      tips.push({
        icon: <Target className="w-4 h-4" />,
        text: "イテレーション数を増やすと、より良い結果が得られることがあります。",
        type: "warning" as const
      });
    }

    return tips;
  };

  const tips = getTips();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-blue-900">学習のヒント</h3>
      </div>
      
      <div className="space-y-3">
        {tips.map((tip, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 p-3 rounded-lg ${
              tip.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : tip.type === 'info'
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className={`flex-shrink-0 ${
              tip.type === 'success' 
                ? 'text-green-600' 
                : tip.type === 'info'
                ? 'text-blue-600'
                : 'text-yellow-600'
            }`}>
              {tip.icon}
            </div>
            <p className={`text-sm ${
              tip.type === 'success' 
                ? 'text-green-800' 
                : tip.type === 'info'
                ? 'text-blue-800'
                : 'text-yellow-800'
            }`}>
              {tip.text}
            </p>
          </div>
        ))}
      </div>

      {!isPassed && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              現在の精度: {(accuracy * 100).toFixed(1)}% / 必要精度: {(requiredAccuracy * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-red-700 mt-1">
            あと {(accuracyGap * 100).toFixed(1)}% の改善が必要です
          </p>
        </div>
      )}
    </div>
  );
}
