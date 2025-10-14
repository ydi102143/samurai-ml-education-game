# AI技術実装レポート - samurAI

## 概要

本レポートでは、戦国時代を舞台とした機械学習教育ゲーム「samurAI」の開発を通じて、現代のAI技術を実際に実装・体験した内容について報告する。このアプリケーションは、中学生向けの機械学習教育を目的として開発され、ゲーム形式で楽しくAI技術を学習できる仕組みを提供している。

## （１）やったこと・動かしたものの概要

### 実装したAI技術・機能

1. **機械学習モデルの実装**
   - ロジスティック回帰（分類問題）
   - 線形回帰（回帰問題）
   - ランダムフォレスト
   - サポートベクターマシン（SVM）など


2. **データ分析・可視化技術**
   - 探索的データ分析（EDA）
   - 散布図、ヒストグラム、ボックスプロット
   - 相関行列の可視化
   - 混同行列の表示
   - 特徴量重要度の可視化

3. **リアルタイムシステム**
   - オンライン対戦機能
   - リアルタイムリーダーボード
   - 動的スコアリングシステム

4. **データ前処理技術**
   - データ正規化
   - カテゴリ変数のエンコーディング
   - 欠損値処理
   - 特徴量選択

## （２）具体的な手続き

### 環境設定

```bash
# プロジェクトのセットアップ
git clone <repository-url>
cd project

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### 技術スタック

- **フロントエンド**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Lucide React
- **機械学習**: カスタム実装（TensorFlow.jsベース）
- **データ可視化**: Recharts + カスタムチャートコンポーネント
- **状態管理**: React Hooks + Context API
- **開発環境**: Cursor AI エディタ + GitHub Copilot
- **バージョン管理**: Git + GitHub

### 主要なコード実装

#### 1. 機械学習モデルの実装例

```typescript
// ロジスティック回帰の実装
export class LogisticRegression {
  private weights: number[] = [];
  private bias: number = 0;
  private learningRate: number;
  private epochs: number;

  constructor(learningRate: number = 0.01, epochs: number = 100) {
    this.learningRate = learningRate;
    this.epochs = epochs;
  }

