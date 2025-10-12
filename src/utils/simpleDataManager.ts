// シンプルなデータ管理システム
export interface SimpleDataset {
  id: string;
  name: string;
  type: 'classification' | 'regression';
  description: string;
  data: number[][];
  featureNames: string[];
  targetName: string;
  targetValues: number[];
}

export interface ProcessedDataset {
  data: number[][];
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
  generateDataset(type: 'classification' | 'regression'): SimpleDataset {
    const datasetTypes = type === 'classification' ? 
      ['customer', 'medical', 'financial', 'marketing', 'social'] :
      ['housing', 'sales', 'stock', 'weather', 'energy'];
    
    const selectedType = datasetTypes[Math.floor(Math.random() * datasetTypes.length)];
    
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

    this.currentDataset = datasets[type][selectedType];
    return this.currentDataset;
  }

  // 顧客データを生成
  private generateCustomerData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['age', 'income', 'education', 'gender', 'city_size', 'credit_score', 'marital_status', 'occupation'];
    const featureTypes: ('numerical' | 'categorical')[] = ['numerical', 'numerical', 'categorical', 'categorical', 'categorical', 'numerical', 'categorical', 'categorical'];

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
    const featureTypes: ('numerical' | 'categorical')[] = ['numerical', 'numerical', 'numerical', 'numerical', 'categorical', 'categorical', 'categorical', 'categorical'];

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
    const featureTypes: ('numerical' | 'categorical')[] = ['numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'categorical', 'categorical', 'categorical'];

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
    const featureTypes: ('numerical' | 'categorical')[] = ['numerical', 'numerical', 'categorical', 'categorical', 'categorical', 'numerical', 'categorical', 'categorical'];

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
    const featureTypes: ('numerical' | 'categorical')[] = ['numerical', 'numerical', 'categorical', 'categorical', 'categorical', 'numerical', 'categorical', 'categorical'];

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

  // 住宅データを生成
  private generateHousingData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['house_size', 'bedrooms', 'bathrooms', 'location', 'age', 'condition', 'garage', 'pool', 'garden_size'];
    const featureTypes: ('numerical' | 'categorical')[] = ['numerical', 'numerical', 'numerical', 'categorical', 'numerical', 'categorical', 'categorical', 'categorical', 'numerical'];

    for (let i = 0; i < 2000; i++) {
      const houseSize = Math.random() * 300 + 50;
      const bedrooms = Math.floor(Math.random() * 5) + 1;
      const bathrooms = Math.floor(Math.random() * 4) + 1;
      const location = ['suburban', 'urban', 'rural', 'downtown'][Math.floor(Math.random() * 4)];
      const age = Math.floor(Math.random() * 50) + 1;
      const condition = ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)];
      const garage = Math.random() > 0.3 ? 'yes' : 'no';
      const pool = Math.random() > 0.8 ? 'yes' : 'no';
      const gardenSize = Math.random() * 2000;
      
      // 複雑な価格計算
      let basePrice = houseSize * 2000 + bedrooms * 50000 + bathrooms * 30000;
      if (location === 'downtown') basePrice *= 1.8;
      else if (location === 'urban') basePrice *= 1.4;
      else if (location === 'rural') basePrice *= 0.6;
      
      if (condition === 'excellent') basePrice *= 1.3;
      else if (condition === 'good') basePrice *= 1.1;
      else if (condition === 'poor') basePrice *= 0.7;
      
      if (garage === 'yes') basePrice += 20000;
      if (pool === 'yes') basePrice += 50000;
      basePrice += gardenSize * 10;
      basePrice -= age * 1000;
      
      const target = basePrice + (Math.random() - 0.5) * 100000;
      
      data.push([houseSize, bedrooms, bathrooms, location, age, condition, garage, pool, gardenSize]);
      targetValues.push(target);
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

  // 売上データを生成
  private generateSalesData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['product_category', 'price', 'discount', 'season', 'advertising_budget', 'competitor_price', 'store_size', 'location_type'];
    const featureTypes: ('numerical' | 'categorical')[] = ['categorical', 'numerical', 'numerical', 'categorical', 'numerical', 'numerical', 'categorical', 'categorical'];

