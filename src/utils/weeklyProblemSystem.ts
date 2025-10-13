// 週次問題更新システム
export interface WeeklyProblem {
  id: string;
  title: string;
  description: string;
  type: 'classification' | 'regression';
  difficulty: 'easy' | 'medium' | 'hard';
  startDate: Date;
  endDate: Date;
  dataset: {
    name: string;
    description: string;
    features: number;
    samples: number;
    targetName: string;
    type?: string;
  };
  evaluation: {
    metric: string;
    description: string;
  };
  leaderboard: {
    totalParticipants: number;
    topScore: number;
    averageScore: number;
  };
  status: 'active' | 'evaluating' | 'completed';
  privateTestData?: {
    data: number[][];
    targets: number[];
    featureNames: string[];
  };
  finalResults?: {
    submissions: FinalSubmission[];
    evaluationComplete: boolean;
    evaluationDate: Date;
  };
}

export interface FinalSubmission {
  userId: string;
  modelName: string;
  publicScore: number;
  privateScore: number;
  rank: number;
  submissionTime: Date;
  metadata: {
    hyperparameters: Record<string, any>;
    preprocessing: string[];
    featureEngineering: string[];
    trainingTime: number;
    validationTime: number;
  };
}

export class WeeklyProblemSystem {
  private currentProblem: WeeklyProblem | null = null;
  private problemHistory: WeeklyProblem[] = [];
  private listeners: ((problem: WeeklyProblem) => void)[] = [];
  private submissions: Map<string, FinalSubmission[]> = new Map();
  private lastProblemChange: number = 0;
  private readonly PROBLEM_DURATION = 7 * 24 * 60 * 60 * 1000; // 1週間（ミリ秒）

  constructor() {
    this.initializeWeeklyProblem();
    this.startWeeklyTimer();
    this.startEvaluationTimer();
    this.startProblemRotationTimer();
  }

  // 週次問題を初期化
  private initializeWeeklyProblem() {
    const now = new Date();
    const weekStart = this.getWeekStart(now);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // 週次問題IDを生成（週の開始日時ベース）
    const weekId = `week_${weekStart.getFullYear()}_${weekStart.getMonth() + 1}_${weekStart.getDate()}`;
    
    // デバッグ用：常に新しい問題を生成（開発中）
    console.log('新しい週次問題を生成（デバッグモード）:', weekId);
    this.currentProblem = this.generateWeeklyProblem(weekStart, weekEnd, weekId);
    this.problemHistory.push(this.currentProblem);
    
    // ローカルストレージに保存
    this.storeProblem(this.currentProblem);
    console.log('新しい週次問題を生成:', this.currentProblem.title);
  }

  // 問題をローカルストレージに保存
  private storeProblem(problem: WeeklyProblem) {
    // 大きなデータを除外して、必要な情報のみを保存
    const problemData = {
      id: problem.id,
      title: problem.title,
      description: problem.description,
      type: problem.type,
      difficulty: problem.difficulty,
      startDate: problem.startDate.toISOString(),
      endDate: problem.endDate.toISOString(),
      dataset: {
        name: problem.dataset.name,
        description: problem.dataset.description,
        features: problem.dataset.features,
        samples: problem.dataset.samples,
        targetName: problem.dataset.targetName
      },
      evaluation: problem.evaluation,
      leaderboard: problem.leaderboard,
      status: problem.status
      // privateTestDataは除外（必要時に再生成）
    };
    
    try {
      localStorage.setItem('ml_battle_current_problem', JSON.stringify(problemData));
    } catch (error) {
      console.warn('ローカルストレージに保存できませんでした:', error);
      // フォールバック: セッションストレージを使用
      try {
        sessionStorage.setItem('ml_battle_current_problem', JSON.stringify(problemData));
      } catch (sessionError) {
        console.warn('セッションストレージにも保存できませんでした:', sessionError);
      }
    }
  }

