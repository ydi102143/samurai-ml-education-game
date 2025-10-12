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
  private evaluationTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeWeeklyProblem();
    this.startWeeklyTimer();
    this.startEvaluationTimer();
  }

  // 週次問題を初期化
  private initializeWeeklyProblem() {
    const now = new Date();
    const weekStart = this.getWeekStart(now);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    this.currentProblem = this.generateWeeklyProblem(weekStart, weekEnd);
    this.problemHistory.push(this.currentProblem);
  }

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
  private generateWeeklyProblem(startDate: Date, endDate: Date): WeeklyProblem {
    const problemTypes = [
      {
        type: 'classification' as const,
        templates: [
          {
            title: '顧客離脱予測',
            description: '顧客の行動データから離脱を予測する分類問題です。',
            difficulty: 'medium' as const,
            dataset: {
              name: '顧客離脱データセット',
              description: '顧客の利用履歴、属性、行動パターンを含むデータセット',
              features: 15,
              samples: 10000,
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
              description: '血液検査、画像診断、症状データを含む医療データセット',
              features: 25,
              samples: 5000,
              targetName: '疾患分類'
            },
            evaluation: {
              metric: 'F1-Score',
              description: 'F1スコアで評価されます'
            }
          },
          {
            title: '不正検出',
            description: '金融取引データから不正な取引を検出する分類問題です。',
            difficulty: 'easy' as const,
            dataset: {
              name: '金融取引データセット',
              description: '取引金額、時間、場所、顧客情報を含むデータセット',
              features: 12,
              samples: 15000,
              targetName: '不正フラグ'
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
            title: '不動産価格予測',
            description: '物件の特徴から価格を予測する回帰問題です。',
            difficulty: 'medium' as const,
            dataset: {
              name: '不動産価格データセット',
              description: '立地、面積、築年数、設備などの物件情報を含むデータセット',
              features: 18,
              samples: 8000,
              targetName: '価格'
            },
            evaluation: {
              metric: 'RMSE',
              description: '平均二乗平方根誤差で評価されます'
            }
          },
          {
            title: '売上予測',
            description: '過去の売上データから将来の売上を予測する回帰問題です。',
            difficulty: 'hard' as const,
            dataset: {
              name: '売上データセット',
              description: '季節性、トレンド、外部要因を含む時系列データセット',
              features: 20,
              samples: 12000,
              targetName: '売上金額'
            },
            evaluation: {
              metric: 'MAE',
              description: '平均絶対誤差で評価されます'
            }
          },
          {
            title: 'エネルギー消費予測',
            description: '建物の使用状況からエネルギー消費量を予測する回帰問題です。',
            difficulty: 'easy' as const,
            dataset: {
              name: 'エネルギー消費データセット',
              description: '気温、湿度、使用人数、時間帯などの環境データセット',
              features: 14,
              samples: 20000,
              targetName: '消費量'
            },
            evaluation: {
              metric: 'R²',
              description: '決定係数で評価されます'
            }
          }
        ]
      }
    ];

    const typeGroup = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    const template = typeGroup.templates[Math.floor(Math.random() * typeGroup.templates.length)];

    const problem: WeeklyProblem = {
      id: `problem_${Date.now()}`,
      title: template.title,
      description: template.description,
      type: typeGroup.type,
      difficulty: template.difficulty,
      startDate,
      endDate,
      dataset: template.dataset,
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
    this.evaluationTimer = setInterval(() => {
      if (this.currentProblem && this.currentProblem.status === 'active') {
        const now = new Date();
        if (now >= this.currentProblem.finalResults!.evaluationDate) {
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

  // リスナーに通知
  private notifyListeners() {
    if (this.currentProblem) {
      this.listeners.forEach(callback => callback(this.currentProblem!));
    }
  }
}

// シングルトンインスタンス
export const weeklyProblemSystem = new WeeklyProblemSystem();