    for (let i = 0; i < 1800; i++) {
      const productCategory = ['electronics', 'clothing', 'food', 'books', 'sports'][Math.floor(Math.random() * 5)];
      const price = Math.random() * 500 + 10;
      const discount = Math.random() * 0.5;
      const season = ['spring', 'summer', 'autumn', 'winter'][Math.floor(Math.random() * 4)];
      const advertisingBudget = Math.random() * 10000;
      const competitorPrice = price * (0.8 + Math.random() * 0.4);
      const storeSize = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)];
      const locationType = ['mall', 'street', 'online'][Math.floor(Math.random() * 3)];
      
      // 売上予測
      let baseSales = price * (1 - discount) * 100;
      if (productCategory === 'electronics') baseSales *= 1.5;
      else if (productCategory === 'clothing') baseSales *= 1.2;
      else if (productCategory === 'food') baseSales *= 0.8;
      
      if (season === 'winter' && productCategory === 'clothing') baseSales *= 1.3;
      if (season === 'summer' && productCategory === 'sports') baseSales *= 1.4;
      
      baseSales += advertisingBudget * 0.1;
      if (price < competitorPrice) baseSales *= 1.2;
      
      if (storeSize === 'large') baseSales *= 1.3;
      else if (storeSize === 'small') baseSales *= 0.7;
      
      if (locationType === 'mall') baseSales *= 1.2;
      else if (locationType === 'online') baseSales *= 1.1;
      
      const target = baseSales + (Math.random() - 0.5) * baseSales * 0.3;
      
      data.push([productCategory, price, discount, season, advertisingBudget, competitorPrice, storeSize, locationType]);
      targetValues.push(target);
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

  // 株価データを生成
  private generateStockData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['sector', 'market_cap', 'pe_ratio', 'debt_ratio', 'revenue_growth', 'profit_margin', 'dividend_yield', 'volatility'];
    const featureTypes: ('numerical' | 'categorical')[] = ['categorical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical'];

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
    const featureTypes: ('numerical' | 'categorical')[] = ['numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'categorical', 'categorical', 'numerical'];

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
    const featureTypes: ('numerical' | 'categorical')[] = ['numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'categorical', 'categorical', 'categorical'];

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
  private generateClassificationData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['age', 'income', 'education', 'gender', 'city_size'];
    const featureTypes: ('numerical' | 'categorical')[] = ['numerical', 'numerical', 'categorical', 'categorical', 'categorical'];

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
  private generateRegressionData(): SimpleDataset {
    const data: (number | string)[][] = [];
    const targetValues: number[] = [];
    const featureNames = ['house_size', 'bedrooms', 'location', 'age', 'condition'];
    const featureTypes: ('numerical' | 'categorical')[] = ['numerical', 'numerical', 'categorical', 'numerical', 'categorical'];

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

  // データを前処理
  processData(options: {
    // 欠損値処理
    missingValueStrategy?: 'remove' | 'mean' | 'median' | 'mode' | 'forward_fill' | 'backward_fill' | 'interpolate' | 'knn';
    
    // 外れ値処理
    outlierStrategy?: 'none' | 'iqr' | 'zscore' | 'isolation_forest' | 'local_outlier_factor';
    outlierThreshold?: number;
    
    // 正規化・標準化
    scalingStrategy?: 'none' | 'minmax' | 'standard' | 'robust' | 'maxabs' | 'quantile';
    
    // 特徴量選択
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
  }): ProcessedDataset {
    if (!this.currentDataset) {
      throw new Error('No dataset loaded');
    }

    let processedData = [...this.currentDataset.data];
    let processedFeatureNames = [...this.currentDataset.featureNames];
    let featureTypes: ('numerical' | 'categorical')[] = this.detectFeatureTypes(processedData);
    const processingSteps: string[] = [];
    const encodingInfo: Record<string, any> = {};

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

    // 欠損値処理
    const missingStrategy = options.missingValueStrategy || 'remove';
    if (missingStrategy !== 'none') {
      processedData = this.handleMissingValues(processedData, featureTypes, missingStrategy);
      processingSteps.push(`欠損値処理: ${missingStrategy}手法を適用`);
    }

    // 外れ値処理
    const outlierStrategy = options.outlierStrategy || 'none';
    if (outlierStrategy !== 'none') {
      const threshold = options.outlierThreshold || 1.5;
      processedData = this.handleOutliers(processedData, featureTypes, outlierStrategy, threshold);
      processingSteps.push(`外れ値処理: ${outlierStrategy}手法を適用 (閾値: ${threshold})`);
    }

    // カテゴリカル変数のエンコーディング
    if (options.categoricalEncoding && options.categoricalEncoding !== 'none') {
      const result = this.encodeCategoricalFeatures(
        processedData, 
        processedFeatureNames, 
        featureTypes, 
        options.categoricalEncoding,
        options.selectedFeatures // 選択したカラムのみに適用
      );
      processedData = result.data;
      processedFeatureNames = result.featureNames;
      featureTypes = result.featureTypes;
      encodingInfo.categorical = result.encodingInfo;
      processingSteps.push(`カテゴリカル変数エンコーディング: ${options.categoricalEncoding}`);
    }

    // 特徴量エンジニアリング
    if (options.featureEngineering) {
      const result = this.performFeatureEngineering(processedData, processedFeatureNames, featureTypes);
      processedData = result.data;
      processedFeatureNames = result.featureNames;
      featureTypes = result.featureTypes;
      processingSteps.push(`特徴量エンジニアリング: ${result.newFeatures.length}個の新特徴量を追加`);
    }

    // 特徴量選択
    if (options.selectedFeatures) {
      processedData = processedData.map(row => 
        options.selectedFeatures!.map(idx => row[idx])
      );
      processedFeatureNames = options.selectedFeatures.map(idx => 
        processedFeatureNames[idx]
      );
      featureTypes = options.selectedFeatures.map(idx => featureTypes[idx]);
      processingSteps.push(`特徴量選択: ${options.selectedFeatures.length}個の特徴量を選択`);
    }

    // 正規化
    if (options.normalize) {
      const numericalIndices = featureTypes.map((type, i) => type === 'numerical' ? i : -1).filter(i => i !== -1);
      
      if (numericalIndices.length > 0) {
        const means = numericalIndices.map(i => {
          const values = processedData.map(row => row[i] as number);
          return values.reduce((a, b) => a + b, 0) / values.length;
        });
        
        const stds = numericalIndices.map((i, idx) => {
          const values = processedData.map(row => row[i] as number);
          const mean = means[idx];
          const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
          return Math.sqrt(variance);
        });

        processedData = processedData.map(row => {
          const newRow = [...row];
          numericalIndices.forEach((i, idx) => {
            newRow[i] = ((row[i] as number) - means[idx]) / stds[idx];
          });
          return newRow;
        });
        processingSteps.push('正規化: 数値特徴量を平均0、分散1に正規化');
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

  // カテゴリカル変数のエンコーディング
  private encodeCategoricalFeatures(
    data: (number | string)[][],
    featureNames: string[],
    featureTypes: ('numerical' | 'categorical')[],
    method: 'label' | 'onehot' | 'target',
    selectedFeatures?: number[]
  ): {
    data: number[][];
    featureNames: string[];
    featureTypes: ('numerical' | 'categorical')[];
    encodingInfo: Record<string, any>;
  } {
    const result: number[][] = [];
    const newFeatureNames: string[] = [];
    const newFeatureTypes: ('numerical' | 'categorical')[] = [];
    const encodingInfo: Record<string, any> = {};

    for (let i = 0; i < data.length; i++) {
      const newRow: number[] = [];
      
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
            // エンコーディングしない場合はそのまま
            newRow.push(0); // デフォルト値
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
    data: number[][],
    featureNames: string[],
    featureTypes: ('numerical' | 'categorical')[]
  ): {
    data: number[][];
    featureNames: string[];
    featureTypes: ('numerical' | 'categorical')[];
    newFeatures: string[];
  } {
    const newData: number[][] = [];
    const newFeatureNames = [...featureNames];
    const newFeatureTypes = [...featureTypes];
    const newFeatures: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const newRow = [...data[i]];
      
      // 数値特徴量の組み合わせ
      const numericalIndices = featureTypes.map((type, idx) => type === 'numerical' ? idx : -1).filter(i => i !== -1);
      
      if (numericalIndices.length >= 2) {
        // 積
        const product = numericalIndices.reduce((acc, idx) => acc * data[i][idx], 1);
        newRow.push(product);
        if (i === 0) {
          newFeatureNames.push('feature_product');
          newFeatureTypes.push('numerical');
          newFeatures.push('feature_product');
        }
        
        // 平均
        const mean = numericalIndices.reduce((acc, idx) => acc + data[i][idx], 0) / numericalIndices.length;
        newRow.push(mean);
        if (i === 0) {
          newFeatureNames.push('feature_mean');
          newFeatureTypes.push('numerical');
          newFeatures.push('feature_mean');
        }
        
        // 最大値
        const max = Math.max(...numericalIndices.map(idx => data[i][idx]));
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
    const selectedFeatureTypes = options.selectedFeatures.map(i => featureTypes[i]);

    // 変換を適用
    if (options.transformations.polynomial) {
      const { data: polyData, names: polyNames } = this.createPolynomialFeatures(selectedData, selectedFeatureNames);
      data = polyData;
      featureNames = polyNames;
      featureTypes = new Array(featureNames.length).fill('numerical');
      newFeatures.push('polynomial');
      processingSteps.push('多項式特徴量の作成');
    }

    if (options.transformations.interaction) {
      const { data: intData, names: intNames } = this.createInteractionFeatures(data, featureNames);
      data = intData;
      featureNames = intNames;
      featureTypes = new Array(featureNames.length).fill('numerical');
      newFeatures.push('interaction');
      processingSteps.push('交互作用特徴量の作成');
    }

    if (options.transformations.log) {
      const { data: logData, names: logNames } = this.createLogFeatures(data, featureNames);
      data = logData;
      featureNames = logNames;
      featureTypes = new Array(featureNames.length).fill('numerical');
      newFeatures.push('log');
      processingSteps.push('対数変換特徴量の作成');
    }

    if (options.transformations.sqrt) {
      const { data: sqrtData, names: sqrtNames } = this.createSqrtFeatures(data, featureNames);
      data = sqrtData;
      featureNames = sqrtNames;
      featureTypes = new Array(featureNames.length).fill('numerical');
      newFeatures.push('sqrt');
      processingSteps.push('平方根変換特徴量の作成');
    }

    if (options.transformations.square) {
      const { data: squareData, names: squareNames } = this.createSquareFeatures(data, featureNames);
      data = squareData;
      featureNames = squareNames;
      featureTypes = new Array(featureNames.length).fill('numerical');
      newFeatures.push('square');
      processingSteps.push('二乗特徴量の作成');
    }

    // 集約特徴量の作成
    if (options.aggregations.mean) {
      const { data: meanData, names: meanNames } = this.createAggregationFeatures(data, featureNames, 'mean');
      data = meanData;
      featureNames = meanNames;
      featureTypes = new Array(featureNames.length).fill('numerical');
      newFeatures.push('mean_agg');
      processingSteps.push('平均集約特徴量の作成');
    }

    // 次元削減
    if (options.dimensionalityReduction.method !== 'none') {
      const { data: reducedData, names: reducedNames } = this.applyDimensionalityReduction(
        data, 
        options.dimensionalityReduction.method, 
        options.dimensionalityReduction.components
      );
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

  // 次元削減の適用
  private applyDimensionalityReduction(data: number[][], method: string, components: number): { data: number[][], names: string[] } {
    // 簡易的なPCA実装
    if (method === 'pca') {
      return this.simplePCA(data, components);
    }
    
    // その他の方法は簡易実装
    return {
      data: data.map(row => row.slice(0, components)),
      names: Array.from({ length: components }, (_, i) => `${method}_component_${i + 1}`)
    };
  }

  // 簡易PCA実装
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
        processingSteps: [`特徴量選択: ${options.method} (${selectedIndices.length}個選択)`]
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
      const correlation = this.calculateCorrelation(featureValues, targets);
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
      const variance = this.calculateVariance(featureValues);
      const correlation = Math.abs(this.calculateCorrelation(featureValues, targets));
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
      const variance = this.calculateVariance(featureValues);
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
      const mutualInfo = this.calculateMutualInfo(featureValues, targets);
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
  splitData(trainRatio: number, validationRatio: number, testRatio: number) {
    let data: number[][];
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
        means[i] = data.reduce((sum, row) => sum + row[i], 0) / data.length;
      }
      
      // 標準偏差を計算
      for (let i = 0; i < nFeatures; i++) {
        const variance = data.reduce((sum, row) => sum + Math.pow(row[i] - means[i], 2), 0) / data.length;
        stds[i] = Math.sqrt(variance);
      }
      
      // 正規化を適用
      data = data.map(row => 
        row.map((val, i) => (val - means[i]) / (stds[i] + 1e-8))
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

  // 処理済みデータセットを取得
  getProcessedDataset(): ProcessedDataset | null {
    return this.processedDataset;
  }

  // 欠損値処理
  private handleMissingValues(data: (number | string)[][], featureTypes: ('numerical' | 'categorical')[], strategy: string): (number | string)[][] {
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

        if (strategy !== 'forward_fill' && strategy !== 'backward_fill' && strategy !== 'interpolate' && strategy !== 'knn') {
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

        if (strategy !== 'forward_fill' && strategy !== 'backward_fill') {
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

  // 外れ値処理
  private handleOutliers(data: (number | string)[][], featureTypes: ('numerical' | 'categorical')[], strategy: string, threshold: number): (number | string)[][] {
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
}

// シングルトンインスタンス
export const simpleDataManager = new SimpleDataManager();