  // ローカルストレージから問題を取得（将来使用予定）
  // private getStoredProblem(): WeeklyProblem | null {
  //   try {
  //     const stored = localStorage.getItem('ml_battle_current_problem') || 
  //                    sessionStorage.getItem('ml_battle_current_problem');
  //     if (!stored) return null;
  //     
  //     const problemData = JSON.parse(stored);
  //     return {
  //       ...problemData,
  //       startDate: new Date(problemData.startDate),
  //       endDate: new Date(problemData.endDate),
  //       // privateTestDataは必要時に再生成
  //       privateTestData: undefined
  //     };
  //   } catch (error) {
  //     console.error('問題の読み込みに失敗:', error);
  //     return null;
  //   }
  // }

  // 問題がまだ有効かチェック（将来使用予定）
  // private isProblemStillValid(problem: WeeklyProblem, now: Date): boolean {
  //   return now >= problem.startDate && now <= problem.endDate;
  // }

  // 週の開始日を取得
  private getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 月曜日開始
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  // 週次問題を生成
  private generateWeeklyProblem(startDate: Date, endDate: Date, weekId?: string): WeeklyProblem {
    const problemTypes = [
      {
        type: 'classification' as const,
        templates: [
          {
            title: '顧客離脱予測',
            description: '顧客の属性から離脱を予測する分類問題です。',
            difficulty: 'medium' as const,
            dataset: {
              name: '顧客離脱データセット',
              description: '年齢、収入、教育、性別、都市規模、クレジットスコアなどの顧客属性データセット',
              features: 8,
              samples: 1500,
              targetName: '離脱フラグ'
            },
            evaluation: {
              metric: 'Accuracy',
              description: '正解率で評価されます'
            }
          },
          {
            title: '医療診断支援',
            description: '患者の検査データから疾患を診断する分類問題です。',
            difficulty: 'hard' as const,
            dataset: {
              name: '医療診断データセット',
              description: '年齢、血圧、コレステロール、血糖値、心拍数、BMI、喫煙歴、家族歴などの検査データセット',
              features: 8,
              samples: 2000,
              targetName: '疾患分類'
            },
            evaluation: {
              metric: 'F1-Score',
              description: 'F1スコアで評価されます'
            }
          },
          {
            title: 'ローンデフォルト予測',
            description: '借入者の属性からデフォルトリスクを予測する分類問題です。',
            difficulty: 'medium' as const,
            dataset: {
              name: 'ローンデフォルトデータセット',
              description: '口座残高、クレジットスコア、借入金額、勤続年数、負債比率、収入安定性、借入目的、担保などのデータセット',
              features: 8,
              samples: 2000,
              targetName: 'デフォルトリスク'
            },
            evaluation: {
              metric: 'Precision',
              description: '適合率で評価されます'
            }
          }
        ]
      },
      {
        type: 'regression' as const,
        templates: [
          {
            title: '売上予測',
            description: '商品の特徴から売上を予測する回帰問題です。',
            difficulty: 'medium' as const,
            dataset: {
              name: '売上データセット',
              description: '商品カテゴリ、価格、割引、季節、広告予算、競合価格、店舗規模、立地タイプなどの特徴を含むデータセット',
              features: 8,
              samples: 1800,
              targetName: '売上'
            },
            evaluation: {
              metric: 'RMSE',
              description: '平均二乗平方根誤差で評価されます'
            }
          },
          {
            title: '住宅価格予測',
            description: '住宅の特徴から価格を予測する回帰問題です。',
            difficulty: 'medium' as const,
            dataset: {
              name: '住宅価格データセット',
              description: '住宅のサイズ、部屋数、立地、築年数などの特徴を含むデータセット',
              features: 9,
              samples: 2000,
              targetName: '価格'
            },
            evaluation: {
              metric: 'RMSE',
              description: '平均二乗平方根誤差で評価されます'
            }
          },
          {
            title: '株価予測',
            description: '企業の財務指標から株価を予測する回帰問題です。',
            difficulty: 'hard' as const,
            dataset: {
              name: '株価予測データセット',
              description: 'セクター、時価総額、PER、負債比率、収益成長率などの財務指標データセット',
              features: 8,
              samples: 1500,
              targetName: '株価'
            },
            evaluation: {
              metric: 'MAE',
              description: '平均絶対誤差で評価されます'
            }
          }
        ]
      }
    ];

    const typeGroup = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    const template = typeGroup.templates[Math.floor(Math.random() * typeGroup.templates.length)];

    // データセットタイプを決定
    const datasetType = this.getDatasetTypeFromTitle(template.title);
    
    const problem: WeeklyProblem = {
      id: weekId || `problem_${Date.now()}`,
      title: template.title,
      description: template.description,
      type: typeGroup.type,
      difficulty: template.difficulty,
      startDate,
      endDate,
      dataset: {
        ...template.dataset,
        type: datasetType // データセットタイプを追加
      },
      evaluation: template.evaluation,
      leaderboard: {
        totalParticipants: Math.floor(Math.random() * 1000) + 100,
        topScore: Math.random() * 0.4 + 0.6, // 0.6-1.0
        averageScore: Math.random() * 0.3 + 0.4 // 0.4-0.7
      },
      status: 'active',
      privateTestData: this.generatePrivateTestData(typeGroup.type, template.dataset),
      finalResults: {
        submissions: [],
        evaluationComplete: false,
        evaluationDate: new Date(endDate.getTime() + 24 * 60 * 60 * 1000) // 1日後に評価
      }
    };

    return problem;
  }

