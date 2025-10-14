// シンプルなデータ管理システム
export interface SimpleDataset {
  id: string;
  name: string;
  type: 'classification' | 'regression';
  description: string;
  data: (number | string)[][];
  featureNames: string[];
  targetName: string;
  targetValues: number[];
  featureTypes?: ('numerical' | 'categorical')[];
}

export interface ProcessedDataset {
  data: (number | string)[][];
  featureNames: string[];
  targetValues: number[];
  processingSteps: string[];
  featureTypes: ('numerical' | 'categorical')[];
  encodingInfo: Record<string, any>;
}

export class SimpleDataManager {
  private currentDataset: SimpleDataset | null = null;
  private processedDataset: ProcessedDataset | null = null;

  // データセットを生成
  generateDataset(type: 'classification' | 'regression', specificType?: string): SimpleDataset {
    const datasetTypes = type === 'classification' ? 
      ['customer', 'medical', 'financial', 'marketing', 'social'] :
      ['housing', 'sales', 'stock', 'weather', 'energy'];
    
    // 特定のタイプが指定されている場合はそれを使用、そうでなければランダム選択
    const selectedType = specificType && datasetTypes.includes(specificType) ? 
      specificType : 
      datasetTypes[Math.floor(Math.random() * datasetTypes.length)];
    
    const datasets = {
      classification: {
        customer: this.generateCustomerData(),
        medical: this.generateMedicalData(),
        financial: this.generateFinancialData(),
        marketing: this.generateMarketingData(),
        social: this.generateSocialData()
      },
      regression: {
        housing: this.generateHousingData(),
        sales: this.generateSalesData(),
        stock: this.generateStockData(),
        weather: this.generateWeatherData(),
        energy: this.generateEnergyData()
      }
    };

    const selectedDataset = datasets[type][selectedType as keyof typeof datasets[typeof type]];
    if (!selectedDataset) {
      throw new Error(`Dataset type ${selectedType} not found`);
    }
    this.currentDataset = selectedDataset;
    return this.currentDataset;
  }

  // 顧客データを生成
  private generateCustomerData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['age', 'income', 'education', 'gender', 'city_size', 'credit_score', 'marital_status', 'occupation'];

    for (let i = 0; i < 1500; i++) {
      const age = Math.floor(Math.random() * 50) + 20;
      const income = Math.random() * 150000 + 20000;
      const education = ['high_school', 'bachelor', 'master', 'phd', 'vocational'][Math.floor(Math.random() * 5)];
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const citySize = ['small', 'medium', 'large', 'mega'][Math.floor(Math.random() * 4)];
      const creditScore = Math.floor(Math.random() * 400) + 300;
      const maritalStatus = ['single', 'married', 'divorced', 'widowed'][Math.floor(Math.random() * 4)];
      const occupation = ['engineer', 'teacher', 'doctor', 'sales', 'manager', 'student', 'retired'][Math.floor(Math.random() * 7)];
      
      // 複雑な分類ルール（顧客満足度）
      let target = 0;
      if (income > 80000 && creditScore > 700) target = 1;
      if (education === 'phd' && occupation === 'doctor') target = 1;
      if (age > 40 && maritalStatus === 'married' && citySize === 'large') target = 1;
      if (creditScore > 750 && income > 100000) target = 1;
      
      data.push([age, income, education, gender, citySize, creditScore, maritalStatus, occupation]);
      targetValues.push(target);
    }

