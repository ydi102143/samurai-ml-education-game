export interface ProcessingStep {
  type: string;
  features: number[];
  params: any;
}

export interface FeatureOperation {
  id: string;
  type: string;
  name: string;
  description: string;
  features: number[];
  params?: any;
  customName?: string;
}

export interface SubmissionData {
  id: string;
  name: string;
  modelType: string;
  processingSteps: ProcessingStep[];
  featureEngineeringSteps: FeatureOperation[];
  predictions: (number | string)[];
  evaluationMetrics: any;
  timestamp: string;
  datasetHash: string;
  isSelected: boolean;
}

class SubmissionManager {
  private static instance: SubmissionManager;
  private submissions: SubmissionData[];
  private localStorageKey = 'ml_submissions';

  private constructor() {
    this.submissions = [];
    this.loadSubmissions();
  }

  public static getInstance(): SubmissionManager {
    if (!SubmissionManager.instance) {
      SubmissionManager.instance = new SubmissionManager();
    }
    return SubmissionManager.instance;
  }

  private loadSubmissions(): void {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      if (stored) {
        this.submissions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('提出データの読み込みエラー:', error);
      this.submissions = [];
    }
  }

  private saveSubmissions(): void {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.submissions));
    } catch (error) {
      console.error('提出データの保存エラー:', error);
    }
  }

  public addSubmission(submission: Omit<SubmissionData, 'id' | 'timestamp' | 'isSelected'>): SubmissionData {
    const newSubmission: SubmissionData = {
      ...submission,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isSelected: false
    };

    this.submissions.unshift(newSubmission);
    this.saveSubmissions();
    return newSubmission;
  }

  public getSubmissions(): SubmissionData[] {
    return [...this.submissions];
  }

  public getSubmission(id: string): SubmissionData | undefined {
    return this.submissions.find(sub => sub.id === id);
  }

  public selectSubmission(id: string): void {
    // 他の提出の選択を解除
    this.submissions.forEach(sub => {
      sub.isSelected = sub.id === id;
    });
    this.saveSubmissions();
  }

  public getSelectedSubmission(): SubmissionData | undefined {
    return this.submissions.find(sub => sub.isSelected);
  }

  public removeSubmission(id: string): void {
    this.submissions = this.submissions.filter(sub => sub.id !== id);
    this.saveSubmissions();
  }

  public clearSubmissions(): void {
    this.submissions = [];
    this.saveSubmissions();
  }

  public generateDatasetHash(data: any[]): string {
    // シンプルなハッシュ生成（実際の実装ではより堅牢なハッシュ関数を使用）
    const dataString = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return Math.abs(hash).toString(36);
  }
}

export const submissionManager = SubmissionManager.getInstance();