  // 問題タイトルからデータセットタイプを決定
  private getDatasetTypeFromTitle(title: string): string {
    const titleToTypeMap: Record<string, string> = {
      '顧客離脱予測': 'customer',
      '医療診断支援': 'medical',
      'ローンデフォルト予測': 'financial',
      '売上予測': 'sales',
      '住宅価格予測': 'housing',
      '株価予測': 'stock'
    };
    
    const datasetType = titleToTypeMap[title] || 'housing'; // デフォルトは住宅
    console.log(`問題タイトル "${title}" -> データセットタイプ "${datasetType}"`);
    return datasetType;
  }

  // Privateテストデータを生成
  private generatePrivateTestData(type: 'classification' | 'regression', dataset: any) {
    const { features, samples } = dataset;
    const data: number[][] = [];
    const targets: number[] = [];
    const featureNames: string[] = [];

    // 特徴量名を生成
    for (let i = 0; i < features; i++) {
      featureNames.push(`feature_${i + 1}`);
    }

    // データを生成
    for (let i = 0; i < samples; i++) {
      const row: number[] = [];
      
      // 各特徴量の値を生成
      for (let j = 0; j < features; j++) {
        if (type === 'classification') {
          // 分類問題: 0-1の範囲で正規分布
          const value = Math.random() * 2 - 1; // -1 to 1
          row.push(value);
        } else {
          // 回帰問題: より広い範囲で正規分布
          const value = (Math.random() - 0.5) * 10; // -5 to 5
          row.push(value);
        }
      }
      
      data.push(row);
      
      // ターゲット値を生成
      if (type === 'classification') {
        // 分類: 0または1
        targets.push(Math.random() > 0.5 ? 1 : 0);
      } else {
        // 回帰: 連続値
        const target = Math.random() * 100; // 0-100の範囲
        targets.push(target);
      }
    }

    return {
      data,
      targets,
      featureNames
    };
  }

  // 週次タイマーを開始
  private startWeeklyTimer() {
    const now = new Date();
    const nextMonday = this.getNextMonday(now);
    const timeUntilNextWeek = nextMonday.getTime() - now.getTime();

    setTimeout(() => {
      this.updateWeeklyProblem();
      this.startWeeklyTimer(); // 再帰的に次の週を設定
    }, timeUntilNextWeek);
  }