  async train(X: number[][], y: number[]): Promise<void> {
    const numFeatures = X[0].length;
    this.weights = new Array(numFeatures).fill(0);
    
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      for (let i = 0; i < X.length; i++) {
        const prediction = this.sigmoid(this.predict(X[i]));
        const error = y[i] - prediction;
        
        // 重みの更新
        for (let j = 0; j < numFeatures; j++) {
          this.weights[j] += this.learningRate * error * X[i][j];
        }
        this.bias += this.learningRate * error;
      }
    }
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  predict(X: number[]): number {
    let sum = this.bias;
    for (let i = 0; i < X.length; i++) {
      sum += this.weights[i] * X[i];
    }
    return this.sigmoid(sum);
  }
}
```

#### 2. データ可視化の実装例

```typescript
// 散布図マトリックスの実装
export function ScatterPlotMatrix({ dataset }: Props) {
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  
  const createScatterData = (feature1: number, feature2: number) => {
    return dataset.train.map((point, index) => ({
      x: point.features[feature1],
      y: point.features[feature2],
      label: point.label,
      index
    }));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {selectedFeatures.map((i, index) => (
        <div key={index} className="p-4 border rounded">
          <h4>{dataset.featureNames[i]} vs {dataset.featureNames[i+1]}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={createScatterData(i, i+1)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis dataKey="y" />
              <Tooltip />
              <Scatter dataKey="y" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}
```

#### 3. リアルタイムシステムの実装

```typescript
// リアルタイムスコアリングシステム
export class RealtimeScoringSystem {
  private scores: Map<string, number> = new Map();
  private listeners: Set<(scores: Map<string, number>) => void> = new Set();

  addScore(userId: string, score: number): void {
    this.scores.set(userId, score);
    this.notifyListeners();
  }

  getLeaderboard(): Array<{userId: string, score: number}> {
    return Array.from(this.scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([userId, score]) => ({ userId, score }));
  }

  addListener(callback: (scores: Map<string, number>) => void): void {
    this.listeners.add(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.scores));
  }
}
```

### データセットの特徴

アプリケーションで実装した地域の内、3つの地域（京都、堺、甲斐）を紹介する：

**京都 - 茶器の真贋判定**（分類問題）
- 特徴量：年代、職人技、材質、古色、来歴、芸術様式、保存状態、希少性
- 目標精度：80%

**堺 - 貿易品の産地分類**（分類問題）
- 特徴量：材質、装飾、職人技、価格、耐久性、希少性、交易ルート、文化的影響、品質スコア、市場価値、交易効率
- 目標精度：75%

**甲斐 - 金山の産出量予測**（回帰問題）
- 特徴量：労働者数、経験値、技術レベル、気象条件、機具品質、採掘技術、安全対策、鉱石品質、採掘深度、市場価格、投資額、政治安定性
- 目標精度：70%

## （３）わかったこと・わからなかったこと

### わかったこと

**機械学習の実装の複雑さ**
- 理論を理解するだけでは不十分で、実際のデータに対して適切に動作させるには多くの調整が必要
- ハイパーパラメータの調整が性能に大きく影響する
- データの前処理がモデルの性能に決定的な影響を与える

**教育用アプリケーションの設計の重要性**
- ゲーム要素を組み込むことで学習者のモチベーションを維持できる
- 段階的な難易度設定が重要
- 視覚的なフィードバックが学習効果を高める

**リアルタイムシステムの課題**
- 複数ユーザー間でのデータ同期の複雑さ
- パフォーマンスとユーザビリティのバランス
- エラーハンドリングの重要性

**AI支援開発の効果**
- Cursor AI エディタを使用することで、従来の開発時間を大幅に短縮
- 複雑な機械学習ロジックやReactコンポーネントの自動生成が可能
- 学習と実装を同時進行することで、より深い理解が得られる
- AI提案によるベストプラクティスの適用により、コード品質が向上

### わからなかったこと・今後の課題

**深層学習の実装**
- より複雑なニューラルネットワークの実装
- GPU活用による高速化
- 転移学習の応用

**大規模データの処理**
- メモリ効率的なデータ処理
- 分散処理システムの構築
- ストリーミングデータの処理

**本格的な本番環境での運用**
- セキュリティ対策の強化
- スケーラビリティの確保
- モニタリング・ログ管理

**AI支援開発の限界と課題**
- 複雑なビジネスロジックや独自のアルゴリズムの実装におけるAI支援の効果的な活用方法
- AI生成コードの品質を保ちながら、プロジェクトの一貫性を維持する方法
- チーム開発におけるAI支援ツールの効果的な導入と運用

## まとめ

本プロジェクトを通じて、現代のAI技術を実際に実装し、教育アプリケーションとして活用する経験を得ることができた。機械学習の理論と実装の間には大きなギャップがあることを実感し、継続的な学習と実践の重要性を認識した。今後はより高度なAI技術の実装に挑戦し、実用的なアプリケーションの開発を目指したい。

## 技術的成果

- **実装したモデル**:ロジスティック回帰、線形回帰、ランダムフォレスト、SVMなど
- **可視化機能**: 散布図、ヒストグラム、相関行列、混同行列、特徴量重要度
- **リアルタイム機能**: オンライン対戦、リーダーボード、動的スコアリング
- **教育コンテンツ**: 22の地域、各々異なる機械学習課題

## 実装結果のスクリーンショット

### 1. ユーザー認証画面
![ユーザー認証画面](.playwright-mcp/screenshot_user_auth.png)
- プレイヤー登録機能
- ユーザー情報のローカル保存

### 2. メインメニュー画面
![メインメニュー](.playwright-mcp/screenshot_main_menu_updated.png)
- ゲームのメイン画面
- 日本地図とオンライン対戦へのアクセス
- 戦国時代テーマの美しいデザイン

### 3. 日本地図画面
![日本地図](.playwright-mcp/screenshot_japan_map_updated.png)
- 22の地域の課題マップ
- 段階的な難易度設定
- 地域ピンの色分け表示

### 4. 機械学習ワークフロー画面
![MLワークフロー](.playwright-mcp/screenshot_ml_workflow.png)
- データ分析からモデル学習までの一連の流れ
- ステップバイステップの学習プロセス

### 5. データ分析画面
![データ分析](.playwright-mcp/screenshot_data_analysis.png)
- 統計情報の表示
- 特徴量の詳細分析

### 6. オンライン対戦画面
![オンライン対戦](.playwright-mcp/screenshot_online_battle_updated.png)
- リアルタイム競技機能
- 週次問題システム
- 機械学習ワークフローの完全実装

### 7. リーダーボード画面
![リーダーボード](.playwright-mcp/screenshot_leaderboard.png)
- リアルタイムスコアリング
- 競技結果の可視化

## 技術的成果の詳細

### 実装したAI技術の特徴

**多様な機械学習アルゴリズム**
- 線形モデル（ロジスティック回帰、線形回帰）
- アンサンブル学習（ランダムフォレスト、XGBoost）
- 非線形モデル（SVM、ニューラルネットワーク）

**包括的なデータ分析機能**
- 探索的データ分析（EDA）
- 統計的記述（平均、中央値、標準偏差）
- 可視化（散布図、ヒストグラム、相関行列）

**リアルタイムシステム**
- WebSocketベースの通信
- 動的スコアリング
- マルチユーザー対応

**教育ゲーミフィケーション**
- 戦国時代テーマのストーリー
- 段階的難易度設定
- 即座のフィードバック

## 開発環境とツール

