// データセット管理システム
export interface DatasetVersion {
  id: string;
  name: string;
  description: string;
  data: any[];
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[];
  targetColumn: string;
  problemType: 'classification' | 'regression';
  createdAt: Date;
  parentVersionId?: string;
  operations: DataOperation[];
}

export interface DataOperation {
  id: string;
  type: 'preprocessing' | 'feature_engineering' | 'data_split' | 'feature_selection';
  name: string;
  parameters: Record<string, any>;
  appliedAt: Date;
  description: string;
}

export interface DataSplit {
  trainData: any[];
  validationData: any[];
  testData: any[];
  trainIndices: number[];
  validationIndices: number[];
  testIndices: number[];
  splitRatio: {
    train: number;
    validation: number;
    test: number;
  };
  randomSeed: number;
}

export interface PublicPrivateData {
  publicData: any[];
  privateData: any[];
  publicIndices: number[];
  privateIndices: number[];
}

export class DatasetManager {
  private versions: Map<string, DatasetVersion> = new Map();
  private currentVersionId: string | null = null;
  private dataSplits: Map<string, DataSplit> = new Map();
  private publicPrivateData: Map<string, PublicPrivateData> = new Map();
  private listeners: Set<(dataset: DatasetVersion | null) => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultDatasets();
  }

  // ストレージからデータを読み込み
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('ml_dataset_manager');
      if (stored) {
        const data = JSON.parse(stored);
        this.currentVersionId = data.currentVersionId;
        
        if (data.versions) {
          this.versions = new Map();
          Object.entries(data.versions).forEach(([key, value]: [string, any]) => {
            this.versions.set(key, {
              ...value,
              createdAt: new Date(value.createdAt),
              operations: value.operations.map((op: any) => ({
                ...op,
                appliedAt: new Date(op.appliedAt)
              }))
            });
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load dataset manager from storage:', error);
    }
  }

  // ストレージにデータを保存
  private saveToStorage() {
    try {
      const data = {
        currentVersionId: this.currentVersionId,
        versions: Object.fromEntries(this.versions)
      };
      localStorage.setItem('ml_dataset_manager', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save dataset manager to storage:', error);
    }
  }

  // リスナーを追加
  addListener(listener: (dataset: DatasetVersion | null) => void) {
    this.listeners.add(listener);
  }

  // リスナーを削除
  removeListener(listener: (dataset: DatasetVersion | null) => void) {
    this.listeners.delete(listener);
  }

  // リスナーに通知
  private notifyListeners() {
    const currentDataset = this.getCurrentDataset();
    this.listeners.forEach(listener => listener(currentDataset));
  }

  private initializeDefaultDatasets() {
    // 医療診断データセット
    const medicalData = this.generateMedicalDataset();
    const medicalVersion: DatasetVersion = {
      id: 'medical-v1',
      name: '医療診断データセット',
      description: '患者の症状と診断結果のデータセット',
      data: medicalData.data,
      featureNames: medicalData.featureNames,
      featureTypes: medicalData.featureTypes,
      targetColumn: 'diagnosis',
      problemType: 'classification',
      createdAt: new Date(),
      operations: []
    };
    this.versions.set(medicalVersion.id, medicalVersion);

    // 住宅価格データセット
    const housingData = this.generateHousingDataset();
    const housingVersion: DatasetVersion = {
      id: 'housing-v1',
      name: '住宅価格データセット',
      description: '住宅の特徴と価格のデータセット',
      data: housingData.data,
      featureNames: housingData.featureNames,
      featureTypes: housingData.featureTypes,
      targetColumn: 'price',
      problemType: 'regression',
      createdAt: new Date(),
      operations: []
    };
    this.versions.set(housingVersion.id, housingVersion);

    // 不正検知データセット
    const fraudData = this.generateFraudDataset();
    const fraudVersion: DatasetVersion = {
      id: 'fraud-v1',
      name: '不正検知データセット',
      description: '取引データと不正検知のデータセット',
      data: fraudData.data,
      featureNames: fraudData.featureNames,
      featureTypes: fraudData.featureTypes,
      targetColumn: 'is_fraud',
      problemType: 'classification',
      createdAt: new Date(),
      operations: []
    };
    this.versions.set(fraudVersion.id, fraudVersion);

    this.currentVersionId = medicalVersion.id;
  }

  private generateMedicalDataset() {
    const featureNames = [
      'age', 'gender', 'blood_pressure', 'cholesterol', 'glucose',
      'bmi', 'smoking', 'exercise', 'family_history', 'symptoms',
      'medication', 'previous_diagnosis', 'stress_level', 'sleep_hours'
    ];
    
    const featureTypes: ('numerical' | 'categorical')[] = [
      'numerical', 'categorical', 'numerical', 'numerical', 'numerical',
      'numerical', 'categorical', 'categorical', 'categorical', 'categorical',
      'categorical', 'categorical', 'numerical', 'numerical'
    ];

    const data = [];
    for (let i = 0; i < 1000; i++) {
      const age = Math.floor(Math.random() * 60) + 20;
      const gender = Math.random() > 0.5 ? 'Male' : 'Female';
      const bloodPressure = Math.floor(Math.random() * 40) + 90;
      const cholesterol = Math.floor(Math.random() * 100) + 150;
      const glucose = Math.floor(Math.random() * 50) + 70;
      const bmi = Math.random() * 15 + 18;
      const smoking = Math.random() > 0.7 ? 'Yes' : 'No';
      const exercise = Math.random() > 0.6 ? 'Regular' : 'Irregular';
      const familyHistory = Math.random() > 0.8 ? 'Yes' : 'No';
      const symptoms = ['None', 'Mild', 'Moderate', 'Severe'][Math.floor(Math.random() * 4)];
      const medication = Math.random() > 0.5 ? 'Yes' : 'No';
      const previousDiagnosis = Math.random() > 0.9 ? 'Yes' : 'No';
      const stressLevel = Math.random() * 10;
      const sleepHours = Math.random() * 4 + 6;

      // 診断結果の生成（現実的な確率で）
      let diagnosis = 'Healthy';
      if (age > 50 && (bloodPressure > 120 || cholesterol > 200)) {
        diagnosis = Math.random() > 0.3 ? 'Cardiovascular' : 'Healthy';
      } else if (glucose > 100 && bmi > 25) {
        diagnosis = Math.random() > 0.4 ? 'Diabetes' : 'Healthy';
      } else if (stressLevel > 7 && sleepHours < 7) {
        diagnosis = Math.random() > 0.5 ? 'Mental Health' : 'Healthy';
      }

      data.push({
        age,
        gender,
        blood_pressure: bloodPressure,
        cholesterol,
        glucose,
        bmi: Math.round(bmi * 10) / 10,
        smoking,
        exercise,
        family_history: familyHistory,
        symptoms,
        medication,
        previous_diagnosis: previousDiagnosis,
        stress_level: Math.round(stressLevel * 10) / 10,
        sleep_hours: Math.round(sleepHours * 10) / 10,
        diagnosis
      });
    }

    return { data, featureNames, featureTypes };
  }

  private generateHousingDataset() {
    const featureNames = [
      'size', 'bedrooms', 'bathrooms', 'age', 'location',
      'floor', 'elevator', 'parking', 'balcony', 'garden',
      'near_station', 'near_school', 'crime_rate', 'population_density'
    ];
    
    const featureTypes: ('numerical' | 'categorical')[] = [
      'numerical', 'numerical', 'numerical', 'numerical', 'categorical',
      'numerical', 'categorical', 'categorical', 'categorical', 'categorical',
      'categorical', 'categorical', 'numerical', 'numerical'
    ];

    const data = [];
    for (let i = 0; i < 1000; i++) {
      const size = Math.floor(Math.random() * 200) + 30;
      const bedrooms = Math.floor(Math.random() * 4) + 1;
      const bathrooms = Math.floor(Math.random() * 3) + 1;
      const age = Math.floor(Math.random() * 50);
      const location = ['Urban', 'Suburban', 'Rural'][Math.floor(Math.random() * 3)];
      const floor = Math.floor(Math.random() * 20) + 1;
      const elevator = Math.random() > 0.3 ? 'Yes' : 'No';
      const parking = Math.random() > 0.4 ? 'Yes' : 'No';
      const balcony = Math.random() > 0.5 ? 'Yes' : 'No';
      const garden = Math.random() > 0.7 ? 'Yes' : 'No';
      const nearStation = Math.random() > 0.6 ? 'Yes' : 'No';
      const nearSchool = Math.random() > 0.5 ? 'Yes' : 'No';
      const crimeRate = Math.random() * 10;
      const populationDensity = Math.floor(Math.random() * 5000) + 500;

      // 価格の計算（現実的な式）
      let price = size * 50; // 基本価格
      price += bedrooms * 10000;
      price += bathrooms * 15000;
      price -= age * 500;
      if (location === 'Urban') price *= 1.5;
      else if (location === 'Suburban') price *= 1.2;
      if (elevator === 'Yes') price *= 1.1;
      if (parking === 'Yes') price *= 1.05;
      if (nearStation === 'Yes') price *= 1.15;
      if (nearSchool === 'Yes') price *= 1.08;
      price -= crimeRate * 1000;
      price += Math.random() * 50000 - 25000; // ノイズ

      data.push({
        size,
        bedrooms,
        bathrooms,
        age,
        location,
        floor,
        elevator,
        parking,
        balcony,
        garden,
        near_station: nearStation,
        near_school: nearSchool,
        crime_rate: Math.round(crimeRate * 10) / 10,
        population_density: populationDensity,
        price: Math.round(price)
      });
    }

    return { data, featureNames, featureTypes };
  }

  private generateFraudDataset() {
    const featureNames = [
      'amount', 'time', 'merchant_category', 'card_type', 'user_age',
      'user_income', 'transaction_frequency', 'location', 'device_type',
      'ip_address', 'previous_fraud', 'account_age', 'credit_score'
    ];
    
    const featureTypes: ('numerical' | 'categorical')[] = [
      'numerical', 'numerical', 'categorical', 'categorical', 'numerical',
      'numerical', 'numerical', 'categorical', 'categorical',
      'categorical', 'categorical', 'numerical', 'numerical'
    ];

    const data = [];
    for (let i = 0; i < 1000; i++) {
      const amount = Math.random() * 10000;
      const time = Math.random() * 24;
      const merchantCategory = ['Retail', 'Gas', 'Restaurant', 'Online', 'ATM'][Math.floor(Math.random() * 5)];
      const cardType = ['Credit', 'Debit', 'Prepaid'][Math.floor(Math.random() * 3)];
      const userAge = Math.floor(Math.random() * 50) + 18;
      const userIncome = Math.floor(Math.random() * 100000) + 20000;
      const transactionFrequency = Math.floor(Math.random() * 30) + 1;
      const location = ['Domestic', 'International'][Math.floor(Math.random() * 2)];
      const deviceType = ['Mobile', 'Desktop', 'ATM'][Math.floor(Math.random() * 3)];
      const ipAddress = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const previousFraud = Math.random() > 0.9 ? 'Yes' : 'No';
      const accountAge = Math.floor(Math.random() * 20) + 1;
      const creditScore = Math.floor(Math.random() * 400) + 300;

      // 不正検知の生成（現実的な確率で）
      let isFraud = 'No';
      if (amount > 5000 && time > 22) {
        isFraud = Math.random() > 0.7 ? 'Yes' : 'No';
      } else if (location === 'International' && amount > 2000) {
        isFraud = Math.random() > 0.6 ? 'Yes' : 'No';
      } else if (previousFraud === 'Yes') {
        isFraud = Math.random() > 0.4 ? 'Yes' : 'No';
      } else if (creditScore < 400 && amount > 3000) {
        isFraud = Math.random() > 0.5 ? 'Yes' : 'No';
      }

      data.push({
        amount: Math.round(amount * 100) / 100,
        time: Math.round(time * 10) / 10,
        merchant_category: merchantCategory,
        card_type: cardType,
        user_age: userAge,
        user_income: userIncome,
        transaction_frequency: transactionFrequency,
        location,
        device_type: deviceType,
        ip_address: ipAddress,
        previous_fraud: previousFraud,
        account_age: accountAge,
        credit_score: creditScore,
        is_fraud: isFraud
      });
    }

    return { data, featureNames, featureTypes };
  }

  // 現在のデータセットを取得
  getCurrentDataset(): DatasetVersion | null {
    if (!this.currentVersionId) {
      return null;
    }
    return this.versions.get(this.currentVersionId) || null;
  }

  // データセットを切り替え
  switchDataset(versionId: string): boolean {
    if (this.versions.has(versionId)) {
      this.currentVersionId = versionId;
      this.saveToStorage();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  // 新しいバージョンを作成（操作を適用後）
  createVersion(operation: DataOperation): DatasetVersion | null {
    const current = this.getCurrentDataset();
    if (!current) return null;

    const newVersion: DatasetVersion = {
      id: `${current.id}-${Date.now()}`,
      name: `${current.name} (${operation.name}適用後)`,
      description: `${current.description} - ${operation.description}`,
      data: [...current.data], // コピー
      featureNames: [...current.featureNames],
      featureTypes: [...current.featureTypes],
      targetColumn: current.targetColumn,
      problemType: current.problemType,
      createdAt: new Date(),
      parentVersionId: current.id,
      operations: [...current.operations, operation]
    };

    this.versions.set(newVersion.id, newVersion);
    this.currentVersionId = newVersion.id;
    this.saveToStorage();
    this.notifyListeners();
    return newVersion;
  }

  // データセットを直接更新（既存のバージョンを更新）
  updateCurrentDataset(updates: Partial<Pick<DatasetVersion, 'data' | 'featureNames' | 'featureTypes'>>): boolean {
    const current = this.getCurrentDataset();
    if (!current) return false;

    if (updates.data) current.data = updates.data;
    if (updates.featureNames) current.featureNames = updates.featureNames;
    if (updates.featureTypes) current.featureTypes = updates.featureTypes;

    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  // データセットを初期化（問題データから）
  initializeFromProblem(problemData: {
    name: string;
    description: string;
    data: any[];
    featureNames: string[];
    featureTypes: ('numerical' | 'categorical')[];
    targetColumn: string;
    problemType: 'classification' | 'regression';
  }): string {
    const versionId = `problem-${Date.now()}`;
    const version: DatasetVersion = {
      id: versionId,
      name: problemData.name,
      description: problemData.description,
      data: problemData.data,
      featureNames: problemData.featureNames,
      featureTypes: problemData.featureTypes,
      targetColumn: problemData.targetColumn,
      problemType: problemData.problemType,
      createdAt: new Date(),
      operations: []
    };

    this.versions.set(versionId, version);
    this.currentVersionId = versionId;
    this.saveToStorage();
    this.notifyListeners();
    return versionId;
  }

  // データ分割を実行
  splitData(versionId: string, trainRatio: number, validationRatio: number, randomSeed: number): DataSplit | null {
    const version = this.versions.get(versionId);
    if (!version) return null;

    const data = version.data;
    const indices = Array.from({ length: data.length }, (_, i) => i);
    
    // シードを設定してシャッフル
    const seededRandom = this.createSeededRandom(randomSeed);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const trainCount = Math.floor(data.length * trainRatio / 100);
    const validationCount = Math.floor(data.length * validationRatio / 100);

    const trainIndices = indices.slice(0, trainCount);
    const validationIndices = indices.slice(trainCount, trainCount + validationCount);
    const testIndices = indices.slice(trainCount + validationCount);

    const split: DataSplit = {
      trainData: trainIndices.map(i => data[i]),
      validationData: validationIndices.map(i => data[i]),
      testData: testIndices.map(i => data[i]),
      trainIndices,
      validationIndices,
      testIndices,
      splitRatio: {
        train: trainRatio,
        validation: validationRatio,
        test: 100 - trainRatio - validationRatio
      },
      randomSeed
    };

    this.dataSplits.set(versionId, split);
    return split;
  }

  // Public/Privateデータを生成
  generatePublicPrivateData(versionId: string, publicRatio: number = 0.7): PublicPrivateData | null {
    const version = this.versions.get(versionId);
    if (!version) return null;

    const data = version.data;
    const indices = Array.from({ length: data.length }, (_, i) => i);
    
    // ランダムにシャッフル
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const publicCount = Math.floor(data.length * publicRatio);
    const publicIndices = indices.slice(0, publicCount);
    const privateIndices = indices.slice(publicCount);

    const publicPrivateData: PublicPrivateData = {
      publicData: publicIndices.map(i => data[i]),
      privateData: privateIndices.map(i => data[i]),
      publicIndices,
      privateIndices
    };

    this.publicPrivateData.set(versionId, publicPrivateData);
    return publicPrivateData;
  }

  // データ分割を取得
  getDataSplit(versionId: string): DataSplit | null {
    return this.dataSplits.get(versionId) || null;
  }

  // Public/Privateデータを取得
  getPublicPrivateData(versionId: string): PublicPrivateData | null {
    return this.publicPrivateData.get(versionId) || null;
  }

  // 利用可能なデータセット一覧を取得
  getAvailableDatasets(): DatasetVersion[] {
    return Array.from(this.versions.values());
  }

  // シード付きランダム関数
  private createSeededRandom(seed: number) {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  // データの統計情報を取得
  getDataStatistics(versionId: string): any {
    const version = this.versions.get(versionId);
    if (!version) return null;

    const stats: any = {
      totalSamples: version.data.length,
      features: version.featureNames.length,
      numericalFeatures: version.featureTypes.filter(t => t === 'numerical').length,
      categoricalFeatures: version.featureTypes.filter(t => t === 'categorical').length,
      missingValues: {},
      featureStats: {}
    };

    // 各特徴量の統計
    version.featureNames.forEach((feature, index) => {
      const values = version.data.map(row => row[feature]).filter(val => val !== null && val !== undefined);
      const missingCount = version.data.length - values.length;
      
      stats.missingValues[feature] = missingCount;

      if (version.featureTypes[index] === 'numerical') {
        const numValues = values.map(v => Number(v)).filter(v => !isNaN(v));
        if (numValues.length > 0) {
          stats.featureStats[feature] = {
            type: 'numerical',
            mean: numValues.reduce((a, b) => a + b, 0) / numValues.length,
            min: Math.min(...numValues),
            max: Math.max(...numValues),
            std: Math.sqrt(numValues.reduce((sq, n) => sq + Math.pow(n - (numValues.reduce((a, b) => a + b, 0) / numValues.length), 2), 0) / numValues.length)
          };
        }
      } else {
        const uniqueValues = [...new Set(values)];
        stats.featureStats[feature] = {
          type: 'categorical',
          uniqueCount: uniqueValues.length,
          mostCommon: uniqueValues.reduce((a, b) => 
            values.filter(v => v === a).length > values.filter(v => v === b).length ? a : b
          )
        };
      }
    });

    return stats;
  }

}

// シングルトンインスタンス
export const datasetManager = new DatasetManager();
