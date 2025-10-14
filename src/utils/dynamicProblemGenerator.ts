// 動的問題生成システム
export interface ProblemTemplate {
  id: string;
  title: string;
  description: string;
  type: 'classification' | 'regression';
  difficulty: 'easy' | 'medium' | 'hard';
  datasetType: string;
  features: number;
  samples: number;
  evaluationMetric: string;
  timeLimit: number; // ミリ秒
}

export interface GeneratedProblem {
  id: string;
  title: string;
  description: string;
  type: 'classification' | 'regression';
  difficulty: 'easy' | 'medium' | 'hard';
  dataset: {
    type: string;
    size: number;
    features: number;
  };
  evaluation: {
    metric: string;
    threshold: number;
  };
  timeLimit: number;
  createdAt: number;
}

export interface GenerationConfig {
  enableAutoGeneration: boolean;
  generationInterval: number; // ミリ秒
  maxActiveProblems: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export class DynamicProblemGenerator {
  private templates: Map<string, ProblemTemplate> = new Map();
  private generatedProblems: Map<string, GeneratedProblem> = new Map();
  private config: GenerationConfig;
  private generator: NodeJS.Timeout | null = null;
  private listeners: Set<(problem: GeneratedProblem) => void> = new Set();

  constructor(config: GenerationConfig = {
    enableAutoGeneration: true,
    generationInterval: 24 * 60 * 60 * 1000, // 24時間
    maxActiveProblems: 3,
    difficultyDistribution: {
      easy: 0.4,
      medium: 0.4,
      hard: 0.2
    }
  }) {
    this.config = config;
    this.initializeTemplates();
    this.startGenerator();
  }

  // テンプレートを初期化
  private initializeTemplates(): void {
    const templates: ProblemTemplate[] = [
      {
        id: 'template_001',
        title: '売上予測チャレンジ',
        description: '店舗の売上を予測する回帰問題',
        type: 'regression',
        difficulty: 'easy',
        datasetType: 'sales',
        features: 8,
        samples: 1000,
        evaluationMetric: 'RMSE',
        timeLimit: 7 * 24 * 60 * 60 * 1000 // 7日
      },
      {
        id: 'template_002',
        title: '顧客分類チャレンジ',
        description: '顧客を分類する分類問題',
        type: 'classification',
        difficulty: 'medium',
        datasetType: 'customer',
        features: 6,
        samples: 800,
        evaluationMetric: 'Accuracy',
        timeLimit: 7 * 24 * 60 * 60 * 1000
      },
      {
        id: 'template_003',
        title: '不正検出チャレンジ',
        description: '不正な取引を検出する分類問題',
        type: 'classification',
        difficulty: 'hard',
        datasetType: 'fraud',
        features: 12,
        samples: 1500,
        evaluationMetric: 'F1-Score',
        timeLimit: 7 * 24 * 60 * 60 * 1000
      },
      {
        id: 'template_004',
        title: '価格予測チャレンジ',
        description: '商品の価格を予測する回帰問題',
        type: 'regression',
        difficulty: 'medium',
        datasetType: 'pricing',
        features: 10,
        samples: 1200,
        evaluationMetric: 'MAE',
        timeLimit: 7 * 24 * 60 * 60 * 1000
      },
      {
        id: 'template_005',
        title: '医療診断チャレンジ',
        description: '病気を診断する分類問題',
        type: 'classification',
        difficulty: 'hard',
        datasetType: 'medical',
        features: 15,
        samples: 2000,
        evaluationMetric: 'Precision',
        timeLimit: 7 * 24 * 60 * 60 * 1000
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // ジェネレーターを開始
  private startGenerator(): void {
    if (!this.config.enableAutoGeneration) return;

    this.generator = setInterval(() => {
      this.generateProblem();
    }, this.config.generationInterval);
  }

  // 問題を生成
  generateProblem(): GeneratedProblem | null {
    if (this.generatedProblems.size >= this.config.maxActiveProblems) {
      console.log('Maximum active problems reached');
      return null;
    }

    const template = this.selectTemplate();
    if (!template) return null;

    const problem: GeneratedProblem = {
      id: `problem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: template.title,
      description: template.description,
      type: template.type,
      difficulty: template.difficulty,
      dataset: {
        type: template.datasetType,
        size: template.samples,
        features: template.features
      },
      evaluation: {
        metric: template.evaluationMetric,
        threshold: this.calculateThreshold(template)
      },
      timeLimit: template.timeLimit,
      createdAt: Date.now()
    };

    this.generatedProblems.set(problem.id, problem);
    this.notifyListeners(problem);
    return problem;
  }

  // テンプレートを選択
  private selectTemplate(): ProblemTemplate | null {
    const availableTemplates = Array.from(this.templates.values());
    if (availableTemplates.length === 0) return null;

    // 難易度分布に基づいて選択
    const random = Math.random();
    let difficulty: 'easy' | 'medium' | 'hard';
    
    if (random < this.config.difficultyDistribution.easy) {
      difficulty = 'easy';
    } else if (random < this.config.difficultyDistribution.easy + this.config.difficultyDistribution.medium) {
      difficulty = 'medium';
    } else {
      difficulty = 'hard';
    }

    const filteredTemplates = availableTemplates.filter(t => t.difficulty === difficulty);
    if (filteredTemplates.length === 0) {
      // 該当する難易度のテンプレートがない場合はランダム選択
      return availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    }

    return filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)];
  }

  // 閾値を計算
  private calculateThreshold(template: ProblemTemplate): number {
    switch (template.evaluationMetric) {
      case 'Accuracy':
        return 0.8 + Math.random() * 0.15; // 0.8-0.95
      case 'Precision':
        return 0.75 + Math.random() * 0.2; // 0.75-0.95
      case 'Recall':
        return 0.75 + Math.random() * 0.2; // 0.75-0.95
      case 'F1-Score':
        return 0.8 + Math.random() * 0.15; // 0.8-0.95
      case 'RMSE':
        return 0.1 + Math.random() * 0.2; // 0.1-0.3
      case 'MAE':
        return 0.05 + Math.random() * 0.15; // 0.05-0.2
      case 'R²':
        return 0.7 + Math.random() * 0.25; // 0.7-0.95
      default:
        return 0.8;
    }
  }

  // 問題を取得
  getProblem(problemId: string): GeneratedProblem | undefined {
    return this.generatedProblems.get(problemId);
  }

  // 全問題を取得
  getAllProblems(): GeneratedProblem[] {
    return Array.from(this.generatedProblems.values());
  }

  // アクティブな問題を取得
  getActiveProblems(): GeneratedProblem[] {
    const now = Date.now();
    return this.getAllProblems().filter(problem => 
      now - problem.createdAt < problem.timeLimit
    );
  }

  // 問題を削除
  removeProblem(problemId: string): boolean {
    const removed = this.generatedProblems.delete(problemId);
    if (removed) {
      console.log(`Problem ${problemId} removed`);
    }
    return removed;
  }

  // テンプレートを追加
  addTemplate(template: ProblemTemplate): void {
    this.templates.set(template.id, template);
  }

  // テンプレートを削除
  removeTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  // 統計情報を取得
  getStats(): {
    totalTemplates: number;
    totalProblems: number;
    activeProblems: number;
    problemsByDifficulty: Record<string, number>;
    problemsByType: Record<string, number>;
  } {
    const allProblems = this.getAllProblems();
    const activeProblems = this.getActiveProblems();
    
    const problemsByDifficulty: Record<string, number> = {};
    const problemsByType: Record<string, number> = {};

    allProblems.forEach(problem => {
      problemsByDifficulty[problem.difficulty] = (problemsByDifficulty[problem.difficulty] || 0) + 1;
      problemsByType[problem.type] = (problemsByType[problem.type] || 0) + 1;
    });

    return {
      totalTemplates: this.templates.size,
      totalProblems: allProblems.length,
      activeProblems: activeProblems.length,
      problemsByDifficulty,
      problemsByType
    };
  }

  // リスナーを追加
  addListener(listener: (problem: GeneratedProblem) => void): void {
    this.listeners.add(listener);
  }

  // リスナーを削除
  removeListener(listener: (problem: GeneratedProblem) => void): void {
    this.listeners.delete(listener);
  }

  // リスナーに通知
  private notifyListeners(problem: GeneratedProblem): void {
    this.listeners.forEach(listener => {
      try {
        listener(problem);
      } catch (error) {
        console.error('Problem generator listener error:', error);
      }
    });
  }

  // 設定を更新
  updateConfig(newConfig: Partial<GenerationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.enableAutoGeneration !== undefined) {
      if (newConfig.enableAutoGeneration && !this.generator) {
        this.startGenerator();
      } else if (!newConfig.enableAutoGeneration && this.generator) {
        clearInterval(this.generator);
        this.generator = null;
      }
    }
  }

  // 設定を取得
  getConfig(): GenerationConfig {
    return { ...this.config };
  }

  // 破棄
  destroy(): void {
    if (this.generator) {
      clearInterval(this.generator);
      this.generator = null;
    }
    this.listeners.clear();
  }
}

// シングルトンインスタンス
export const dynamicProblemGenerator = new DynamicProblemGenerator();