  // 次の月曜日を取得
  private getNextMonday(date: Date): Date {
    const day = date.getDay();
    const daysUntilMonday = day === 0 ? 1 : 8 - day;
    const nextMonday = new Date(date);
    nextMonday.setDate(date.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday;
  }

  // 週次問題を更新
  private updateWeeklyProblem() {
    const now = new Date();
    const weekStart = this.getWeekStart(now);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 前の問題の評価を完了させる
    if (this.currentProblem && this.currentProblem.status === 'active') {
      this.completeProblemEvaluation();
    }

    this.currentProblem = this.generateWeeklyProblem(weekStart, weekEnd);
    this.problemHistory.push(this.currentProblem);

    // リスナーに通知
    this.notifyListeners();
  }

  // 評価タイマーを開始
  private startEvaluationTimer() {
    // 毎分チェックして、評価時間になったら実行
    setInterval(() => {
      if (this.currentProblem && this.currentProblem.status === 'active') {
        const now = new Date();
        if (this.currentProblem.finalResults && now >= this.currentProblem.finalResults.evaluationDate) {
          this.completeProblemEvaluation();
        }
      }
    }, 60000); // 1分ごとにチェック
  }

  // 問題の評価を完了
  private completeProblemEvaluation() {
    if (!this.currentProblem || this.currentProblem.status !== 'active') {
      return;
    }

    this.currentProblem.status = 'evaluating';
    
    // 提出されたモデルを評価
    const submissions = this.submissions.get(this.currentProblem.id) || [];
    const evaluatedSubmissions = this.evaluateSubmissions(submissions);
    
    this.currentProblem.finalResults = {
      submissions: evaluatedSubmissions,
      evaluationComplete: true,
      evaluationDate: new Date()
    };

    this.currentProblem.status = 'completed';
    
    // リスナーに通知
    this.notifyListeners();
  }

  // 提出されたモデルを評価
  private evaluateSubmissions(submissions: FinalSubmission[]): FinalSubmission[] {
    return submissions.map((submission, index) => ({
      ...submission,
      privateScore: this.calculatePrivateScore(submission),
      rank: index + 1
    })).sort((a, b) => b.privateScore - a.privateScore);
  }

  // Privateスコアを計算
  private calculatePrivateScore(submission: FinalSubmission): number {
    // 実際のPrivateテストデータでの評価をシミュレート
    const baseScore = submission.publicScore;
    const noise = (Math.random() - 0.5) * 0.1; // ±5%のノイズ
    return Math.max(0, Math.min(1, baseScore + noise));
  }

  // 提出を追加
  addSubmission(problemId: string, submission: Omit<FinalSubmission, 'rank' | 'privateScore'>) {
    if (!this.submissions.has(problemId)) {
      this.submissions.set(problemId, []);
    }
    
    const submissions = this.submissions.get(problemId)!;
    submissions.push({
      ...submission,
      privateScore: 0, // 評価時に計算される
      rank: 0 // 評価時に計算される
    });
  }

  // 現在の問題を取得
  getCurrentProblem(): WeeklyProblem | null {
    return this.currentProblem;
  }

  // 問題履歴を取得
  getProblemHistory(): WeeklyProblem[] {
    return [...this.problemHistory];
  }

  // 残り時間を取得
  getTimeRemaining(): { days: number; hours: number; minutes: number } {
    if (!this.currentProblem) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    const now = new Date();
    const timeLeft = this.currentProblem.endDate.getTime() - now.getTime();

    if (timeLeft <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  }

  // リスナーを追加
  onProblemUpdate(callback: (problem: WeeklyProblem) => void) {
    this.listeners.push(callback);
  }

  // 問題ローテーションタイマーを開始
  private startProblemRotationTimer() {
    setInterval(() => {
      this.checkAndRotateProblem();
    }, 60 * 1000); // 1分ごとにチェック
  }

  // 問題のローテーションをチェック
  private checkAndRotateProblem() {
    const now = Date.now();
    if (now - this.lastProblemChange >= this.PROBLEM_DURATION) {
      this.rotateToNextProblem();
    }
  }

  // 次の問題にローテーション
  private rotateToNextProblem() {
    console.log('週次問題をローテーション中...');
    this.lastProblemChange = Date.now();
    this.initializeWeeklyProblem();
    this.notifyListeners();
  }

  // リスナーに通知
  private notifyListeners() {
    if (this.currentProblem) {
      this.listeners.forEach(callback => callback(this.currentProblem!));
    }
  }
}

// シングルトンインスタンス
export const weeklyProblemSystem = new WeeklyProblemSystem();