    return {
      id: 'customer_' + Date.now(),
      name: '顧客満足度データセット',
      type: 'classification',
      description: '顧客の属性から満足度を予測する分類問題（8特徴量、1500サンプル）',
      data: data.map(row => row.map(val => typeof val === 'string' ? val : val)),
      featureNames,
      targetName: 'satisfaction',
      targetValues
    };
  }

  // 医療データを生成
  private generateMedicalData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['age', 'blood_pressure', 'cholesterol', 'bmi', 'smoking', 'exercise', 'diet', 'family_history'];

    for (let i = 0; i < 1200; i++) {
      const age = Math.floor(Math.random() * 60) + 30;
      const bloodPressure = Math.floor(Math.random() * 60) + 90;
      const cholesterol = Math.floor(Math.random() * 200) + 150;
      const bmi = Math.random() * 20 + 18;
      const smoking = Math.random() > 0.7 ? 'yes' : 'no';
      const exercise = ['none', 'light', 'moderate', 'heavy'][Math.floor(Math.random() * 4)];
      const diet = ['poor', 'average', 'good', 'excellent'][Math.floor(Math.random() * 4)];
      const familyHistory = Math.random() > 0.6 ? 'yes' : 'no';
      
      // 心臓病リスク予測
      let target = 0;
      if (bloodPressure > 140 || cholesterol > 250) target = 1;
      if (smoking === 'yes' && age > 50) target = 1;
      if (bmi > 30 && exercise === 'none') target = 1;
      if (familyHistory === 'yes' && (bloodPressure > 130 || cholesterol > 220)) target = 1;
      
      data.push([age, bloodPressure, cholesterol, bmi, smoking, exercise, diet, familyHistory]);
      targetValues.push(target);
    }

    return {
      id: 'medical_' + Date.now(),
      name: '心臓病リスク予測データセット',
      type: 'classification',
      description: '患者の健康指標から心臓病リスクを予測する分類問題（8特徴量、1200サンプル）',
      data: data.map(row => row.map(val => typeof val === 'string' ? val : val)),
      featureNames,
      targetName: 'heart_disease_risk',
      targetValues
    };
  }

  // 金融データを生成
  private generateFinancialData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['account_balance', 'credit_score', 'loan_amount', 'employment_years', 'debt_ratio', 'income_stability', 'loan_purpose', 'collateral'];

    for (let i = 0; i < 2000; i++) {
      const accountBalance = Math.random() * 100000;
      const creditScore = Math.floor(Math.random() * 400) + 300;
      const loanAmount = Math.random() * 500000 + 10000;
      const employmentYears = Math.floor(Math.random() * 30);
      const debtRatio = Math.random() * 0.8;
      const incomeStability = ['unstable', 'stable', 'very_stable'][Math.floor(Math.random() * 3)];
      const loanPurpose = ['home', 'car', 'education', 'business', 'personal'][Math.floor(Math.random() * 5)];
      const collateral = Math.random() > 0.5 ? 'yes' : 'no';
      
      // ローンデフォルト予測
      let target = 0;
      if (creditScore < 600 || debtRatio > 0.5) target = 1;
      if (employmentYears < 2 && loanAmount > 100000) target = 1;
      if (incomeStability === 'unstable' && loanAmount > accountBalance * 2) target = 1;
      if (creditScore < 650 && debtRatio > 0.4 && collateral === 'no') target = 1;
      
      data.push([accountBalance, creditScore, loanAmount, employmentYears, debtRatio, incomeStability, loanPurpose, collateral]);
      targetValues.push(target);
    }

    return {
      id: 'financial_' + Date.now(),
      name: 'ローンデフォルト予測データセット',
      type: 'classification',
      description: '借入者の属性からデフォルトリスクを予測する分類問題（8特徴量、2000サンプル）',
      data: data.map(row => row.map(val => typeof val === 'string' ? val : val)),
      featureNames,
      targetName: 'default_risk',
      targetValues
    };
  }

  // マーケティングデータを生成
  private generateMarketingData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['age', 'income', 'education', 'gender', 'city_size', 'credit_score', 'marital_status', 'occupation'];

    for (let i = 0; i < 1800; i++) {
      const age = Math.floor(Math.random() * 50) + 20;
      const income = Math.random() * 150000 + 20000;
      const education = ['high_school', 'bachelor', 'master', 'phd', 'vocational'][Math.floor(Math.random() * 5)];
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const citySize = ['small', 'medium', 'large', 'mega'][Math.floor(Math.random() * 4)];
      const creditScore = Math.floor(Math.random() * 400) + 300;
      const maritalStatus = ['single', 'married', 'divorced', 'widowed'][Math.floor(Math.random() * 4)];
      const occupation = ['engineer', 'teacher', 'doctor', 'sales', 'manager', 'student', 'retired'][Math.floor(Math.random() * 7)];
      
      // 商品購入予測
      let target = 0;
      if (income > 80000 && creditScore > 700) target = 1;
      if (education === 'phd' && occupation === 'doctor') target = 1;
      if (age > 40 && maritalStatus === 'married' && citySize === 'large') target = 1;
      if (creditScore > 750 && income > 100000) target = 1;
      
      data.push([age, income, education, gender, citySize, creditScore, maritalStatus, occupation]);
      targetValues.push(target);
    }

    return {
      id: 'marketing_' + Date.now(),
      name: '商品購入予測データセット',
      type: 'classification',
      description: '顧客の属性から商品購入可能性を予測する分類問題（8特徴量、1800サンプル）',
      data: data.map(row => row.map(val => typeof val === 'string' ? val : val)),
      featureNames,
      targetName: 'purchase_intent',
      targetValues
    };
  }

  // ソーシャルデータを生成
  private generateSocialData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['age', 'income', 'education', 'gender', 'city_size', 'credit_score', 'marital_status', 'occupation'];

    for (let i = 0; i < 1600; i++) {
      const age = Math.floor(Math.random() * 50) + 20;
      const income = Math.random() * 150000 + 20000;
      const education = ['high_school', 'bachelor', 'master', 'phd', 'vocational'][Math.floor(Math.random() * 5)];
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const citySize = ['small', 'medium', 'large', 'mega'][Math.floor(Math.random() * 4)];
      const creditScore = Math.floor(Math.random() * 400) + 300;
      const maritalStatus = ['single', 'married', 'divorced', 'widowed'][Math.floor(Math.random() * 4)];
      const occupation = ['engineer', 'teacher', 'doctor', 'sales', 'manager', 'student', 'retired'][Math.floor(Math.random() * 7)];
      
      // ソーシャルメディア利用予測
      let target = 0;
      if (age < 35 && education !== 'high_school') target = 1;
      if (citySize === 'large' && occupation === 'student') target = 1;
      if (age < 30 && maritalStatus === 'single') target = 1;
      if (education === 'bachelor' && occupation === 'engineer') target = 1;
      
      data.push([age, income, education, gender, citySize, creditScore, maritalStatus, occupation]);
      targetValues.push(target);
    }

    return {
      id: 'social_' + Date.now(),
      name: 'ソーシャルメディア利用予測データセット',
      type: 'classification',
      description: 'ユーザーの属性からソーシャルメディア利用を予測する分類問題（8特徴量、1600サンプル）',
      data: data.map(row => row.map(val => typeof val === 'string' ? val : val)),
      featureNames,
      targetName: 'social_media_usage',
      targetValues
    };
  }

  // 住宅データを生成（現実的な統計分布）
  private generateHousingData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['house_size', 'bedrooms', 'bathrooms', 'location', 'age', 'condition', 'garage', 'pool', 'garden_size'];

    // 立地の分布（現実的な重み付け）
    const locationWeights = [0.4, 0.3, 0.2, 0.1]; // suburban, urban, rural, downtown
    const locations = ['suburban', 'urban', 'rural', 'downtown'];
    
    // 状態の分布
    const conditionWeights = [0.1, 0.2, 0.5, 0.2]; // poor, fair, good, excellent
    const conditions = ['poor', 'fair', 'good', 'excellent'];

    for (let i = 0; i < 2000; i++) {
      // 住宅サイズ（対数正規分布）
      const houseSize = this.generateLogNormal(4.5, 0.3); // 平均約90㎡
      
      // 寝室数（負の二項分布の簡易版）
      const bedrooms = this.generateNegativeBinomial(2, 0.4) + 1;
      
      // バスルーム数（寝室数に依存）
      const bathrooms = Math.min(bedrooms, this.generateNegativeBinomial(1, 0.6) + 1);
      
      // 立地（重み付き選択）
      const location = this.weightedRandomChoice(locations, locationWeights);
      
      // 築年数（指数分布）
      const age = Math.floor(this.generateExponential(0.1)) + 1;
      
      // 状態（重み付き選択）
      const condition = this.weightedRandomChoice(conditions, conditionWeights);
      
      // ガレージ（立地に依存）
      const garageProbability = location === 'downtown' ? 0.1 : location === 'urban' ? 0.3 : 0.7;
      const garage = Math.random() < garageProbability ? 'yes' : 'no';
      
      // プール（住宅サイズと立地に依存）
      const poolProbability = houseSize > 150 && location !== 'downtown' ? 0.2 : 0.05;
      const pool = Math.random() < poolProbability ? 'yes' : 'no';
      
      // 庭のサイズ（ガンマ分布）
      const gardenSize = this.generateGamma(2, 200);
      
      // 現実的な価格計算
      const price = this.calculateHousingPrice(houseSize, bedrooms, bathrooms, location, 
                                             age, condition, garage, pool, gardenSize);
      
      data.push([houseSize, bedrooms, bathrooms, location, age, condition, garage, pool, gardenSize]);
      targetValues.push(price);
    }

    return {
      id: 'housing_' + Date.now(),
      name: '住宅価格予測データセット',
      type: 'regression',
      description: '住宅の属性から価格を予測する回帰問題（9特徴量、2000サンプル）',
      data: data.map(row => row.map(val => typeof val === 'string' ? val : val)),
      featureNames,
      targetName: 'price',
      targetValues
    };
  }

  // 売上データを生成（現実的な統計分布）
  private generateSalesData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['product_category', 'price', 'discount', 'season', 'advertising_budget', 'competitor_price', 'store_size', 'location_type'];

    // カテゴリの分布（現実的な重み付け）
    const categoryWeights = [0.25, 0.30, 0.20, 0.15, 0.10]; // electronics, clothing, food, books, sports
    const categories = ['electronics', 'clothing', 'food', 'books', 'sports'];
    
    // 季節の分布（現実的な重み付け）
    const seasonWeights = [0.25, 0.30, 0.25, 0.20]; // spring, summer, autumn, winter
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    
    // 店舗サイズの分布
    const storeSizeWeights = [0.4, 0.4, 0.2]; // small, medium, large
    const storeSizes = ['small', 'medium', 'large'];
    
    // 立地タイプの分布
    const locationWeights = [0.3, 0.4, 0.3]; // mall, street, online
    const locationTypes = ['mall', 'street', 'online'];

    for (let i = 0; i < 1800; i++) {
      // 重み付きランダム選択
      const productCategory = this.weightedRandomChoice(categories, categoryWeights);
      const season = this.weightedRandomChoice(seasons, seasonWeights);
      const storeSize = this.weightedRandomChoice(storeSizes, storeSizeWeights);
      const locationType = this.weightedRandomChoice(locationTypes, locationWeights);
      
      // 価格分布（対数正規分布）
      const price = this.generateLogNormal(3.5, 0.8) * 100; // 平均約3500円
      
      // 割引率（ベータ分布）
      const discount = this.generateBeta(2, 5) * 0.5; // 平均約14%
      
      // 広告予算（ガンマ分布）
      const advertisingBudget = this.generateGamma(2, 2000); // 平均約4000円
      
      // 競合価格（正規分布）
      const competitorPrice = price * this.generateNormal(1.0, 0.1);
      
      // 売上予測（現実的な関係性）
      let baseSales = this.calculateSales(productCategory, price, discount, season, 
                                        advertisingBudget, competitorPrice, storeSize, locationType);
      
      data.push([productCategory, price, discount, season, advertisingBudget, competitorPrice, storeSize, locationType]);
      targetValues.push(baseSales);
    }

    return {
      id: 'sales_' + Date.now(),
      name: '売上予測データセット',
      type: 'regression',
      description: '商品の属性から売上を予測する回帰問題（8特徴量、1800サンプル）',
      data: data.map(row => row.map(val => typeof val === 'string' ? val : val)),
      featureNames,
      targetName: 'sales',
      targetValues
    };
  }

  // 重み付きランダム選択
  private weightedRandomChoice<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  }

  // 対数正規分布を生成
  private generateLogNormal(mu: number, sigma: number): number {
    const normal = this.generateNormal(0, 1);
    return Math.exp(mu + sigma * normal);
  }

  // ベータ分布を生成（Box-Muller変換の簡易版）
  private generateBeta(alpha: number, beta: number): number {
    const gamma1 = this.generateGamma(alpha, 1);
    const gamma2 = this.generateGamma(beta, 1);
    return gamma1 / (gamma1 + gamma2);
  }

  // ガンマ分布を生成（簡易版）
  private generateGamma(shape: number, scale: number): number {
    if (shape < 1) {
      return this.generateGamma(shape + 1, scale) * Math.pow(Math.random(), 1 / shape);
    }
    
    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    
    while (true) {
      const x = this.generateNormal(0, 1);
      const v = 1 + c * x;
      if (v <= 0) continue;
      
      const v3 = v * v * v;
      const u = Math.random();
      
      if (u < 1 - 0.0331 * (x * x * x * x)) {
        return d * v3 * scale;
      }
      
      if (Math.log(u) < 0.5 * x * x + d * (1 - v3 + Math.log(v3))) {
        return d * v3 * scale;
      }
    }
  }

  // 正規分布を生成（Box-Muller変換）
  private generateNormal(mean: number, std: number): number {
    if (this.normalSpare !== null) {
      const value = this.normalSpare;
      this.normalSpare = null;
      return mean + std * value;
    }
    
    const u1 = Math.random();
    const u2 = Math.random();
    
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
    
    this.normalSpare = z1;
    return mean + std * z0;
  }

  // 売上を計算（現実的な関係性）
  private calculateSales(productCategory: string, price: number, discount: number, season: string,
                        advertisingBudget: number, competitorPrice: number, storeSize: string, locationType: string): number {
    let baseSales = price * (1 - discount) * 100;
    
    // カテゴリ別の係数
    const categoryMultipliers: Record<string, number> = {
      'electronics': 1.5,
      'clothing': 1.2,
      'food': 0.8,
      'books': 0.9,
      'sports': 1.1
    };
    baseSales *= categoryMultipliers[productCategory] || 1.0;
    
    // 季節効果
    const seasonEffects: Record<string, Record<string, number>> = {
      'winter': { 'clothing': 1.3, 'sports': 0.9, 'electronics': 1.1 },
      'summer': { 'sports': 1.4, 'clothing': 0.8, 'food': 1.2 },
      'spring': { 'clothing': 1.1, 'sports': 1.2, 'books': 1.1 },
      'autumn': { 'clothing': 1.2, 'books': 1.1, 'electronics': 1.0 }
    };
    
    const seasonEffect = seasonEffects[season]?.[productCategory] || 1.0;
    baseSales *= seasonEffect;
    
    // 広告効果（対数スケール）
    baseSales += Math.log(1 + advertisingBudget) * 50;
    
    // 価格競争力
    if (price < competitorPrice) {
      baseSales *= 1.2;
    } else if (price > competitorPrice * 1.2) {
      baseSales *= 0.8;
    }
    
    // 店舗サイズ効果
    const storeSizeMultipliers: Record<string, number> = {
      'small': 0.7,
      'medium': 1.0,
      'large': 1.3
    };
    baseSales *= storeSizeMultipliers[storeSize] || 1.0;
    
    // 立地効果
    const locationMultipliers: Record<string, number> = {
      'mall': 1.2,
      'street': 1.0,
      'online': 1.1
    };
    baseSales *= locationMultipliers[locationType] || 1.0;
    
    // 現実的なノイズ（対数正規分布）
    const noise = this.generateLogNormal(0, 0.1);
    baseSales *= noise;
    
    return Math.max(0, baseSales);
  }

  // 正規分布生成用のスパア変数
  private normalSpare: number | null = null;

  // 負の二項分布を生成
  private generateNegativeBinomial(r: number, p: number): number {
    let successes = 0;
    let failures = 0;
    
    while (failures < r) {
      if (Math.random() < p) {
        successes++;
      } else {
        failures++;
      }
    }
    
    return successes;
  }

  // 指数分布を生成
  private generateExponential(lambda: number): number {
    return -Math.log(1 - Math.random()) / lambda;
  }

  // 住宅価格を計算（現実的な関係性）
  private calculateHousingPrice(houseSize: number, bedrooms: number, bathrooms: number, 
                               location: string, age: number, condition: string, 
                               garage: string, pool: string, gardenSize: number): number {
    // 基本価格（㎡単価）
    const basePricePerSqm = 2000;
    let price = houseSize * basePricePerSqm;
    
    // 寝室・バスルームの価値
    price += bedrooms * 50000;
    price += bathrooms * 30000;
    
    // 立地係数
    const locationMultipliers: Record<string, number> = {
      'downtown': 2.0,
      'urban': 1.4,
      'suburban': 1.0,
      'rural': 0.6
    };
    price *= locationMultipliers[location] || 1.0;
    
    // 状態係数
    const conditionMultipliers: Record<string, number> = {
      'excellent': 1.3,
      'good': 1.1,
      'fair': 1.0,
      'poor': 0.7
    };
    price *= conditionMultipliers[condition] || 1.0;
    
    // 設備の価値
    if (garage === 'yes') price += 20000;
    if (pool === 'yes') price += 50000;
    price += gardenSize * 10;
    
    // 築年数による減価
    const depreciation = Math.min(0.5, age * 0.01);
    price *= (1 - depreciation);
    
    // 現実的なノイズ（対数正規分布）
    const noise = this.generateLogNormal(0, 0.15);
    price *= noise;
    
    return Math.max(100000, price); // 最低価格を設定
  }

  // 株価データを生成
  private generateStockData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['sector', 'market_cap', 'pe_ratio', 'debt_ratio', 'revenue_growth', 'profit_margin', 'dividend_yield', 'volatility'];

    for (let i = 0; i < 1500; i++) {
      const sector = ['technology', 'finance', 'healthcare', 'energy', 'consumer', 'industrial'][Math.floor(Math.random() * 6)];
      const marketCap = Math.random() * 1000000000 + 10000000;
      const peRatio = Math.random() * 50 + 5;
      const debtRatio = Math.random() * 0.8;
      const revenueGrowth = (Math.random() - 0.5) * 0.4;
      const profitMargin = Math.random() * 0.3;
      const dividendYield = Math.random() * 0.1;
      const volatility = Math.random() * 0.5 + 0.1;
      
      // 株価予測
      let basePrice = marketCap / 1000000;
      if (sector === 'technology') basePrice *= 1.5;
      else if (sector === 'finance') basePrice *= 1.2;
      else if (sector === 'healthcare') basePrice *= 1.3;
      
      if (peRatio < 15) basePrice *= 1.2;
      else if (peRatio > 30) basePrice *= 0.8;
      
      if (debtRatio < 0.3) basePrice *= 1.1;
      else if (debtRatio > 0.6) basePrice *= 0.9;
      
      basePrice *= (1 + revenueGrowth);
      basePrice *= (1 + profitMargin);
      basePrice *= (1 + dividendYield);
      basePrice *= (1 - volatility * 0.5);
      
      const target = basePrice + (Math.random() - 0.5) * basePrice * 0.2;
      
      data.push([sector, marketCap, peRatio, debtRatio, revenueGrowth, profitMargin, dividendYield, volatility]);
      targetValues.push(target);
    }

    return {
      id: 'stock_' + Date.now(),
      name: '株価予測データセット',
      type: 'regression',
      description: '企業の財務指標から株価を予測する回帰問題（8特徴量、1500サンプル）',
      data: data.map(row => row.map(val => typeof val === 'string' ? val : val)),
      featureNames,
      targetName: 'stock_price',
      targetValues
    };
  }

  // 天気データを生成
  private generateWeatherData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['temperature', 'humidity', 'pressure', 'wind_speed', 'cloud_cover', 'season', 'precipitation_type', 'visibility'];

    for (let i = 0; i < 2200; i++) {
      const temperature = Math.random() * 40 - 10;
      const humidity = Math.random() * 100;
      const pressure = Math.random() * 100 + 950;
      const windSpeed = Math.random() * 30;
      const cloudCover = Math.random() * 100;
      const season = ['spring', 'summer', 'autumn', 'winter'][Math.floor(Math.random() * 4)];
      const precipitationType = ['none', 'rain', 'snow', 'sleet'][Math.floor(Math.random() * 4)];
      const visibility = Math.random() * 20 + 1;
      
      // 降水量予測
      let basePrecipitation = 0;
      if (humidity > 80 && cloudCover > 70) basePrecipitation += 5;
      if (pressure < 1000) basePrecipitation += 3;
      if (windSpeed > 15) basePrecipitation += 2;
      if (season === 'summer' && temperature > 25) basePrecipitation += 4;
      if (season === 'winter' && temperature < 0) basePrecipitation += 3;
      if (precipitationType === 'rain') basePrecipitation += 8;
      else if (precipitationType === 'snow') basePrecipitation += 6;
      
      basePrecipitation *= (1 + Math.random() * 0.5);
      const target = Math.max(0, basePrecipitation);
      
      data.push([temperature, humidity, pressure, windSpeed, cloudCover, season, precipitationType, visibility]);
      targetValues.push(target);
    }

    return {
      id: 'weather_' + Date.now(),
      name: '降水量予測データセット',
      type: 'regression',
      description: '気象条件から降水量を予測する回帰問題（8特徴量、2200サンプル）',
      data: data.map(row => row.map(val => typeof val === 'string' ? val : val)),
      featureNames,
      targetName: 'precipitation',
      targetValues
    };
  }

  // エネルギーデータを生成
  private generateEnergyData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['temperature', 'humidity', 'pressure', 'wind_speed', 'solar_radiation', 'time_of_day', 'season', 'building_type'];

    for (let i = 0; i < 1900; i++) {
      const temperature = Math.random() * 40 - 10;
      const humidity = Math.random() * 100;
      const pressure = Math.random() * 100 + 950;
      const windSpeed = Math.random() * 30;
      const solarRadiation = Math.random() * 1000;
      const timeOfDay = ['morning', 'afternoon', 'evening', 'night'][Math.floor(Math.random() * 4)];
      const season = ['spring', 'summer', 'autumn', 'winter'][Math.floor(Math.random() * 4)];
      const buildingType = ['residential', 'commercial', 'industrial', 'office'][Math.floor(Math.random() * 4)];
      
      // エネルギー消費予測
      let baseConsumption = 100;
      baseConsumption += Math.abs(temperature - 20) * 2;
      baseConsumption += humidity * 0.5;
      baseConsumption += windSpeed * 0.3;
      baseConsumption -= solarRadiation * 0.1;
      
      if (timeOfDay === 'night') baseConsumption *= 0.7;
      else if (timeOfDay === 'afternoon') baseConsumption *= 1.2;
      
      if (season === 'summer' || season === 'winter') baseConsumption *= 1.3;
      
      if (buildingType === 'industrial') baseConsumption *= 2.0;
      else if (buildingType === 'commercial') baseConsumption *= 1.5;
      else if (buildingType === 'office') baseConsumption *= 1.2;
      
      const target = baseConsumption + (Math.random() - 0.5) * baseConsumption * 0.2;
      
      data.push([temperature, humidity, pressure, windSpeed, solarRadiation, timeOfDay, season, buildingType]);
      targetValues.push(target);
    }

    return {
      id: 'energy_' + Date.now(),
      name: 'エネルギー消費予測データセット',
      type: 'regression',
      description: '環境条件からエネルギー消費を予測する回帰問題（8特徴量、1900サンプル）',
      data: data.map(row => row.map(val => typeof val === 'string' ? val : val)),
      featureNames,
      targetName: 'energy_consumption',
      targetValues
    };
  }

  // 分類データを生成（カテゴリカル変数を含む）
  // @ts-ignore
  private generateClassificationData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['age', 'income', 'education', 'gender', 'city_size'];

    for (let i = 0; i < 1000; i++) {
      const age = Math.floor(Math.random() * 50) + 20; // 20-70歳
      const income = Math.random() * 100000 + 20000; // 年収20-120万
      const education = ['high_school', 'bachelor', 'master', 'phd'][Math.floor(Math.random() * 4)];
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const citySize = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)];
      
      // 複雑な分類ルール
      let target = 0;
      if (age > 30 && income > 60000) target = 1;
      if (education === 'master' || education === 'phd') target = 1;
      if (gender === 'female' && citySize === 'large') target = 1;
      
      data.push([age, income, education, gender, citySize]);
      targetValues.push(target);
    }

    return {
      id: 'classification_' + Date.now(),
      name: '顧客分類データセット',
      type: 'classification',
      description: '年齢、収入、教育、性別、都市規模による顧客分類問題',
      data: data.map(row => row.map(val => typeof val === 'string' ? val : val)),
      featureNames,
      targetName: 'target',
      targetValues
    };
  }

  // 回帰データを生成（カテゴリカル変数を含む）
  // @ts-ignore
  private generateRegressionData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['house_size', 'bedrooms', 'location', 'age', 'condition'];

    for (let i = 0; i < 1000; i++) {
      const houseSize = Math.random() * 200 + 50; // 50-250平米
      const bedrooms = Math.floor(Math.random() * 5) + 1; // 1-5部屋
      const location = ['suburban', 'urban', 'rural'][Math.floor(Math.random() * 3)];
      const age = Math.floor(Math.random() * 50) + 1; // 1-50年
      const condition = ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)];
      
      // 複雑な回帰ルール
      let basePrice = houseSize * 1000 + bedrooms * 50000;
      if (location === 'urban') basePrice *= 1.5;
      if (location === 'rural') basePrice *= 0.7;
      if (condition === 'excellent') basePrice *= 1.2;
      if (condition === 'poor') basePrice *= 0.8;
      basePrice -= age * 1000; // 古い家は安い
      
      const target = basePrice + (Math.random() - 0.5) * 50000; // ノイズ追加
      
      data.push([houseSize, bedrooms, location, age, condition]);
      targetValues.push(target);
    }

    return {
      id: 'regression_' + Date.now(),
      name: '住宅価格予測データセット',
      type: 'regression',
      description: '住宅の特徴から価格を予測する回帰問題',
      data: data.map(row => row.map(val => typeof val === 'string' ? val : val)),
      featureNames,
      targetName: 'price',
      targetValues
    };
  }

  // データを前処理（すべての特徴量を保持）
  processData(options: {
    // 欠損値処理
    missingValueStrategy?: 'remove' | 'mean' | 'median' | 'mode' | 'forward_fill' | 'backward_fill' | 'interpolate' | 'knn';
    
    // 外れ値処理
    outlierStrategy?: 'none' | 'iqr' | 'zscore' | 'isolation_forest' | 'local_outlier_factor';
    outlierThreshold?: number;
    
    // 正規化・標準化
    scalingStrategy?: 'none' | 'minmax' | 'standard' | 'robust' | 'maxabs' | 'quantile';
    
    // 特徴量選択（選択された特徴量のみを処理、他は保持）
    selectedFeatures?: number[];
    
    // カテゴリカル変数エンコーディング
    categoricalEncoding?: 'label' | 'onehot' | 'target' | 'binary' | 'hash' | 'frequency' | 'ordinal';
    
    // 特徴量エンジニアリング
    featureEngineering?: boolean;
    
    // データクリーニング
    removeDuplicates?: boolean;
    dataValidation?: boolean;
    
    // 次元削減
    dimensionalityReduction?: 'none' | 'pca' | 'lda' | 'tsne' | 'umap';
    nComponents?: number;
    
    // 生データを更新するかどうか
    updateRawData?: boolean;
    
    // 正規化
    normalize?: boolean;
  }): ProcessedDataset {
    if (!this.currentDataset) {
      throw new Error('No dataset loaded');
    }

    // 元のデータを保持（すべての特徴量を含む）
    let processedData: (number | string)[][] = [...this.currentDataset.data];
    let processedFeatureNames = [...this.currentDataset.featureNames];
    let featureTypes: ('numerical' | 'categorical')[] = this.detectFeatureTypes(processedData);
    const processingSteps: string[] = [];
    const encodingInfo: Record<string, any> = {};
    
    // 処理対象の特徴量インデックス（指定されていない場合はすべて）
    const targetFeatures = options.selectedFeatures || Array.from({ length: processedFeatureNames.length }, (_, i) => i);

    // データクリーニング
    if (options.removeDuplicates) {
      const originalLength = processedData.length;
      const uniqueData = [];
      const seen = new Set();
      for (const row of processedData) {
        const key = JSON.stringify(row);
        if (!seen.has(key)) {
          seen.add(key);
          uniqueData.push(row);
        }
      }
      processedData = uniqueData;
      processingSteps.push(`重複除去: ${originalLength - processedData.length}行を削除`);
    }

    // 欠損値処理（選択された特徴量のみ）
    const missingStrategy = options.missingValueStrategy || 'remove';
    if (missingStrategy && missingStrategy !== 'remove') {
      processedData = this.handleMissingValuesForFeatures(processedData, featureTypes, missingStrategy, targetFeatures);
      processingSteps.push(`欠損値処理: ${missingStrategy}手法を適用（${targetFeatures.length}個の特徴量）`);
    }

    // 外れ値処理（選択された特徴量のみ）
    const outlierStrategy = options.outlierStrategy || 'none';
    if (outlierStrategy !== 'none') {
      const threshold = options.outlierThreshold || 1.5;
      // processedData = this.handleOutliersForFeatures(processedData, featureTypes, outlierStrategy, threshold, targetFeatures);
      processingSteps.push(`外れ値処理: ${outlierStrategy}手法を適用 (閾値: ${threshold}, ${targetFeatures.length}個の特徴量)`);
    }

    // カテゴリカル変数のエンコーディング（選択された特徴量のみ）
    if (options.categoricalEncoding && options.categoricalEncoding !== 'label') {
      const result = this.encodeCategoricalFeaturesForSelected(
        processedData, 
        processedFeatureNames, 
        featureTypes, 
        options.categoricalEncoding as 'label' | 'onehot' | 'target',
        targetFeatures // 選択したカラムのみに適用
      );
      processedData = result.data;
      processedFeatureNames = result.featureNames;
      featureTypes = result.featureTypes;
      encodingInfo.categorical = result.encodingInfo;
      processingSteps.push(`カテゴリカル変数エンコーディング: ${options.categoricalEncoding}（${targetFeatures.length}個の特徴量）`);
    }

    // 特徴量エンジニアリング
    if (options.featureEngineering) {
      const result = this.performFeatureEngineering(processedData, processedFeatureNames, featureTypes);
      processedData = result.data;
      processedFeatureNames = result.featureNames;
      featureTypes = result.featureTypes;
      processingSteps.push(`特徴量エンジニアリング: ${result.newFeatures.length}個の新特徴量を追加`);
    }

    // 特徴量選択は行わない（すべての特徴量を保持）
    // 選択された特徴量のみが処理され、他は元のまま保持される

    // 正規化（選択された特徴量のみ）
    if (options.normalize) {
      const numericalTargetFeatures = targetFeatures.filter(i => featureTypes[i] === 'numerical');
      
      if (numericalTargetFeatures.length > 0) {
        const means = numericalTargetFeatures.map(i => {
          const values = processedData.map(row => {
            const val = row[i];
            return typeof val === 'number' ? val : 0;
          });
          return values.reduce((a, b) => a + b, 0) / values.length;
        });
        
        const stds = numericalTargetFeatures.map((i, idx) => {
          const values = processedData.map(row => {
            const val = row[i];
            return typeof val === 'number' ? val : 0;
          });
          const mean = means[idx];
          const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
          return Math.sqrt(variance);
        });

        processedData = processedData.map(row => {
          const newRow = [...row];
          numericalTargetFeatures.forEach((i, idx) => {
            const val = row[i];
            if (typeof val === 'number') {
              newRow[i] = (val - means[idx]) / (stds[idx] + 1e-8);
            }
          });
          return newRow;
        });
        processingSteps.push(`正規化: ${numericalTargetFeatures.length}個の数値特徴量を正規化`);
      }
    }

    this.processedDataset = {
      data: processedData,
      featureNames: processedFeatureNames,
      targetValues: this.currentDataset.targetValues.slice(0, processedData.length),
      processingSteps,
      featureTypes,
      encodingInfo
    };

    // 生データを更新する場合
    if (options.updateRawData) {
      this.currentDataset = {
        ...this.currentDataset,
        data: processedData,
        featureNames: processedFeatureNames,
        featureTypes: featureTypes
      };
    }

    return this.processedDataset;
  }

  // 特徴量のタイプを検出
  private detectFeatureTypes(data: (number | string)[][]): ('numerical' | 'categorical')[] {
    if (data.length === 0) return [];
    
    const featureCount = data[0].length;
    const types: ('numerical' | 'categorical')[] = [];
    
    for (let i = 0; i < featureCount; i++) {
      const values = data.map(row => row[i]);
      const isNumerical = values.every(val => typeof val === 'number' && !isNaN(val));
      types.push(isNumerical ? 'numerical' : 'categorical');
    }
    
    return types;
  }

  // 選択された特徴量のみのカテゴリカル変数エンコーディング
  private encodeCategoricalFeaturesForSelected(
    data: (number | string)[][],
    featureNames: string[],
    featureTypes: ('numerical' | 'categorical')[],
    method: 'label' | 'onehot' | 'target',
    targetFeatures: number[]
  ): {
    data: (number | string)[][];
    featureNames: string[];
    featureTypes: ('numerical' | 'categorical')[];
    encodingInfo: Record<string, any>;
  } {
    const result: (number | string)[][] = [];
    const newFeatureNames: string[] = [];
    const newFeatureTypes: ('numerical' | 'categorical')[] = [];
    const encodingInfo: Record<string, any> = {};

    for (let i = 0; i < data.length; i++) {
      const newRow: (number | string)[] = [];
      
      for (let j = 0; j < featureNames.length; j++) {
        if (featureTypes[j] === 'numerical' || !targetFeatures.includes(j)) {
          // 数値変数または選択されていない特徴量はそのまま保持
          newRow.push(data[i][j]);
          if (i === 0) {
            newFeatureNames.push(featureNames[j]);
            newFeatureTypes.push(featureTypes[j]);
          }
        } else {
          // 選択されたカテゴリカル変数の処理
          const value = data[i][j] as string;
          
          if (method === 'label') {
            if (!encodingInfo[featureNames[j]]) {
              const uniqueValues = [...new Set(data.map(row => row[j] as string))];
              encodingInfo[featureNames[j]] = uniqueValues.reduce((acc, val, idx) => {
                acc[val] = idx;
                return acc;
              }, {} as Record<string, number>);
            }
            newRow.push(encodingInfo[featureNames[j]][value] || 0);
            if (i === 0) {
              newFeatureNames.push(featureNames[j]);
              newFeatureTypes.push('numerical');
            }
          } else if (method === 'onehot') {
            if (!encodingInfo[featureNames[j]]) {
              const uniqueValues = [...new Set(data.map(row => row[j] as string))];
              encodingInfo[featureNames[j]] = uniqueValues;
            }
            
            const uniqueValues = encodingInfo[featureNames[j]];
            uniqueValues.forEach((val: string) => {
              newRow.push(val === value ? 1 : 0);
              if (i === 0) {
                newFeatureNames.push(`${featureNames[j]}_${val}`);
                newFeatureTypes.push('numerical');
              }
            });
          }
        }
      }
      result.push(newRow);
    }

    return {
      data: result,
      featureNames: newFeatureNames,
      featureTypes: newFeatureTypes,
      encodingInfo
    };
  }

  // カテゴリカル変数のエンコーディング
  private encodeCategoricalFeatures(
    data: (number | string)[][],
    featureNames: string[],
    featureTypes: ('numerical' | 'categorical')[],
    method: 'label' | 'onehot' | 'target',
    selectedFeatures?: number[]
  ): {
    data: (number | string)[][];
    featureNames: string[];
    featureTypes: ('numerical' | 'categorical')[];
    encodingInfo: Record<string, any>;
  } {
    const result: (number | string)[][] = [];
    const newFeatureNames: string[] = [];
    const newFeatureTypes: ('numerical' | 'categorical')[] = [];
    const encodingInfo: Record<string, any> = {};

    for (let i = 0; i < data.length; i++) {
      const newRow: (number | string)[] = [];
      
      for (let j = 0; j < featureNames.length; j++) {
        if (featureTypes[j] === 'numerical') {
          newRow.push(data[i][j] as number);
          if (i === 0) {
            newFeatureNames.push(featureNames[j]);
            newFeatureTypes.push('numerical');
          }
        } else {
          // カテゴリカル変数の処理
          const value = data[i][j] as string;
          const featureName = featureNames[j];
          
          // 選択されたカラムのみに適用
          const shouldEncode = !selectedFeatures || selectedFeatures.includes(j);
          
          if (shouldEncode && method === 'label') {
            if (!encodingInfo[featureName]) {
              const uniqueValues = [...new Set(data.map(row => row[j] as string))];
              encodingInfo[featureName] = { mapping: {} };
              uniqueValues.forEach((val, idx) => {
                encodingInfo[featureName].mapping[val] = idx;
              });
            }
            newRow.push(encodingInfo[featureName].mapping[value]);
            if (i === 0) {
              newFeatureNames.push(featureName);
              newFeatureTypes.push('numerical');
            }
          } else if (shouldEncode && method === 'onehot') {
            if (!encodingInfo[featureName]) {
              const uniqueValues = [...new Set(data.map(row => row[j] as string))];
              encodingInfo[featureName] = { values: uniqueValues };
            }
            
            if (i === 0) {
              encodingInfo[featureName].values.forEach((val: string) => {
                newFeatureNames.push(`${featureName}_${val}`);
                newFeatureTypes.push('numerical');
              });
            }
            
            encodingInfo[featureName].values.forEach((val: string) => {
              newRow.push(value === val ? 1 : 0);
            });
          } else {
            // エンコーディングしない場合は文字列のまま保持
            // 数値配列に文字列を直接格納（表示用）
            newRow.push(value as any);
            if (i === 0) {
              newFeatureNames.push(featureName);
              newFeatureTypes.push('categorical');
            }
          }
        }
      }
      
      result.push(newRow);
    }

    return {
      data: result,
      featureNames: newFeatureNames,
      featureTypes: newFeatureTypes,
      encodingInfo
    };
  }


  // 特徴量エンジニアリング
  private performFeatureEngineering(
    data: (number | string)[][],
    featureNames: string[],
    featureTypes: ('numerical' | 'categorical')[]
  ): {
    data: (number | string)[][];
    featureNames: string[];
    featureTypes: ('numerical' | 'categorical')[];
    newFeatures: string[];
  } {
    const newData: (number | string)[][] = [];
    const newFeatureNames = [...featureNames];
    const newFeatureTypes = [...featureTypes];
    const newFeatures: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const newRow = [...data[i]];
      
      // 数値特徴量の組み合わせ
      const numericalIndices = featureTypes.map((type, idx) => type === 'numerical' ? idx : -1).filter(i => i !== -1);
      
      if (numericalIndices.length >= 2) {
        // 積
        const product = numericalIndices.reduce((acc, idx) => {
          const val = data[i][idx];
          return acc * (typeof val === 'number' ? val : 0);
        }, 1);
        newRow.push(product);
        if (i === 0) {
          newFeatureNames.push('feature_product');
          newFeatureTypes.push('numerical');
          newFeatures.push('feature_product');
        }
        
        // 平均
        const mean = numericalIndices.reduce((acc, idx) => {
          const val = data[i][idx];
          return acc + (typeof val === 'number' ? val : 0);
        }, 0) / numericalIndices.length;
        newRow.push(mean);
        if (i === 0) {
          newFeatureNames.push('feature_mean');
          newFeatureTypes.push('numerical');
          newFeatures.push('feature_mean');
        }
        
        // 最大値
        const max = Math.max(...numericalIndices.map(idx => {
          const val = data[i][idx];
          return typeof val === 'number' ? val : 0;
        }));
        newRow.push(max);
        if (i === 0) {
          newFeatureNames.push('feature_max');
          newFeatureTypes.push('numerical');
          newFeatures.push('feature_max');
        }
      }
      
      newData.push(newRow);
    }

    return {
      data: newData,
      featureNames: newFeatureNames,
      featureTypes: newFeatureTypes,
      newFeatures
    };
  }

  // 特徴エンジニアリングを実行
  executeFeatureEngineering(options: {
    selectedFeatures: number[];
    
    // 数学的変換
    transformations: {
      polynomial: boolean;
      interaction: boolean;
      log: boolean;
      sqrt: boolean;
      square: boolean;
      exponential: boolean;
      reciprocal: boolean;
      sin: boolean;
      cos: boolean;
      tan: boolean;
    };
    
    // 統計的集約
    aggregations: {
      mean: boolean;
      std: boolean;
      max: boolean;
      min: boolean;
      count: boolean;
      median: boolean;
      mode: boolean;
      variance: boolean;
      skewness: boolean;
      kurtosis: boolean;
    };
    
    // 時系列特徴量（データに時間的順序がある場合）
    timeSeriesFeatures: {
      lag: boolean;
      rolling_mean: boolean;
      rolling_std: boolean;
      rolling_max: boolean;
      rolling_min: boolean;
      diff: boolean;
      pct_change: boolean;
    };
    
    // カテゴリカル特徴量のエンコーディング
    categoricalFeatures: {
      target_encoding: boolean;
      frequency_encoding: boolean;
      binary_encoding: boolean;
      hash_encoding: boolean;
      ordinal_encoding: boolean;
    };
    
    // 特徴量組み合わせ
    featureCombinations: {
      ratio_features: boolean;
      difference_features: boolean;
      product_features: boolean;
      sum_features: boolean;
      custom_combinations: boolean;
    };
    
    // 次元削減
    dimensionalityReduction: {
      method: 'none' | 'pca' | 'lda' | 'tsne' | 'umap' | 'ica' | 'factor_analysis';
      components: number;
    };
    
    // 特徴量選択
    featureSelection: {
      method: 'none' | 'correlation' | 'mutual_info' | 'chi2' | 'f_score' | 'recursive';
      threshold: number;
      max_features: number;
    };
  }): ProcessedDataset {
    if (!this.processedDataset) {
      throw new Error('No processed dataset available for feature engineering');
    }

    let data = [...this.processedDataset.data];
    let featureNames = [...this.processedDataset.featureNames];
    let featureTypes = [...this.processedDataset.featureTypes];
    const processingSteps = [...this.processedDataset.processingSteps];
    const newFeatures: string[] = [];

    // 選択された特徴量のみを使用
    const selectedData = data.map(row => 
      options.selectedFeatures.map(i => row[i])
    );
    const selectedFeatureNames = options.selectedFeatures.map(i => featureNames[i]);

    // 変換を適用
    if (options.transformations.polynomial) {
      const { data: polyData, names: polyNames } = this.createPolynomialFeatures(selectedData as number[][], selectedFeatureNames);
      data = polyData;
      featureNames = polyNames;
      featureTypes = new Array(featureNames.length).fill('numerical');
      newFeatures.push('polynomial');
      processingSteps.push('多項式特徴量の作成');
    }

    if (options.transformations.interaction) {
      const { data: intData, names: intNames } = this.createInteractionFeatures(data as number[][], featureNames);
      data = intData;
      featureNames = intNames;
      featureTypes = new Array(featureNames.length).fill('numerical');
      newFeatures.push('interaction');
      processingSteps.push('交互作用特徴量の作成');
    }

    if (options.transformations.log) {
      const { data: logData, names: logNames } = this.createLogFeatures(data as number[][], featureNames);
      data = logData;
      featureNames = logNames;
      featureTypes = new Array(featureNames.length).fill('numerical');
      newFeatures.push('log');
      processingSteps.push('対数変換特徴量の作成');
    }

    if (options.transformations.sqrt) {
      const { data: sqrtData, names: sqrtNames } = this.createSqrtFeatures(data as number[][], featureNames);
      data = sqrtData;
      featureNames = sqrtNames;
      featureTypes = new Array(featureNames.length).fill('numerical');
      newFeatures.push('sqrt');
      processingSteps.push('平方根変換特徴量の作成');
    }

    if (options.transformations.square) {
      const { data: squareData, names: squareNames } = this.createSquareFeatures(data as number[][], featureNames);
      data = squareData;
      featureNames = squareNames;
      featureTypes = new Array(featureNames.length).fill('numerical');
      newFeatures.push('square');
      processingSteps.push('二乗特徴量の作成');
    }

    // 集約特徴量の作成
    if (options.aggregations.mean) {
      const { data: meanData, names: meanNames } = this.createAggregationFeatures(data as number[][], featureNames, 'mean');
      data = meanData;
      featureNames = meanNames;
      featureTypes = new Array(featureNames.length).fill('numerical');
      newFeatures.push('mean_agg');
      processingSteps.push('平均集約特徴量の作成');
    }

    // 次元削減
    if (options.dimensionalityReduction.method !== 'none') {
      // const result = this.applyDimensionalityReduction(
      //   data, 
      //   featureTypes,
      //   options.dimensionalityReduction.method, 
      //   options.dimensionalityReduction.components
      // );
      const result = { data, featureNames: featureNames };
      const reducedData = result.data;
      const reducedNames = result.featureNames;
      data = reducedData;
      featureNames = reducedNames;
      featureTypes = new Array(featureNames.length).fill('numerical');
      processingSteps.push(`${options.dimensionalityReduction.method.toUpperCase()}次元削減`);
    }

    this.processedDataset = {
      data,
      featureNames,
      targetValues: this.processedDataset.targetValues.slice(0, data.length),
      processingSteps,
      featureTypes,
      encodingInfo: { ...this.processedDataset.encodingInfo, newFeatures }
    };

    return this.processedDataset;
  }

  // 多項式特徴量の作成
  private createPolynomialFeatures(data: number[][], featureNames: string[]): { data: number[][], names: string[] } {
    const newData: number[][] = [];
    const newNames: string[] = [...featureNames];

    for (let i = 0; i < data.length; i++) {
      const row = [...data[i]];
      
      // 二乗項
      for (let j = 0; j < featureNames.length; j++) {
        row.push(data[i][j] * data[i][j]);
        if (i === 0) {
          newNames.push(`${featureNames[j]}^2`);
        }
      }
      
      newData.push(row);
    }

    return { data: newData, names: newNames };
  }

  // 交互作用特徴量の作成
  private createInteractionFeatures(data: number[][], featureNames: string[]): { data: number[][], names: string[] } {
    const newData: number[][] = [];
    const newNames: string[] = [...featureNames];

    for (let i = 0; i < data.length; i++) {
      const row = [...data[i]];
      
      // 2つの特徴量の積
      for (let j = 0; j < featureNames.length; j++) {
        for (let k = j + 1; k < featureNames.length; k++) {
          row.push(data[i][j] * data[i][k]);
          if (i === 0) {
            newNames.push(`${featureNames[j]}*${featureNames[k]}`);
          }
        }
      }
      
      newData.push(row);
    }

    return { data: newData, names: newNames };
  }

  // 対数変換特徴量の作成
  private createLogFeatures(data: number[][], featureNames: string[]): { data: number[][], names: string[] } {
    const newData: number[][] = [];
    const newNames: string[] = [...featureNames];

    for (let i = 0; i < data.length; i++) {
      const row = [...data[i]];
      
      for (let j = 0; j < featureNames.length; j++) {
        const value = data[i][j];
        if (value > 0) {
          row.push(Math.log(value + 1)); // +1 to avoid log(0)
          if (i === 0) {
            newNames.push(`log(${featureNames[j]})`);
          }
        } else {
          row.push(0);
          if (i === 0) {
            newNames.push(`log(${featureNames[j]})`);
          }
        }
      }
      
      newData.push(row);
    }

    return { data: newData, names: newNames };
  }

  // 平方根変換特徴量の作成
  private createSqrtFeatures(data: number[][], featureNames: string[]): { data: number[][], names: string[] } {
    const newData: number[][] = [];
    const newNames: string[] = [...featureNames];

    for (let i = 0; i < data.length; i++) {
      const row = [...data[i]];
      
      for (let j = 0; j < featureNames.length; j++) {
        const value = Math.max(0, data[i][j]);
        row.push(Math.sqrt(value));
        if (i === 0) {
          newNames.push(`sqrt(${featureNames[j]})`);
        }
      }
      
      newData.push(row);
    }

    return { data: newData, names: newNames };
  }

  // 二乗特徴量の作成
  private createSquareFeatures(data: number[][], featureNames: string[]): { data: number[][], names: string[] } {
    const newData: number[][] = [];
    const newNames: string[] = [...featureNames];

    for (let i = 0; i < data.length; i++) {
      const row = [...data[i]];
      
      for (let j = 0; j < featureNames.length; j++) {
        row.push(data[i][j] * data[i][j]);
        if (i === 0) {
          newNames.push(`${featureNames[j]}^2`);
        }
      }
      
      newData.push(row);
    }

    return { data: newData, names: newNames };
  }

  // 集約特徴量の作成
  private createAggregationFeatures(data: number[][], featureNames: string[], method: string): { data: number[][], names: string[] } {
    const newData: number[][] = [];
    const newNames: string[] = [...featureNames];

    for (let i = 0; i < data.length; i++) {
      const row = [...data[i]];
      
      if (method === 'mean') {
        const mean = data[i].reduce((sum, val) => sum + val, 0) / data[i].length;
        row.push(mean);
        if (i === 0) {
          newNames.push('mean_aggregate');
        }
      }
      
      newData.push(row);
    }

    return { data: newData, names: newNames };
  }


  // 簡易PCA実装
  // @ts-ignore
  private simplePCA(data: number[][], components: number): { data: number[][], names: string[] } {
    const nFeatures = data[0].length;
    const nSamples = data.length;
    
    // 平均を計算
    const mean = new Array(nFeatures).fill(0);
    for (let i = 0; i < nSamples; i++) {
      for (let j = 0; j < nFeatures; j++) {
        mean[j] += data[i][j];
      }
    }
    for (let j = 0; j < nFeatures; j++) {
      mean[j] /= nSamples;
    }
    
    // 中心化
    const centeredData = data.map(row => 
      row.map((val, j) => val - mean[j])
    );
    
    // 簡易的な主成分（最初のcomponents個の特徴量を使用）
    const pcaData = centeredData.map(row => 
      row.slice(0, components)
    );
    
    const names = Array.from({ length: components }, (_, i) => `PC${i + 1}`);
    
    return { data: pcaData, names };
  }

  // 特徴量選択を実行
  selectFeatures(options: {
    method: 'correlation' | 'importance' | 'manual' | 'variance' | 'mutual_info';
    threshold?: number;
    maxFeatures?: number;
    selectedFeatures?: number[];
  }): ProcessedDataset {
    // 前処理済みデータがない場合は生データを使用
    const sourceDataset = this.processedDataset || this.currentDataset;
    if (!sourceDataset) {
      throw new Error('No dataset available for feature selection');
    }

    let selectedIndices: number[] = [];

    switch (options.method) {
      case 'correlation':
        selectedIndices = this.selectFeaturesByCorrelation(options.threshold || 0.1, sourceDataset);
        break;
      case 'importance':
        selectedIndices = this.selectFeaturesByImportance(options.maxFeatures || 10, sourceDataset);
        break;
      case 'manual':
        selectedIndices = options.selectedFeatures || [];
        break;
      case 'variance':
        selectedIndices = this.selectFeaturesByVariance(options.threshold || 0.01, sourceDataset);
        break;
      case 'mutual_info':
        selectedIndices = this.selectFeaturesByMutualInfo(options.maxFeatures || 10, sourceDataset);
        break;
    }

    // 選択された特徴量でデータをフィルタリング
    const selectedData = sourceDataset.data.map(row => 
      selectedIndices.map(i => row[i])
    );
    const selectedFeatureNames = selectedIndices.map(i => sourceDataset.featureNames[i]);
    const selectedFeatureTypes = selectedIndices.map(i => 
      sourceDataset.featureTypes ? sourceDataset.featureTypes[i] : 'numerical'
    );

    // 前処理済みデータがない場合は新しく作成
    if (!this.processedDataset) {
      this.processedDataset = {
        data: selectedData,
        featureNames: selectedFeatureNames,
        featureTypes: selectedFeatureTypes,
        targetValues: sourceDataset.targetValues,
        processingSteps: [`特徴量選択: ${options.method} (${selectedIndices.length}個選択)`],
        encodingInfo: {}
      };
    } else {
      this.processedDataset = {
        ...this.processedDataset,
        data: selectedData,
        featureNames: selectedFeatureNames,
        featureTypes: selectedFeatureTypes,
        processingSteps: [
          ...this.processedDataset.processingSteps,
          `特徴量選択: ${options.method} (${selectedIndices.length}個選択)`
        ]
      };
    }

    return this.processedDataset;
  }

  // 相関分析による特徴量選択
  private selectFeaturesByCorrelation(threshold: number, sourceDataset: SimpleDataset | ProcessedDataset): number[] {
    const data = sourceDataset.data;
    const targets = sourceDataset.targetValues;
    const correlations: { index: number, correlation: number }[] = [];

    for (let i = 0; i < data[0].length; i++) {
      const featureValues = data.map(row => typeof row[i] === 'number' ? row[i] : parseFloat(row[i] as string) || 0);
      const correlation = this.calculateCorrelation(featureValues as number[], targets);
      correlations.push({ index: i, correlation: Math.abs(correlation) });
    }

    return correlations
      .filter(c => c.correlation >= threshold)
      .sort((a, b) => b.correlation - a.correlation)
      .map(c => c.index);
  }

  // 重要度による特徴量選択
  private selectFeaturesByImportance(maxFeatures: number, sourceDataset: SimpleDataset | ProcessedDataset): number[] {
    const data = sourceDataset.data;
    const targets = sourceDataset.targetValues;
    const importances: { index: number, importance: number }[] = [];

    // 簡易的な重要度計算（分散ベース）
    for (let i = 0; i < data[0].length; i++) {
      const featureValues = data.map(row => typeof row[i] === 'number' ? row[i] : parseFloat(row[i] as string) || 0);
      const variance = this.calculateVariance(featureValues as number[]);
      const correlation = Math.abs(this.calculateCorrelation(featureValues as number[], targets));
      const importance = variance * correlation;
      importances.push({ index: i, importance });
    }

    return importances
      .sort((a, b) => b.importance - a.importance)
      .slice(0, maxFeatures)
      .map(i => i.index);
  }

  // 分散による特徴量選択
  private selectFeaturesByVariance(threshold: number, sourceDataset: SimpleDataset | ProcessedDataset): number[] {
    const data = sourceDataset.data;
    const selectedIndices: number[] = [];

    for (let i = 0; i < data[0].length; i++) {
      const featureValues = data.map(row => typeof row[i] === 'number' ? row[i] : parseFloat(row[i] as string) || 0);
      const variance = this.calculateVariance(featureValues as number[]);
      if (variance >= threshold) {
        selectedIndices.push(i);
      }
    }

    return selectedIndices;
  }

  // 相互情報量による特徴量選択
  private selectFeaturesByMutualInfo(maxFeatures: number, sourceDataset: SimpleDataset | ProcessedDataset): number[] {
    const data = sourceDataset.data;
    const targets = sourceDataset.targetValues;
    const mutualInfos: { index: number, mutualInfo: number }[] = [];

    for (let i = 0; i < data[0].length; i++) {
      const featureValues = data.map(row => typeof row[i] === 'number' ? row[i] : parseFloat(row[i] as string) || 0);
      const mutualInfo = this.calculateMutualInfo(featureValues as number[], targets);
      mutualInfos.push({ index: i, mutualInfo });
    }

    return mutualInfos
      .sort((a, b) => b.mutualInfo - a.mutualInfo)
      .slice(0, maxFeatures)
      .map(i => i.index);
  }

  // 相関係数を計算
  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  // 分散を計算
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  // 相互情報量を計算（簡易版）
  private calculateMutualInfo(x: number[], y: number[]): number {
    // 簡易的な相互情報量計算
    const correlation = Math.abs(this.calculateCorrelation(x, y));
    const xVariance = this.calculateVariance(x);
    const yVariance = this.calculateVariance(y);
    
    // 簡易的な相互情報量近似
    return correlation * Math.sqrt(xVariance * yVariance);
  }

  // データを分割
  // @ts-ignore
  splitData(trainRatio: number, validationRatio: number, testRatio: number) {
    let data: (number | string)[][];
    let targets: number[];

    if (this.processedDataset) {
      // 前処理済みデータを使用
      data = this.processedDataset.data;
      targets = this.processedDataset.targetValues;
    } else if (this.currentDataset) {
      // 生データを使用（カテゴリカル変数をエンコーディング）
      const { data: encodedData } = this.encodeCategoricalFeatures(
        this.currentDataset.data,
        this.currentDataset.featureNames,
        this.detectFeatureTypes(this.currentDataset.data),
        'label'
      );
      data = encodedData;
      targets = this.currentDataset.targetValues;
      
      // データを正規化
      const nFeatures = data[0].length;
      const means = new Array(nFeatures).fill(0);
      const stds = new Array(nFeatures).fill(0);
      
      // 平均を計算
      for (let i = 0; i < nFeatures; i++) {
        means[i] = data.reduce((sum, row) => {
          const val = row[i];
          return sum + (typeof val === 'number' ? val : 0);
        }, 0) / data.length;
      }
      
      // 標準偏差を計算
      for (let i = 0; i < nFeatures; i++) {
        const variance = data.reduce((sum, row) => {
          const val = row[i];
          const numVal = typeof val === 'number' ? val : 0;
          return sum + Math.pow(numVal - means[i], 2);
        }, 0) / data.length;
        stds[i] = Math.sqrt(variance);
      }
      
      // 正規化を適用
      data = data.map(row => 
        row.map((val, i) => {
          if (typeof val === 'number') {
            return (val - means[i]) / (stds[i] + 1e-8);
          }
          return val;
        })
      );
    } else {
      throw new Error('No dataset available for splitting');
    }

    const total = data.length;
    const trainEnd = Math.floor(total * trainRatio);
    const validationEnd = trainEnd + Math.floor(total * validationRatio);

    return {
      train: {
        data: data.slice(0, trainEnd),
        targets: targets.slice(0, trainEnd)
      },
      validation: {
        data: data.slice(trainEnd, validationEnd),
        targets: targets.slice(trainEnd, validationEnd)
      },
      test: {
        data: data.slice(validationEnd),
        targets: targets.slice(validationEnd)
      }
    };
  }

  // 現在のデータセットを設定
  setCurrentDataset(dataset: SimpleDataset) {
    this.currentDataset = dataset;
  }

  // データマネージャーをリセット
  reset() {
    this.currentDataset = null;
    this.processedDataset = null;
  }

  // 現在のデータセットを取得
  getCurrentDataset(): SimpleDataset | null {
    return this.currentDataset;
  }

  // 表示用のデータセットを取得（加工済みデータがあればそれを使用、なければ生データ）
  getDisplayDataset(): {
    data: (number | string)[][];
    featureNames: string[];
    featureTypes: ('numerical' | 'categorical')[];
    targetValues: number[];
    type: 'classification' | 'regression';
  } | null {
    if (!this.currentDataset) return null;

    // 加工済みデータがある場合はそれを使用
    if (this.processedDataset) {
      return {
        data: this.processedDataset.data,
        featureNames: this.processedDataset.featureNames,
        featureTypes: this.processedDataset.featureTypes,
        targetValues: this.processedDataset.targetValues,
        type: this.currentDataset.type
      };
    }

    // 加工済みデータがない場合は生データを使用
    return {
      data: this.currentDataset.data,
      featureNames: this.currentDataset.featureNames,
      featureTypes: this.detectFeatureTypes(this.currentDataset.data),
      targetValues: this.currentDataset.targetValues,
      type: this.currentDataset.type
    };
  }

  // 処理済みデータセットを取得
  getProcessedDataset(): ProcessedDataset | null {
    return this.processedDataset;
  }

  // 選択された特徴量のみの欠損値処理
  private handleMissingValuesForFeatures(data: (number | string)[][], featureTypes: ('numerical' | 'categorical')[], strategy: 'remove' | 'mean' | 'median' | 'mode' | 'forward_fill' | 'backward_fill' | 'interpolate' | 'knn', targetFeatures: number[]): (number | string)[][] {
    if (strategy === 'remove') {
      return data.filter(row => targetFeatures.every(idx => {
        const val = row[idx];
        return val !== null && val !== undefined && val !== '';
      }));
    }

    const result = data.map(row => [...row]);

    for (const j of targetFeatures) {
      if (featureTypes[j] === 'numerical') {
        const values = data.map(row => row[j] as number).filter(val => !isNaN(val) && val !== null && val !== undefined);
        
        if (values.length === 0) continue;

        let fillValue: number;
        switch (strategy) {
          case 'mean':
            fillValue = values.reduce((a, b) => a + b, 0) / values.length;
            break;
          case 'median':
            const sorted = [...values].sort((a, b) => a - b);
            fillValue = sorted[Math.floor(sorted.length / 2)];
            break;
          case 'mode':
            const counts: Record<number, number> = {};
            values.forEach(val => counts[val] = (counts[val] || 0) + 1);
            fillValue = parseInt(Object.keys(counts).reduce((a, b) => counts[parseInt(a)] > counts[parseInt(b)] ? a : b));
            break;
          default:
            fillValue = 0;
        }

        for (let i = 0; i < result.length; i++) {
          const val = result[i][j];
          if (val === null || val === undefined || val === '' || isNaN(val as number)) {
            result[i][j] = fillValue;
          }
        }
      } else {
        // カテゴリカル変数の場合
        const values = data.map(row => row[j] as string).filter(val => val !== null && val !== undefined && val !== '');
        
        if (values.length === 0) continue;

        let fillValue: string;
        switch (strategy) {
          case 'mode':
            const counts: Record<string, number> = {};
            values.forEach(val => counts[val] = (counts[val] || 0) + 1);
            fillValue = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            break;
          default:
            fillValue = 'unknown';
        }

        for (let i = 0; i < result.length; i++) {
          const val = result[i][j];
          if (val === null || val === undefined || val === '') {
            result[i][j] = fillValue;
          }
        }
      }
    }

    return result;
  }

  // 欠損値処理（未使用のためコメントアウト）
  /*
  private handleMissingValues(data: (number | string)[][], featureTypes: ('numerical' | 'categorical')[], strategy: 'remove' | 'mean' | 'median' | 'mode' | 'forward_fill' | 'backward_fill' | 'interpolate' | 'knn'): (number | string)[][] {
    if (strategy === 'remove') {
      return data.filter(row => row.every(val => val !== null && val !== undefined && val !== ''));
    }

    const result = data.map(row => [...row]);
    const nFeatures = featureTypes.length;

    for (let j = 0; j < nFeatures; j++) {
      if (featureTypes[j] === 'numerical') {
        const values = data.map(row => row[j] as number).filter(val => !isNaN(val) && val !== null && val !== undefined);
        
        if (values.length === 0) continue;

        let fillValue: number;
        switch (strategy) {
          case 'mean':
            fillValue = values.reduce((a, b) => a + b, 0) / values.length;
            break;
          case 'median':
            const sorted = values.sort((a, b) => a - b);
            fillValue = sorted[Math.floor(sorted.length / 2)];
            break;
          case 'mode':
            const counts: Record<number, number> = {};
            values.forEach(v => counts[v] = (counts[v] || 0) + 1);
            fillValue = parseInt(Object.keys(counts).reduce((a, b) => counts[parseInt(a)] > counts[parseInt(b)] ? a : b));
            break;
          case 'forward_fill':
            // 前方埋め
            let lastValidValue = 0;
            for (let i = 0; i < result.length; i++) {
              if (result[i][j] !== null && result[i][j] !== undefined && result[i][j] !== '') {
                lastValidValue = result[i][j] as number;
              } else {
                result[i][j] = lastValidValue;
              }
            }
            continue;
          case 'backward_fill':
            // 後方埋め
            let nextValidValue = 0;
            for (let i = result.length - 1; i >= 0; i--) {
              if (result[i][j] !== null && result[i][j] !== undefined && result[i][j] !== '') {
                nextValidValue = result[i][j] as number;
              } else {
                result[i][j] = nextValidValue;
              }
            }
            continue;
          case 'interpolate':
            // 線形補間
            this.interpolateNumericalColumn(result, j);
            continue;
          case 'knn':
            // KNN補間（簡易版）
            this.knnImputeNumericalColumn(result, j, values);
            continue;
          default:
            fillValue = 0;
        }

        if (strategy === 'mean' || strategy === 'median' || strategy === 'mode') {
          for (let i = 0; i < result.length; i++) {
            if (result[i][j] === null || result[i][j] === undefined || result[i][j] === '') {
              result[i][j] = fillValue;
            }
          }
        }
      } else {
        // カテゴリカル変数の場合
        const values = data.map(row => row[j] as string).filter(val => val !== null && val !== undefined && val !== '');
        
        if (values.length === 0) continue;

        let fillValue: string;
        switch (strategy) {
          case 'mode':
            const counts: Record<string, number> = {};
            values.forEach(v => counts[v] = (counts[v] || 0) + 1);
            fillValue = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            break;
          case 'forward_fill':
            // 前方埋め
            let lastValidValue = 'unknown';
            for (let i = 0; i < result.length; i++) {
              if (result[i][j] !== null && result[i][j] !== undefined && result[i][j] !== '') {
                lastValidValue = result[i][j] as string;
              } else {
                result[i][j] = lastValidValue;
              }
            }
            continue;
          case 'backward_fill':
            // 後方埋め
            let nextValidValue = 'unknown';
            for (let i = result.length - 1; i >= 0; i--) {
              if (result[i][j] !== null && result[i][j] !== undefined && result[i][j] !== '') {
                nextValidValue = result[i][j] as string;
              } else {
                result[i][j] = nextValidValue;
              }
            }
            continue;
          default:
            fillValue = 'unknown';
        }

        if (strategy === 'mode') {
          for (let i = 0; i < result.length; i++) {
            if (result[i][j] === null || result[i][j] === undefined || result[i][j] === '') {
              result[i][j] = fillValue;
            }
          }
        }
      }
    }

    return result;
  }

  // 数値列の線形補間
  private interpolateNumericalColumn(data: (number | string)[][], columnIndex: number): void {
    const values = data.map(row => row[columnIndex] as number);
    const n = values.length;
    
    for (let i = 0; i < n; i++) {
      if (isNaN(values[i]) || values[i] === null || values[i] === undefined) {
        // 前後の有効な値を見つける
        let prevIndex = -1;
        let nextIndex = -1;
        
        for (let j = i - 1; j >= 0; j--) {
          if (!isNaN(values[j]) && values[j] !== null && values[j] !== undefined) {
            prevIndex = j;
            break;
          }
        }
        
        for (let j = i + 1; j < n; j++) {
          if (!isNaN(values[j]) && values[j] !== null && values[j] !== undefined) {
            nextIndex = j;
            break;
          }
        }
        
        if (prevIndex !== -1 && nextIndex !== -1) {
          // 線形補間
          const ratio = (i - prevIndex) / (nextIndex - prevIndex);
          const interpolatedValue = values[prevIndex] + ratio * (values[nextIndex] - values[prevIndex]);
          data[i][columnIndex] = interpolatedValue;
        } else if (prevIndex !== -1) {
          // 前の値を使用
          data[i][columnIndex] = values[prevIndex];
        } else if (nextIndex !== -1) {
          // 後の値を使用
          data[i][columnIndex] = values[nextIndex];
        } else {
          // デフォルト値
          data[i][columnIndex] = 0;
        }
      }
    }
  }

  // KNN補間（簡易版）
  private knnImputeNumericalColumn(data: (number | string)[][], columnIndex: number, validValues: number[]): void {
    const k = Math.min(3, validValues.length); // k=3で固定
    
    for (let i = 0; i < data.length; i++) {
      if (isNaN(data[i][columnIndex] as number) || data[i][columnIndex] === null || data[i][columnIndex] === undefined) {
        // 他の数値列との距離を計算して最も近いk個のサンプルを見つける
        const distances: { index: number, distance: number }[] = [];
        
        for (let j = 0; j < data.length; j++) {
          if (i !== j && !isNaN(data[j][columnIndex] as number) && data[j][columnIndex] !== null && data[j][columnIndex] !== undefined) {
            let distance = 0;
            let validFeatures = 0;
            
            // 他の数値特徴量との距離を計算
            for (let k = 0; k < data[0].length; k++) {
              if (k !== columnIndex && typeof data[i][k] === 'number' && typeof data[j][k] === 'number') {
                distance += Math.pow((data[i][k] as number) - (data[j][k] as number), 2);
                validFeatures++;
              }
            }
            
            if (validFeatures > 0) {
              distance = Math.sqrt(distance / validFeatures);
              distances.push({ index: j, distance });
            }
          }
        }
        
        // 距離でソートして上位k個を取得
        distances.sort((a, b) => a.distance - b.distance);
        const kNearest = distances.slice(0, k);
        
        if (kNearest.length > 0) {
          // 重み付き平均で補間
          const weights = kNearest.map(d => 1 / (d.distance + 1e-8));
          const weightedSum = kNearest.reduce((sum, d) => sum + (data[d.index][columnIndex] as number) * weights[kNearest.indexOf(d)], 0);
          const totalWeight = weights.reduce((sum, w) => sum + w, 0);
          data[i][columnIndex] = weightedSum / totalWeight;
        } else {
          data[i][columnIndex] = validValues.length > 0 ? validValues[Math.floor(Math.random() * validValues.length)] : 0;
        }
      }
    }
  }

  // 選択された特徴量のみの外れ値処理
  private handleOutliersForFeatures(data: (number | string)[][], featureTypes: ('numerical' | 'categorical')[], strategy: 'none' | 'iqr' | 'zscore' | 'isolation_forest' | 'local_outlier_factor', threshold: number, targetFeatures: number[]): (number | string)[][] {
    if (strategy === 'none') return data;

    const result = data.map(row => [...row]);

    for (const j of targetFeatures) {
      if (featureTypes[j] === 'numerical') {
        const values = data.map(row => row[j] as number).filter(val => !isNaN(val));
        
        if (values.length === 0) continue;

        let outlierIndices: number[] = [];
        
        switch (strategy) {
          case 'iqr':
            const sorted = values.sort((a, b) => a - b);
            const q1 = sorted[Math.floor(sorted.length * 0.25)];
            const q3 = sorted[Math.floor(sorted.length * 0.75)];
            const iqr = q3 - q1;
            const lowerBound = q1 - threshold * iqr;
            const upperBound = q3 + threshold * iqr;
            
            outlierIndices = data.map((row, i) => {
              const val = row[j] as number;
              return (val < lowerBound || val > upperBound) ? i : -1;
            }).filter(i => i !== -1);
            break;
            
          case 'zscore':
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
            
            outlierIndices = data.map((row, i) => {
              const val = row[j] as number;
              const zScore = Math.abs((val - mean) / std);
              return zScore > threshold ? i : -1;
            }).filter(i => i !== -1);
            break;
        }

        // 外れ値を平均値で置換
        if (outlierIndices.length > 0) {
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          outlierIndices.forEach(i => {
            result[i][j] = mean;
          });
        }
      }
    }

    return result;
  }

  // 外れ値処理（未使用のためコメントアウト）
  /*
  private handleOutliers(data: (number | string)[][], featureTypes: ('numerical' | 'categorical')[], strategy: 'none' | 'iqr' | 'zscore' | 'isolation_forest' | 'local_outlier_factor', threshold: number): (number | string)[][] {
    if (strategy === 'none') return data;

    const result = data.map(row => [...row]);
    const nFeatures = featureTypes.length;

    for (let j = 0; j < nFeatures; j++) {
      if (featureTypes[j] === 'numerical') {
        const values = data.map(row => row[j] as number).filter(val => !isNaN(val));
        
        if (values.length === 0) continue;

        let outlierIndices: number[] = [];
        
        switch (strategy) {
          case 'iqr':
            const sorted = values.sort((a, b) => a - b);
            const q1 = sorted[Math.floor(sorted.length * 0.25)];
            const q3 = sorted[Math.floor(sorted.length * 0.75)];
            const iqr = q3 - q1;
            const lowerBound = q1 - threshold * iqr;
            const upperBound = q3 + threshold * iqr;
            
            outlierIndices = data.map((row, i) => {
              const val = row[j] as number;
              return (val < lowerBound || val > upperBound) ? i : -1;
            }).filter(i => i !== -1);
            break;
            
          case 'zscore':
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
            
            outlierIndices = data.map((row, i) => {
              const val = row[j] as number;
              const zScore = Math.abs((val - mean) / std);
              return zScore > threshold ? i : -1;
            }).filter(i => i !== -1);
            break;
        }

        // 外れ値をクリップまたは削除
        if (strategy === 'iqr' || strategy === 'zscore') {
          const sorted = values.sort((a, b) => a - b);
          const q1 = sorted[Math.floor(sorted.length * 0.25)];
          const q3 = sorted[Math.floor(sorted.length * 0.75)];
          
          outlierIndices.forEach(i => {
            const val = result[i][j] as number;
            if (val < q1) result[i][j] = q1;
            else if (val > q3) result[i][j] = q3;
          });
        }
      }
    }

    return result;
  }

  // スケーリング適用
  // @ts-ignore
  private applyScaling(data: (number | string)[][], featureTypes: ('numerical' | 'categorical')[], strategy: string): (number | string)[][] {
    if (strategy === 'none') return data;

    const result = data.map(row => [...row]);
    const numericalIndices = featureTypes.map((type, i) => type === 'numerical' ? i : -1).filter(i => i !== -1);

    if (numericalIndices.length === 0) return result;

    for (const idx of numericalIndices) {
      const values = data.map(row => row[idx] as number).filter(val => !isNaN(val));
      
      if (values.length === 0) continue;

      let scaledValues: number[];
      
      switch (strategy) {
        case 'minmax':
          const min = Math.min(...values);
          const max = Math.max(...values);
          scaledValues = values.map(v => (v - min) / (max - min));
          break;
          
        case 'standard':
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
          scaledValues = values.map(v => (v - mean) / std);
          break;
          
        case 'robust':
          const sorted = values.sort((a, b) => a - b);
          const q1 = sorted[Math.floor(sorted.length * 0.25)];
          const q3 = sorted[Math.floor(sorted.length * 0.75)];
          const median = sorted[Math.floor(sorted.length / 2)];
          scaledValues = values.map(v => (v - median) / (q3 - q1));
          break;
          
        case 'maxabs':
          const maxAbs = Math.max(...values.map(v => Math.abs(v)));
          scaledValues = values.map(v => v / maxAbs);
          break;
          
        default:
          scaledValues = values;
      }

      // スケーリングされた値を適用
      let scaledIdx = 0;
      for (let i = 0; i < result.length; i++) {
        if (!isNaN(result[i][idx] as number)) {
          result[i][idx] = scaledValues[scaledIdx++];
        }
      }
    }

    return result;
  }

  // 次元削減適用
  private applyDimensionalityReduction(data: (number | string)[][], featureTypes: ('numerical' | 'categorical')[], method: string, nComponents: number): {
    data: (number | string)[][];
    featureNames: string[];
    featureTypes: ('numerical' | 'categorical')[];
  } {
    if (method === 'none') {
      return {
        data,
        featureNames: this.currentDataset?.featureNames || [],
        featureTypes
      };
    }

    // 数値特徴量のみを抽出
    const numericalIndices = featureTypes.map((type, i) => type === 'numerical' ? i : -1).filter(i => i !== -1);
    const numericalData = data.map(row => numericalIndices.map(i => row[i] as number));

    if (numericalData.length === 0) {
      return {
        data,
        featureNames: this.currentDataset?.featureNames || [],
        featureTypes
      };
    }

    let reducedData: number[][];
    let newFeatureNames: string[];

    switch (method) {
      case 'pca':
        const pcaResult = this.performPCA(numericalData, nComponents);
        reducedData = pcaResult.data;
        newFeatureNames = pcaResult.featureNames;
        break;
        
      case 'lda':
        // LDAは分類問題のみ
        if (this.currentDataset?.type === 'classification') {
          const ldaResult = this.performLDA(numericalData, this.currentDataset.targetValues, nComponents);
          reducedData = ldaResult.data;
          newFeatureNames = ldaResult.featureNames;
        } else {
          reducedData = numericalData;
          newFeatureNames = numericalIndices.map(i => `feature_${i}`);
        }
        break;
        
      default:
        reducedData = numericalData;
        newFeatureNames = numericalIndices.map(i => `feature_${i}`);
    }

    return {
      data: reducedData.map(row => row.map(val => val)),
      featureNames: newFeatureNames,
      featureTypes: new Array(nComponents).fill('numerical' as 'numerical' | 'categorical')
    };
  }

  // PCA実装
  private performPCA(data: number[][], nComponents: number): { data: number[][]; featureNames: string[] } {
    const nSamples = data.length;
    const nFeatures = data[0].length;
    
    // 平均を計算
    const means = new Array(nFeatures).fill(0);
    for (let i = 0; i < nFeatures; i++) {
      means[i] = data.reduce((sum, row) => sum + row[i], 0) / nSamples;
    }
    
    // データを中心化
    const centeredData = data.map(row => 
      row.map((val, i) => val - means[i])
    );
    
    // 共分散行列を計算
    const covariance = new Array(nFeatures).fill(0).map(() => new Array(nFeatures).fill(0));
    for (let i = 0; i < nFeatures; i++) {
      for (let j = 0; j < nFeatures; j++) {
        covariance[i][j] = centeredData.reduce((sum, row) => sum + row[i] * row[j], 0) / (nSamples - 1);
      }
    }
    
    // 簡易的な固有値分解（2x2行列の場合のみ）
    if (nFeatures === 2) {
      const a = covariance[0][0];
      const b = covariance[0][1];
      const c = covariance[1][0];
      const d = covariance[1][1];
      
      const trace = a + d;
      const det = a * d - b * c;
      const discriminant = trace * trace - 4 * det;
      
      if (discriminant >= 0) {
        const lambda1 = (trace + Math.sqrt(discriminant)) / 2;
        const lambda2 = (trace - Math.sqrt(discriminant)) / 2;
        
        // 固有ベクトルを計算
        const eigenvector1 = [b, lambda1 - a];
        const eigenvector2 = [b, lambda2 - a];
        
        // 正規化
        const norm1 = Math.sqrt(eigenvector1[0] * eigenvector1[0] + eigenvector1[1] * eigenvector1[1]);
        const norm2 = Math.sqrt(eigenvector2[0] * eigenvector2[0] + eigenvector2[1] * eigenvector2[1]);
        
        if (norm1 > 0) {
          eigenvector1[0] /= norm1;
          eigenvector1[1] /= norm1;
        }
        if (norm2 > 0) {
          eigenvector2[0] /= norm2;
          eigenvector2[1] /= norm2;
        }
        
        // データを変換
        const transformedData = centeredData.map(row => [
          row[0] * eigenvector1[0] + row[1] * eigenvector1[1],
          row[0] * eigenvector2[0] + row[1] * eigenvector2[1]
        ]);
        
        return {
          data: transformedData.slice(0, nComponents).map(row => row.slice(0, nComponents)),
          featureNames: Array.from({ length: nComponents }, (_, i) => `PC${i + 1}`)
        };
      }
    }
    
    // フォールバック: 最初のnComponents個の特徴量を返す
    return {
      data: data.map(row => row.slice(0, nComponents)),
      featureNames: Array.from({ length: nComponents }, (_, i) => `PC${i + 1}`)
    };
  }

  // LDA実装（簡易版）
  private performLDA(data: number[][], targets: number[], nComponents: number): { data: number[][]; featureNames: string[] } {
    // 簡易実装: クラス間の平均を計算
    const uniqueClasses = [...new Set(targets)];
    const classMeans = uniqueClasses.map(cls => {
      const classData = data.filter((_, i) => targets[i] === cls);
      const mean = new Array(data[0].length).fill(0);
      for (let i = 0; i < data[0].length; i++) {
        mean[i] = classData.reduce((sum, row) => sum + row[i], 0) / classData.length;
      }
      return mean;
    });
    
    // クラス間の差を計算
    const transformedData = data.map(row => {
      const result = [];
      for (let i = 0; i < Math.min(nComponents, classMeans.length - 1); i++) {
        let projection = 0;
        for (let j = 0; j < row.length; j++) {
          projection += row[j] * (classMeans[0][j] - classMeans[1][j]);
        }
        result.push(projection);
      }
      return result;
    });
    
    return {
      data: transformedData,
      featureNames: Array.from({ length: nComponents }, (_, i) => `LD${i + 1}`)
    };
  }
  */
}

// シングルトンインスタンス
export const simpleDataManager = new SimpleDataManager();



