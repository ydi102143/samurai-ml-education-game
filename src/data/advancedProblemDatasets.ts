// 高度なオンライン問題用のデータセット

export interface AdvancedProblemDataset {
  id: string;
  name: string;
  description: string;
  data: { features: (number | string)[]; label: number | string }[]; // カテゴリカル変数は文字列として格納
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[]; // 特徴量のタイプ
  problemType: 'classification' | 'regression';
  targetName: string;
  classes?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  domain: string;
}

// 高度な住宅価格予測データセット
export const advancedHousingDataset: AdvancedProblemDataset = {
  id: 'advanced_housing',
  name: '高級住宅価格予測',
  description: '複雑な住宅データから価格を予測する高度な回帰問題',
  data: generateAdvancedHousingData(1500),
  featureNames: [
    '土地面積', '建物面積', '築年数', 'リノベーション年', '部屋数', 'バスルーム数', 
    'トイレ数', '階数', 'ガレージ台数', 'プール有無', '庭面積', '最寄り駅距離',
    '学校距離', '病院距離', '商業施設距離', '犯罪率', '人口密度', '平均所得',
    '交通利便性', '環境スコア', '日当たり', '騒音レベル', '景観スコア', 'セキュリティ',
    '地域', '建物構造', '築年数カテゴリ', 'リノベーション有無', '向き', '総階数',
    '角部屋', 'ペントハウス', 'マンション種別', '駐車場料金', '管理費', '修繕積立金'
  ],
  featureTypes: [
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'categorical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'numerical',
    'categorical', 'categorical', 'categorical', 'numerical', 'numerical', 'numerical'
  ],
  problemType: 'regression',
  targetName: '価格（万円）',
  difficulty: 'hard',
  domain: '不動産'
};

// 顧客生涯価値予測データセット
export const customerLifetimeValueDataset: AdvancedProblemDataset = {
  id: 'customer_lifetime_value',
  name: '顧客生涯価値予測',
  description: '顧客の行動パターンから生涯価値を予測する複雑な回帰問題',
  data: generateAdvancedCustomerData(1500),
  featureNames: [
    '年齢', '性別', '年収', '家族構成', '居住地', '職業', '教育レベル',
    '契約期間', '月額料金', 'サポート回数', '満足度', 'サービス利用数',
    'クレジットスコア', '過去の解約回数', '推奨回数', 'SNS活動度',
    '購買頻度', '平均購入額', 'カテゴリ多様性', '季節性', '時間帯偏り',
    'デバイス種類', '支払い方法', 'プロモーション反応率'
  ],
  featureTypes: [
    'numerical', 'categorical', 'numerical', 'categorical', 'categorical', 'categorical', 'categorical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'categorical', 'categorical', 'numerical'
  ],
  problemType: 'regression',
  targetName: '生涯価値（万円）',
  difficulty: 'hard',
  domain: 'マーケティング'
};

// 金融詐欺検出データセット
export const fraudDetectionDataset: AdvancedProblemDataset = {
  id: 'fraud_detection',
  name: '金融詐欺検出',
  description: '取引データから詐欺を検出する高度な分類問題',
  data: generateAdvancedFraudData(1500),
  featureNames: [
    '取引金額', '取引時間', '取引場所', '前回取引からの時間', '前回取引金額',
    '月間取引回数', '月間取引総額', '時間帯', '曜日', '季節', 'カード種類',
    '加盟店カテゴリ', '地理的距離', '異常度スコア', 'リスクスコア',
    '過去の拒否回数', '信用度', '年収', '職業', '居住期間', '家族構成',
    '過去の詐欺被害', '保険加入状況', '連絡先確認状況'
  ],
  featureTypes: [
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'categorical', 'categorical', 'categorical', 'categorical',
    'categorical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'categorical', 'numerical', 'categorical',
    'categorical', 'categorical', 'categorical'
  ],
  problemType: 'classification',
  targetName: '詐欺判定',
  classes: ['正常', '詐欺'],
  difficulty: 'hard',
  domain: '金融'
};

// 医療診断支援データセット
export const medicalDiagnosisDataset: AdvancedProblemDataset = {
  id: 'medical_diagnosis',
  name: '医療診断支援',
  description: '患者データから疾病を診断する複雑な分類問題',
  data: generateAdvancedMedicalData(1500),
  featureNames: [
    '年齢', '性別', '身長', '体重', 'BMI', '血圧（収縮期）', '血圧（拡張期）',
    '心拍数', '体温', '血糖値', 'コレステロール', 'ヘモグロビン', '白血球数',
    '赤血球数', '血小板数', '肝機能値', '腎機能値', '症状1', '症状2', '症状3',
    '症状4', '症状5', '症状6', '症状7', '症状8', '症状9', '症状10',
    '既往歴', '家族歴', '喫煙歴', '飲酒歴', '運動習慣', '睡眠時間', 'ストレス度'
  ],
  featureTypes: [
    'numerical', 'categorical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'categorical', 'categorical', 'categorical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'categorical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'numerical', 'categorical'
  ],
  problemType: 'classification',
  targetName: '診断結果',
  classes: ['健康', '軽症', '中症', '重症', '要入院'],
  difficulty: 'hard',
  domain: '医療'
};

// 株式市場予測データセット
export const stockMarketDataset: AdvancedProblemDataset = {
  id: 'stock_market_prediction',
  name: '株式市場予測',
  description: '複雑な市場データから株価を予測する高度な回帰問題',
  data: generateAdvancedStockData(1500),
  featureNames: [
    '前日終値', '前日高値', '前日安値', '前日出来高', '5日移動平均', '20日移動平均',
    '50日移動平均', '200日移動平均', 'RSI', 'MACD', 'ボリンジャーバンド上',
    'ボリンジャーバンド下', 'ストキャスティクス', 'CCI', 'Williams %R',
    '出来高移動平均', '価格変動率', 'ボラティリティ', '相対強度', 'モメンタム',
    '市場全体の動き', 'セクター動向', '金利', '為替', 'VIX', '金価格', '原油価格'
  ],
  featureTypes: [
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical'
  ],
  problemType: 'regression',
  targetName: '翌日終値',
  difficulty: 'hard',
  domain: '金融'
};

// 推薦システムデータセット
export const recommendationDataset: AdvancedProblemDataset = {
  id: 'recommendation_system',
  name: '推薦システム',
  description: 'ユーザー行動からアイテムを推薦する複雑な分類問題',
  data: generateAdvancedRecommendationData(1500),
  featureNames: [
    'ユーザー年齢', 'ユーザー性別', 'ユーザー職業', 'ユーザー収入', 'ユーザー居住地',
    'アイテムカテゴリ', 'アイテム価格', 'アイテム評価', 'アイテム人気度',
    '過去の購入履歴', '過去の評価履歴', '過去の閲覧履歴', 'セッション時間',
    'デバイス種類', '時間帯', '曜日', '季節', 'プロモーション有無',
    '在庫状況', '配送時間', 'レビュー数', 'レビュー平均点', '類似ユーザー評価',
    'アイテム類似度', 'ユーザー類似度', 'トレンド度', '新着度'
  ],
  featureTypes: [
    'numerical', 'categorical', 'categorical', 'numerical', 'categorical',
    'categorical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical',
    'categorical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical'
  ],
  problemType: 'classification',
  targetName: '推薦判定',
  classes: ['非推薦', '推薦'],
  difficulty: 'hard',
  domain: 'EC'
};

// データ生成関数
function generateAdvancedHousingData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 基本情報（常識的な範囲）
    const landArea = Math.random() * 400 + 60; // 60-460坪（約200-1500㎡）
    const buildingArea = Math.random() * 150 + 30; // 30-180坪（約100-600㎡）
    const age = Math.random() * 40 + 5; // 5-45年
    const renovation = Math.random() > 0.7 ? Math.random() * 15 + 5 : 0; // 30%の確率でリノベーション
    const rooms = Math.floor(Math.random() * 6) + 2; // 2-7部屋
    const bathrooms = Math.floor(Math.random() * 3) + 1; // 1-3バス
    const toilets = Math.floor(Math.random() * 3) + 1; // 1-3トイレ
    const floors = Math.floor(Math.random() * 3) + 1; // 1-3階
    const garage = Math.floor(Math.random() * 3); // 0-2台
    const poolOptions = ['なし', 'あり'];
    const pool = poolOptions[Math.random() > 0.9 ? 1 : 0]; // 10%の確率（高級住宅のみ）
    const poolEncoded = poolOptions.indexOf(pool);
    const garden = Math.random() * 80 + 10; // 10-90坪
    const stationDistance = Math.random() * 1500 + 100; // 100-1600m
    const schoolDistance = Math.random() * 800 + 200; // 200-1000m
    const hospitalDistance = Math.random() * 1500 + 300; // 300-1800m
    const commercialDistance = Math.random() * 800 + 200; // 200-1000m
    const crimeRate = Math.random() * 5 + 1; // 1-6（犯罪率は低い）
    const populationDensity = Math.random() * 8000 + 2000; // 2000-10000人/km²
    const averageIncome = Math.random() * 800 + 400; // 400-1200万円
    const transportAccess = Math.random() * 8 + 2; // 2-10（交通利便性）
    const environmentScore = Math.random() * 8 + 2; // 2-10（環境スコア）
    const sunlight = Math.random() * 8 + 2; // 2-10（日当たり）
    const noiseLevel = Math.random() * 6 + 1; // 1-7（騒音レベル）
    const viewScore = Math.random() * 8 + 2; // 2-10（景観スコア）
    const security = Math.random() * 8 + 2; // 2-10（セキュリティ）
    
    // カテゴリカル変数
    const regions = ['都心部', '郊外', '住宅街', '高級住宅地', '新興住宅地'];
    const buildingStructures = ['木造', '鉄骨造', 'RC造', 'SRC造'];
    const ageCategories = ['新築', '築浅', '中古', '古い'];
    const renovationStatus = ['リノベーション済み', 'リノベーションなし'];
    const directions = ['南', '南東', '南西', '東', '西', '北東', '北西', '北'];
    const cornerRoomOptions = ['なし', 'あり'];
    const cornerRoom = cornerRoomOptions[Math.random() > 0.7 ? 1 : 0]; // 30%の確率
    const cornerRoomEncoded = cornerRoomOptions.indexOf(cornerRoom);
    
    const penthouseOptions = ['なし', 'あり'];
    const penthouse = penthouseOptions[Math.random() > 0.95 ? 1 : 0]; // 5%の確率
    const penthouseEncoded = penthouseOptions.indexOf(penthouse);
    const mansionTypes = ['分譲マンション', '賃貸マンション', 'タワーマンション', '低層マンション'];
    
    const region = regions[Math.floor(Math.random() * regions.length)];
    const buildingStructure = buildingStructures[Math.floor(Math.random() * buildingStructures.length)];
    const ageCategory = age < 5 ? ageCategories[0] : age < 15 ? ageCategories[1] : age < 30 ? ageCategories[2] : ageCategories[3];
    const renovationStatusValue = renovation > 0 ? renovationStatus[0] : renovationStatus[1];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const mansionType = mansionTypes[Math.floor(Math.random() * mansionTypes.length)];
    
    // カテゴリカル変数を数値にエンコード
    const regionEncoded = regions.indexOf(region);
    const buildingStructureEncoded = buildingStructures.indexOf(buildingStructure);
    const ageCategoryEncoded = ageCategories.indexOf(ageCategory);
    const renovationStatusEncoded = renovationStatus.indexOf(renovationStatusValue);
    const directionEncoded = directions.indexOf(direction);
    const mansionTypeEncoded = mansionTypes.indexOf(mansionType);
    
    // 追加の数値特徴量
    const totalFloors = Math.floor(Math.random() * 20) + 1; // 1-20階
    const parkingFee = Math.random() * 50000 + 10000; // 1-6万円
    const managementFee = Math.random() * 30000 + 5000; // 0.5-3.5万円
    const repairReserve = Math.random() * 20000 + 5000; // 0.5-2.5万円

    // 価格計算（複雑な式）
    let price = landArea * 50 + buildingArea * 100;
    price += (50 - age) * 20; // 築年数による減価
    price += renovation * 10; // リノベーションによる加算
    price += rooms * 50; // 部屋数による加算
    price += bathrooms * 30; // バスルームによる加算
    price += garage * 20; // ガレージによる加算
    price += poolEncoded * 100; // プールによる加算
    price += garden * 5; // 庭による加算
    price -= stationDistance * 0.1; // 駅距離による減価
    price += (10 - crimeRate) * 10; // 犯罪率による減価
    price += averageIncome * 0.1; // 平均所得による加算
    price += transportAccess * 5; // 交通利便性による加算
    price += environmentScore * 10; // 環境スコアによる加算
    price += sunlight * 5; // 日当たりによる加算
    price -= noiseLevel * 2; // 騒音による減価
    price += viewScore * 8; // 景観による加算
    price += security * 5; // セキュリティによる加算
    
    // 地域による価格調整
    price *= (regionEncoded === 0 ? 1.5 : regionEncoded === 1 ? 0.8 : regionEncoded === 2 ? 1.0 : regionEncoded === 3 ? 1.3 : 1.1);
    
    // 建物構造による価格調整
    price *= (buildingStructureEncoded === 0 ? 0.7 : buildingStructureEncoded === 1 ? 0.9 : buildingStructureEncoded === 2 ? 1.2 : 1.4);

    // ノイズを追加
    price += (Math.random() - 0.5) * price * 0.2;

    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.15) { // 15%の確率で欠損値あり
      // 築年数が古い場合、リノベーション年が欠損しやすい
      if (age > 30 && Math.random() < 0.8) {
        missingIndices.push(3); // リノベーション年
      }
      
      // 高級住宅でない場合、プール情報が欠損しやすい
      if (price < 5000 && Math.random() < 0.6) {
        missingIndices.push(9); // プール有無
      }
      
      // 郊外の場合、商業施設距離が欠損しやすい
      if (regionEncoded === 1 && Math.random() < 0.7) {
        missingIndices.push(14); // 商業施設距離
      }
      
      // 古い建物の場合、セキュリティ情報が欠損しやすい
      if (age > 20 && Math.random() < 0.5) {
        missingIndices.push(23); // セキュリティ
      }
      
      // 低価格帯の場合、管理費情報が欠損しやすい
      if (price < 3000 && Math.random() < 0.4) {
        missingIndices.push(34); // 管理費
      }
    }

    // 特徴量配列を作成（カテゴリカル変数は文字列、数値変数は数値、欠損値はNaN）
    const features = [
      landArea, buildingArea, age, renovation, rooms, bathrooms, toilets, floors,
      garage, pool, garden, stationDistance, schoolDistance, hospitalDistance,
      commercialDistance, crimeRate, populationDensity, averageIncome,
      transportAccess, environmentScore, sunlight, noiseLevel, viewScore, security,
      region, buildingStructure, ageCategory, renovationStatus,
      direction, totalFloors, cornerRoom, penthouse, mansionType,
      parkingFee, managementFee, repairReserve
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: Math.max(0, Math.round(price))
    });
  }
  return data;
}

function generateAdvancedCustomerData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 年齢: 整数で現実的な分布
    const age = Math.random() < 0.4 ? Math.floor(Math.random() * 30) + 20 : // 40%が20-49歳
                Math.random() < 0.8 ? Math.floor(Math.random() * 30) + 50 : // 40%が50-79歳
                Math.floor(Math.random() * 20) + 80; // 20%が80-99歳
    
    // 性別: カテゴリカル変数として適切に処理
    const genders = ['男性', '女性'];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const genderEncoded = genders.indexOf(gender);
    
    // 年収: 整数で現実的な分布（万円単位）
    const income = Math.random() < 0.6 ? 
      Math.floor(Math.random() * 500) + 300 : // 60%が300-799万円
      Math.floor(Math.random() * 1200) + 800; // 40%が800-1999万円
    
    // 家族構成: カテゴリカル変数として適切に処理
    const familySizes = ['1人', '2人', '3人', '4人', '5人以上'];
    const familySize = familySizes[Math.floor(Math.random() * familySizes.length)];
    const familySizeEncoded = familySizes.indexOf(familySize);
    
    // 居住地: カテゴリカル変数として適切に処理
    const residences = ['東京都', '大阪府', '神奈川県', '愛知県', '埼玉県', '千葉県', '兵庫県', '福岡県', '北海道', 'その他'];
    const residence = residences[Math.floor(Math.random() * residences.length)];
    const residenceEncoded = residences.indexOf(residence);
    
    // 職業: カテゴリカル変数として適切に処理
    const occupations = ['会社員', '自営業', '公務員', '学生', '主婦', 'フリーランス', 'その他'];
    const occupation = occupations[Math.floor(Math.random() * occupations.length)];
    const occupationEncoded = occupations.indexOf(occupation);
    
    // 教育レベル: カテゴリカル変数として適切に処理
    const educationLevels = ['高校卒', '専門学校卒', '大学卒', '大学院卒', 'その他'];
    const education = educationLevels[Math.floor(Math.random() * educationLevels.length)];
    const educationEncoded = educationLevels.indexOf(education);
    
    // 契約期間: 整数で現実的な分布（月単位）
    const contractPeriod = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 24) + 1 : // 70%が1-24ヶ月
      Math.floor(Math.random() * 36) + 24; // 30%が24-59ヶ月
    
    const monthlyFee = Math.floor(Math.random() * 30000) + 2000; // 2000-31999円
    const supportCount = Math.floor(Math.random() * 16); // 0-15回
    const satisfaction = Math.floor(Math.random() * 11); // 0-10
    const serviceCount = Math.floor(Math.random() * 8) + 1; // 1-8サービス
    const creditScore = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 200) + 600 : // 70%が600-799
      Math.floor(Math.random() * 400) + 200; // 30%が200-599
    const pastCancellations = Math.random() < 0.8 ? 
      Math.floor(Math.random() * 2) : // 80%が0-1回
      Math.floor(Math.random() * 3) + 2; // 20%が2-4回
    const referrals = Math.floor(Math.random() * 8); // 0-7回
    const socialActivity = Math.floor(Math.random() * 11); // 0-10
    const purchaseFrequency = Math.floor(Math.random() * 21); // 0-20回/月
    const averagePurchase = Math.floor(Math.random() * 50000) + 5000; // 5000-54999円
    const categoryDiversity = Math.floor(Math.random() * 11); // 0-10
    const seasonality = Math.floor(Math.random() * 11); // 0-10
    const timeBias = Math.floor(Math.random() * 11); // 0-10
    
    // デバイス種類: カテゴリカル変数として適切に処理
    const deviceTypes = ['PC', 'スマートフォン', 'タブレット', 'その他'];
    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    const deviceTypeEncoded = deviceTypes.indexOf(deviceType);
    
    // 支払い方法: カテゴリカル変数として適切に処理
    const paymentMethods = ['現金', 'クレジットカード', 'デビットカード', '電子マネー', 'その他'];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const paymentMethodEncoded = paymentMethods.indexOf(paymentMethod);
    
    const promotionResponse = Math.random() * 10; // 0-10
    
    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.12) { // 12%の確率で欠損値あり
      // 学生の場合、年収情報が欠損しやすい
      if (occupation === '学生' && Math.random() < 0.8) {
        missingIndices.push(2); // 年収
      }
      
      // 高齢者の場合、SNS活動度が欠損しやすい
      if (age > 65 && Math.random() < 0.7) {
        missingIndices.push(15); // SNS活動度
      }
      
      // 短期契約の場合、推奨回数が欠損しやすい
      if (contractPeriod < 6 && Math.random() < 0.6) {
        missingIndices.push(14); // 推奨回数
      }
      
      // 低満足度の場合、サポート回数が欠損しやすい
      if (satisfaction < 3 && Math.random() < 0.5) {
        missingIndices.push(9); // サポート回数
      }
      
      // 新規顧客の場合、過去の解約回数が欠損しやすい
      if (contractPeriod < 3 && Math.random() < 0.4) {
        missingIndices.push(13); // 過去の解約回数
      }
    }

    // 生涯価値計算（より現実的なロジック）
    let lifetimeValue = income * 0.05; // 基本価値（年収の5%）
    lifetimeValue += satisfaction * 500; // 満足度による加算
    lifetimeValue += serviceCount * 300; // サービス数による加算
    lifetimeValue += contractPeriod * 50; // 契約期間による加算
    lifetimeValue += referrals * 1000; // 推奨による加算
    lifetimeValue += purchaseFrequency * 50; // 購買頻度による加算
    lifetimeValue += averagePurchase * 0.05; // 平均購入額による加算
    lifetimeValue -= pastCancellations * 2000; // 解約による減価
    lifetimeValue += creditScore * 5; // クレジットスコアによる加算
    lifetimeValue += socialActivity * 200; // SNS活動による加算
    
    // 職業による調整
    if (occupation === '会社員') lifetimeValue *= 1.2;
    if (occupation === '自営業') lifetimeValue *= 1.1;
    if (occupation === '学生') lifetimeValue *= 0.5;
    
    // 年齢による調整
    if (age > 60) lifetimeValue *= 0.8;
    if (age < 30) lifetimeValue *= 1.1;

    // ノイズを追加
    lifetimeValue += (Math.random() - 0.5) * lifetimeValue * 0.2;

    // 特徴量配列を作成
    const features = [
      age, gender, income, familySize, residence, occupation, education,
      contractPeriod, monthlyFee, supportCount, satisfaction, serviceCount,
      creditScore, pastCancellations, referrals, socialActivity, purchaseFrequency,
      averagePurchase, categoryDiversity, seasonality, timeBias, deviceType,
      paymentMethod, promotionResponse
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: Math.max(0, Math.round(lifetimeValue))
    });
  }
  return data;
}

function generateAdvancedFraudData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 取引金額: 整数で現実的な分布（小額取引が多い）
    const amount = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 50000) + 1000 : // 70%が1-49999円
      Math.floor(Math.random() * 200000) + 50000; // 30%が5-249999円
    
    // 取引時間: 0-24時間の範囲で適切に（小数点あり）
    const time = Math.random() * 24; // 0-24時
    
    // 取引場所: 0-100のスコア（整数）
    const location = Math.floor(Math.random() * 101); // 0-100（場所スコア）
    
    // 前回取引からの時間: 整数で現実的な分布（分単位）
    const timeSinceLast = Math.random() < 0.6 ? 
      Math.floor(Math.random() * 60) + 1 : // 60%が1-60分
      Math.floor(Math.random() * 1440) + 60; // 40%が60-1499分
    
    // 前回取引金額: 現在の取引金額と相関（整数）
    const lastAmount = Math.floor(amount * (0.8 + Math.random() * 0.4)); // 現在の80-120%
    
    // 月間取引回数: 整数で現実的な分布
    const monthlyTransactions = Math.random() < 0.5 ? 
      Math.floor(Math.random() * 20) + 1 : // 50%が1-20回
      Math.floor(Math.random() * 30) + 20; // 50%が20-49回
    
    // 月間取引総額: 取引回数と相関（整数）
    const monthlyAmount = Math.floor(monthlyTransactions * (amount * (0.5 + Math.random() * 1.0)));
    
    // 時間帯: カテゴリカル変数として適切に処理
    const timePeriods = ['深夜', '早朝', '朝', '昼', '夕方', '夜'];
    const timePeriod = timePeriods[Math.floor(Math.random() * timePeriods.length)];
    const timePeriodEncoded = timePeriods.indexOf(timePeriod);
    
    // 曜日: カテゴリカル変数として適切に処理
    const daysOfWeek = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];
    const dayOfWeek = daysOfWeek[Math.floor(Math.random() * daysOfWeek.length)];
    const dayOfWeekEncoded = daysOfWeek.indexOf(dayOfWeek);
    
    // 季節: カテゴリカル変数として適切に処理
    const seasons = ['春', '夏', '秋', '冬'];
    const season = seasons[Math.floor(Math.random() * seasons.length)];
    const seasonEncoded = seasons.indexOf(season);
    
    // カード種類: カテゴリカル変数として適切に処理
    const cardTypes = ['クレジットカード', 'デビットカード', 'プリペイドカード', '電子マネー', 'その他'];
    const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    const cardTypeEncoded = cardTypes.indexOf(cardType);
    
    // 加盟店カテゴリ: カテゴリカル変数として適切に処理
    const merchantCategories = ['小売店', 'レストラン', 'ガソリンスタンド', 'オンライン', '交通機関', '医療', '娯楽', 'その他'];
    const merchantCategory = merchantCategories[Math.floor(Math.random() * merchantCategories.length)];
    const merchantCategoryEncoded = merchantCategories.indexOf(merchantCategory);
    
    // 地理的距離: より現実的な分布
    const geoDistance = Math.random() < 0.8 ? 
      Math.random() * 50 + 1 : // 80%が1-50km
      Math.random() * 950 + 50; // 20%が50-1000km
    
    // 異常度スコア: 0-10の範囲で適切に
    const anomalyScore = Math.random() * 10; // 0-10
    
    // リスクスコア: 0-10の範囲で適切に
    const riskScore = Math.random() * 10; // 0-10
    
    // 過去の拒否回数: より現実的な分布
    const pastRejections = Math.random() < 0.9 ? 
      Math.floor(Math.random() * 3) : // 90%が0-2回
      Math.floor(Math.random() * 7) + 3; // 10%が3-9回
    
    // 信用度: 整数で現実的な分布
    const creditScore = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 200) + 600 : // 70%が600-799
      Math.floor(Math.random() * 400) + 200; // 30%が200-599
    
    // 年収: 整数で現実的な分布（万円単位）
    const income = Math.random() < 0.6 ? 
      Math.floor(Math.random() * 500) + 300 : // 60%が300-799万円
      Math.floor(Math.random() * 1200) + 800; // 40%が800-1999万円
    
    // 職業: カテゴリカル変数として適切に処理
    const occupations = ['会社員', '自営業', '公務員', '学生', '主婦', 'フリーランス', 'その他'];
    const occupation = occupations[Math.floor(Math.random() * occupations.length)];
    const occupationEncoded = occupations.indexOf(occupation);
    
    // 居住期間: 整数で現実的な分布（年単位）
    const residencePeriod = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 10) + 1 : // 70%が1-10年
      Math.floor(Math.random() * 20) + 10; // 30%が10-29年
    
    // 家族構成: カテゴリカル変数として適切に処理
    const familySizes = ['1人', '2人', '3人', '4人', '5人以上'];
    const familySize = familySizes[Math.floor(Math.random() * familySizes.length)];
    const familySizeEncoded = familySizes.indexOf(familySize);
    
    // 過去の詐欺被害: カテゴリカル変数として適切に処理
    const pastFraudOptions = ['なし', 'あり'];
    const pastFraud = pastFraudOptions[Math.random() > 0.95 ? 1 : 0]; // 5%の確率
    const pastFraudEncoded = pastFraudOptions.indexOf(pastFraud);
    
    // 保険加入状況: カテゴリカル変数として適切に処理
    const insuranceOptions = ['未加入', '加入'];
    const insurance = insuranceOptions[Math.random() > 0.3 ? 1 : 0]; // 70%の確率
    const insuranceEncoded = insuranceOptions.indexOf(insurance);
    
    // 連絡先確認状況: カテゴリカル変数として適切に処理
    const contactOptions = ['未確認', '確認済み'];
    const contactVerified = contactOptions[Math.random() > 0.2 ? 1 : 0]; // 80%の確率
    const contactVerifiedEncoded = contactOptions.indexOf(contactVerified);
    
    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.08) { // 8%の確率で欠損値あり
      // 小額取引の場合、地理的距離が欠損しやすい
      if (amount < 10000 && Math.random() < 0.6) {
        missingIndices.push(12); // 地理的距離
      }
      
      // 深夜の取引の場合、加盟店カテゴリが欠損しやすい
      if (time < 6 || time > 22) {
        if (Math.random() < 0.5) {
          missingIndices.push(11); // 加盟店カテゴリ
        }
      }
      
      // 新規カードの場合、過去の拒否回数が欠損しやすい
      if (creditScore > 700 && Math.random() < 0.7) {
        missingIndices.push(15); // 過去の拒否回数
      }
      
      // 高齢者の場合、SNS活動度が欠損しやすい
      if (Math.random() < 0.3) {
        missingIndices.push(19); // デバイス種類
      }
    }

    // 詐欺判定ロジック（より現実的なロジック）
    let isFraud = 0;
    if (amount > 100000) isFraud += 0.2; // 高額取引（10万円以上）
    if (time < 6 || time > 22) isFraud += 0.3; // 深夜・早朝
    if (geoDistance > 200) isFraud += 0.4; // 遠距離（200km以上）
    if (anomalyScore > 7) isFraud += 0.5; // 異常度
    if (riskScore > 8) isFraud += 0.4; // リスクスコア
    if (pastRejections > 2) isFraud += 0.3; // 過去の拒否
    if (creditScore < 400) isFraud += 0.3; // 低クレジット
    if (pastFraud === 'あり') isFraud += 0.6; // 過去の詐欺
    if (contactVerified === '未確認') isFraud += 0.2; // 連絡先未確認
    if (timeSinceLast < 5) isFraud += 0.3; // 短時間での連続取引

    // ランダム要素を追加
    isFraud += (Math.random() - 0.5) * 0.2;

    // 特徴量配列を作成
    const features = [
      amount, time, location, timeSinceLast, lastAmount, monthlyTransactions,
      monthlyAmount, timePeriod, dayOfWeek, season, cardType, merchantCategory,
      geoDistance, anomalyScore, riskScore, pastRejections, creditScore,
      income, occupation, residencePeriod, familySize, pastFraud, insurance,
      contactVerified
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: isFraud > 0.5 ? 1 : 0
    });
  }
  return data;
}

function generateAdvancedMedicalData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 年齢: 整数で現実的な分布（若年層が多い）
    const age = Math.random() < 0.3 ? Math.floor(Math.random() * 30) + 20 : // 30%が20-49歳
                Math.random() < 0.6 ? Math.floor(Math.random() * 30) + 50 : // 30%が50-79歳
                Math.floor(Math.random() * 20) + 80; // 40%が80-99歳
    
    // 性別: カテゴリカル変数として適切に処理
    const genders = ['男性', '女性'];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const genderEncoded = genders.indexOf(gender);
    
    // 身長・体重: 性別に応じた現実的な値（整数）
    const isMale = gender === '男性';
    const height = isMale ? 
      Math.floor(Math.random() * 20) + 160 : // 男性: 160-179cm
      Math.floor(Math.random() * 20) + 150;  // 女性: 150-169cm
    const weight = isMale ?
      Math.floor(Math.random() * 30) + 60 :  // 男性: 60-89kg
      Math.floor(Math.random() * 25) + 45;   // 女性: 45-69kg
    
    const bmi = Math.round((weight / ((height / 100) ** 2)) * 10) / 10; // 小数点第1位まで
    
    // 血圧: 整数で現実的な分布（異常値も含む）
    const systolicBP = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 20) + 110 : // 70%が正常範囲
      Math.floor(Math.random() * 40) + 130;  // 30%が異常値
    const diastolicBP = Math.random() < 0.7 ?
      Math.floor(Math.random() * 15) + 70 :  // 70%が正常範囲
      Math.floor(Math.random() * 25) + 85;   // 30%が異常値
    
    const heartRate = Math.floor(Math.random() * 40) + 60; // 60-99bpm
    const temperature = Math.random() < 0.9 ?
      Math.round((Math.random() * 0.5 + 36.5) * 10) / 10 : // 90%が正常（小数点第1位）
      Math.round((Math.random() * 1.5 + 37.5) * 10) / 10;  // 10%が発熱（小数点第1位）
    
    // 検査値: 整数で現実的な分布
    const bloodSugar = Math.random() < 0.8 ?
      Math.floor(Math.random() * 40) + 80 :   // 80%が正常
      Math.floor(Math.random() * 100) + 120;  // 20%が異常
    const cholesterol = Math.random() < 0.6 ?
      Math.floor(Math.random() * 50) + 150 :  // 60%が正常
      Math.floor(Math.random() * 100) + 200;  // 40%が異常
    
    const hemoglobin = Math.round((Math.random() * 3 + 11) * 10) / 10; // 11-14g/dL（小数点第1位）
    const whiteBloodCells = Math.floor(Math.random() * 4000) + 5000; // 5000-8999/μL
    const redBloodCells = Math.round((Math.random() * 1 + 4.5) * 100) / 100; // 4.5-5.5M/μL（小数点第2位）
    const platelets = Math.floor(Math.random() * 100000) + 200000; // 200000-299999/μL
    const liverFunction = Math.floor(Math.random() * 50) + 30; // 30-79
    const kidneyFunction = Math.floor(Math.random() * 50) + 30; // 30-79
    
    // 症状: カテゴリカル変数として適切に処理
    const symptomOptions = ['なし', 'あり'];
    const symptoms = [
      symptomOptions[Math.random() > 0.8 ? 1 : 0], // 症状1: 20%の確率
      symptomOptions[Math.random() > 0.9 ? 1 : 0], // 症状2: 10%の確率
      symptomOptions[Math.random() > 0.7 ? 1 : 0], // 症状3: 30%の確率
      symptomOptions[Math.random() > 0.85 ? 1 : 0], // 症状4: 15%の確率
      symptomOptions[Math.random() > 0.75 ? 1 : 0], // 症状5: 25%の確率
      symptomOptions[Math.random() > 0.9 ? 1 : 0], // 症状6: 10%の確率
      symptomOptions[Math.random() > 0.8 ? 1 : 0], // 症状7: 20%の確率
      symptomOptions[Math.random() > 0.85 ? 1 : 0], // 症状8: 15%の確率
      symptomOptions[Math.random() > 0.7 ? 1 : 0], // 症状9: 30%の確率
      symptomOptions[Math.random() > 0.9 ? 1 : 0]  // 症状10: 10%の確率
    ];
    const symptomsEncoded = symptoms.map(s => symptomOptions.indexOf(s));
    
    // 生活習慣: カテゴリカル変数として適切に処理
    const historyLevels = ['なし', '軽度', '中程度', '重度', '非常に重度'];
    const medicalHistory = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const medicalHistoryEncoded = historyLevels.indexOf(medicalHistory);
    
    const familyHistory = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const familyHistoryEncoded = historyLevels.indexOf(familyHistory);
    
    const smoking = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const smokingEncoded = historyLevels.indexOf(smoking);
    
    const drinking = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const drinkingEncoded = historyLevels.indexOf(drinking);
    
    const exercise = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const exerciseEncoded = historyLevels.indexOf(exercise);
    
    const sleep = Math.floor(Math.random() * 4) + 6; // 6-9時間（整数）
    
    const stressLevels = ['なし', '軽度', '中程度', '重度', '非常に重度'];
    const stress = stressLevels[Math.floor(Math.random() * stressLevels.length)];
    const stressEncoded = stressLevels.indexOf(stress);
    
    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.18) { // 18%の確率で欠損値あり
      // 若年者の場合、既往歴が欠損しやすい
      if (age < 30 && Math.random() < 0.6) {
        missingIndices.push(27); // 既往歴
      }
      
      // 高齢者の場合、家族歴が欠損しやすい
      if (age > 70 && Math.random() < 0.5) {
        missingIndices.push(28); // 家族歴
      }
      
      // 健康な人の場合、症状情報が欠損しやすい
      if (bmi >= 18.5 && bmi <= 25 && systolicBP < 120 && diastolicBP < 80) {
        if (Math.random() < 0.7) {
          // 症状1-10のうちランダムに1-3個を欠損
          const symptomIndices = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
          const numMissing = Math.floor(Math.random() * 3) + 1;
          const shuffled = symptomIndices.sort(() => 0.5 - Math.random());
          missingIndices.push(...shuffled.slice(0, numMissing));
        }
      }
      
      // 緊急事態の場合、生活習慣情報が欠損しやすい
      if (temperature > 38 || systolicBP > 180 || diastolicBP > 110) {
        if (Math.random() < 0.8) {
          missingIndices.push(30); // 喫煙歴
          missingIndices.push(31); // 飲酒歴
          missingIndices.push(32); // 運動習慣
        }
      }
      
      // 低所得者の場合、詳細な検査値が欠損しやすい
      if (Math.random() < 0.4) {
        missingIndices.push(10); // 血糖値
        missingIndices.push(11); // コレステロール
      }
    }

    // 診断結果判定（より現実的なロジック）
    let diagnosis = 0; // 0: 健康, 1: 軽症, 2: 中症, 3: 重症, 4: 要入院
    
    // 年齢による基本リスク
    if (age > 70) diagnosis += 1;
    if (age > 85) diagnosis += 1;
    
    // 検査値による判定
    if (bmi > 30 || bmi < 18.5) diagnosis += 1; // BMI異常
    if (systolicBP > 140 || diastolicBP > 90) diagnosis += 1; // 高血圧
    if (bloodSugar > 126) diagnosis += 2; // 糖尿病
    if (cholesterol > 240) diagnosis += 1; // 高コレステロール
    if (temperature > 37.5) diagnosis += 1; // 発熱
    if (heartRate > 100 || heartRate < 50) diagnosis += 1; // 心拍数異常
    
    // 症状による判定
    const symptomCount = symptomsEncoded.filter(s => s === 1).length;
    if (symptomCount > 3) diagnosis += 1;
    if (symptomCount > 6) diagnosis += 1;
    
    // 生活習慣による判定
    if (medicalHistoryEncoded > 2) diagnosis += 1; // 既往歴（中程度以上）
    if (familyHistoryEncoded > 2) diagnosis += 1; // 家族歴（中程度以上）
    if (smokingEncoded > 2) diagnosis += 1; // 喫煙（中程度以上）
    if (stressEncoded > 3) diagnosis += 1; // 高ストレス（重度以上）
    if (sleep < 6 || sleep > 9) diagnosis += 1; // 睡眠異常

    // ランダム要素を追加
    diagnosis += Math.floor(Math.random() * 3) - 1;
    diagnosis = Math.max(0, Math.min(4, diagnosis));

    // 特徴量配列を作成
    const features = [
      age, gender, height, weight, bmi, systolicBP, diastolicBP, heartRate,
      temperature, bloodSugar, cholesterol, hemoglobin, whiteBloodCells,
      redBloodCells, platelets, liverFunction, kidneyFunction, ...symptoms,
      medicalHistory, familyHistory, smoking, drinking, exercise, sleep, stress
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: diagnosis
    });
  }
  return data;
}

function generateAdvancedStockData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  let basePrice = 1000; // 基準価格

  for (let i = 0; i < count; i++) {
    // 価格変動をシミュレート
    const change = (Math.random() - 0.5) * 0.1; // -5% to +5%
    basePrice *= (1 + change);
    
    const prevClose = basePrice;
    const prevHigh = prevClose * (1 + Math.random() * 0.05);
    const prevLow = prevClose * (1 - Math.random() * 0.05);
    const volume = Math.random() * 1000000 + 100000;
    const ma5 = prevClose * (1 + (Math.random() - 0.5) * 0.02);
    const ma20 = prevClose * (1 + (Math.random() - 0.5) * 0.05);
    const ma50 = prevClose * (1 + (Math.random() - 0.5) * 0.1);
    const ma200 = prevClose * (1 + (Math.random() - 0.5) * 0.2);
    const rsi = Math.random() * 100;
    const macd = (Math.random() - 0.5) * 10;
    const bbUpper = prevClose * (1 + Math.random() * 0.1);
    const bbLower = prevClose * (1 - Math.random() * 0.1);
    const stoch = Math.random() * 100;
    const cci = (Math.random() - 0.5) * 200;
    const williams = (Math.random() - 0.5) * 100;
    const volumeMA = volume * (1 + (Math.random() - 0.5) * 0.2);
    const priceChange = (Math.random() - 0.5) * 0.1;
    const volatility = Math.random() * 0.5;
    const relativeStrength = Math.random() * 10;
    const momentum = (Math.random() - 0.5) * 20;
    const marketMovement = (Math.random() - 0.5) * 0.1;
    const sectorTrend = (Math.random() - 0.5) * 0.1;
    const interestRate = Math.random() * 5 + 1;
    const exchangeRate = Math.random() * 50 + 100;
    const vix = Math.random() * 50 + 10;
    const goldPrice = Math.random() * 1000 + 1500;
    const oilPrice = Math.random() * 50 + 50;

    // 翌日終値予測（簡略化）
    let nextClose = prevClose;
    nextClose += (ma5 - prevClose) * 0.1;
    nextClose += (ma20 - prevClose) * 0.05;
    nextClose += (rsi - 50) * 0.01;
    nextClose += macd * 0.1;
    nextClose += marketMovement * prevClose;
    nextClose += sectorTrend * prevClose;
    nextClose += (Math.random() - 0.5) * prevClose * 0.02; // ランダム要素

    data.push({
      features: [
        prevClose, prevHigh, prevLow, volume, ma5, ma20, ma50, ma200,
        rsi, macd, bbUpper, bbLower, stoch, cci, williams, volumeMA,
        priceChange, volatility, relativeStrength, momentum, marketMovement,
        sectorTrend, interestRate, exchangeRate, vix, goldPrice, oilPrice
      ],
      label: Math.max(0, nextClose)
    });
  }
  return data;
}

function generateAdvancedRecommendationData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    const userAge = Math.random() * 60 + 18; // 18-78歳
    const userGender = Math.random() > 0.5 ? 1 : 0; // 0: 女性, 1: 男性
    const userOccupation = Math.random() * 10; // 0-10
    const userIncome = Math.random() * 2000 + 200; // 200-2200万円
    const userLocation = Math.random() * 10; // 0-10
    const itemCategory = Math.random() * 20; // 0-20
    const itemPrice = Math.random() * 100000 + 1000; // 1000-101000円
    const itemRating = Math.random() * 5; // 0-5
    const itemPopularity = Math.random() * 10; // 0-10
    const purchaseHistory = Math.random() * 100; // 0-100回
    const ratingHistory = Math.random() * 50; // 0-50回
    const viewHistory = Math.random() * 200; // 0-200回
    const sessionTime = Math.random() * 3600; // 0-3600秒
    const deviceType = Math.random() * 3; // 0-3
    const timeOfDay = Math.random() * 24; // 0-24時
    const dayOfWeek = Math.random() * 7; // 0-7日
    const season = Math.random() * 4; // 0-4季節
    const hasPromotion = Math.random() > 0.5 ? 1 : 0; // 50%の確率
    const stockStatus = Math.random() * 10; // 0-10
    const deliveryTime = Math.random() * 7; // 0-7日
    const reviewCount = Math.floor(Math.random() * 1000); // 0-999回
    const reviewAverage = Math.random() * 5; // 0-5
    const similarUserRating = Math.random() * 5; // 0-5
    const itemSimilarity = Math.random() * 10; // 0-10
    const userSimilarity = Math.random() * 10; // 0-10
    const trendScore = Math.random() * 10; // 0-10
    const noveltyScore = Math.random() * 10; // 0-10

    // 推薦判定ロジック
    let recommendation = 0; // 0: 非推薦, 1: 推薦
    if (itemRating > 4) recommendation += 0.3; // 高評価
    if (itemPopularity > 7) recommendation += 0.2; // 人気
    if (purchaseHistory > 50) recommendation += 0.2; // 購買履歴
    if (ratingHistory > 20) recommendation += 0.1; // 評価履歴
    if (sessionTime > 1800) recommendation += 0.1; // 長時間セッション
    if (similarUserRating > 4) recommendation += 0.2; // 類似ユーザー評価
    if (itemSimilarity > 7) recommendation += 0.3; // アイテム類似度
    if (userSimilarity > 7) recommendation += 0.2; // ユーザー類似度
    if (trendScore > 7) recommendation += 0.1; // トレンド
    if (hasPromotion) recommendation += 0.1; // プロモーション

    // ランダム要素を追加
    recommendation += (Math.random() - 0.5) * 0.2;

    data.push({
      features: [
        userAge, userGender, userOccupation, userIncome, userLocation,
        itemCategory, itemPrice, itemRating, itemPopularity, purchaseHistory,
        ratingHistory, viewHistory, sessionTime, deviceType, timeOfDay,
        dayOfWeek, season, hasPromotion, stockStatus, deliveryTime,
        reviewCount, reviewAverage, similarUserRating, itemSimilarity,
        userSimilarity, trendScore, noveltyScore
      ],
      label: recommendation > 0.5 ? 1 : 0
    });
  }
  return data;
}

// ランダムにデータセットを取得
export function getRandomAdvancedProblemDataset(): AdvancedProblemDataset {
  const datasets = [
    advancedHousingDataset,
    customerLifetimeValueDataset,
    fraudDetectionDataset,
    medicalDiagnosisDataset,
    stockMarketDataset,
    recommendationDataset
  ];
  
  const randomIndex = Math.floor(Math.random() * datasets.length);
  return datasets[randomIndex];
}

export interface AdvancedProblemDataset {
  id: string;
  name: string;
  description: string;
  data: { features: (number | string)[]; label: number | string }[]; // カテゴリカル変数は文字列として格納
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[]; // 特徴量のタイプ
  problemType: 'classification' | 'regression';
  targetName: string;
  classes?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  domain: string;
}

// 高度な住宅価格予測データセット
export const advancedHousingDataset: AdvancedProblemDataset = {
  id: 'advanced_housing',
  name: '高級住宅価格予測',
  description: '複雑な住宅データから価格を予測する高度な回帰問題',
  data: generateAdvancedHousingData(1500),
  featureNames: [
    '土地面積', '建物面積', '築年数', 'リノベーション年', '部屋数', 'バスルーム数', 
    'トイレ数', '階数', 'ガレージ台数', 'プール有無', '庭面積', '最寄り駅距離',
    '学校距離', '病院距離', '商業施設距離', '犯罪率', '人口密度', '平均所得',
    '交通利便性', '環境スコア', '日当たり', '騒音レベル', '景観スコア', 'セキュリティ',
    '地域', '建物構造', '築年数カテゴリ', 'リノベーション有無', '向き', '総階数',
    '角部屋', 'ペントハウス', 'マンション種別', '駐車場料金', '管理費', '修繕積立金'
  ],
  featureTypes: [
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'categorical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'numerical',
    'categorical', 'categorical', 'categorical', 'numerical', 'numerical', 'numerical'
  ],
  problemType: 'regression',
  targetName: '価格（万円）',
  difficulty: 'hard',
  domain: '不動産'
};

// 顧客生涯価値予測データセット
export const customerLifetimeValueDataset: AdvancedProblemDataset = {
  id: 'customer_lifetime_value',
  name: '顧客生涯価値予測',
  description: '顧客の行動パターンから生涯価値を予測する複雑な回帰問題',
  data: generateAdvancedCustomerData(1500),
  featureNames: [
    '年齢', '性別', '年収', '家族構成', '居住地', '職業', '教育レベル',
    '契約期間', '月額料金', 'サポート回数', '満足度', 'サービス利用数',
    'クレジットスコア', '過去の解約回数', '推奨回数', 'SNS活動度',
    '購買頻度', '平均購入額', 'カテゴリ多様性', '季節性', '時間帯偏り',
    'デバイス種類', '支払い方法', 'プロモーション反応率'
  ],
  featureTypes: [
    'numerical', 'categorical', 'numerical', 'categorical', 'categorical', 'categorical', 'categorical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'categorical', 'categorical', 'numerical'
  ],
  problemType: 'regression',
  targetName: '生涯価値（万円）',
  difficulty: 'hard',
  domain: 'マーケティング'
};

// 金融詐欺検出データセット
export const fraudDetectionDataset: AdvancedProblemDataset = {
  id: 'fraud_detection',
  name: '金融詐欺検出',
  description: '取引データから詐欺を検出する高度な分類問題',
  data: generateAdvancedFraudData(1500),
  featureNames: [
    '取引金額', '取引時間', '取引場所', '前回取引からの時間', '前回取引金額',
    '月間取引回数', '月間取引総額', '時間帯', '曜日', '季節', 'カード種類',
    '加盟店カテゴリ', '地理的距離', '異常度スコア', 'リスクスコア',
    '過去の拒否回数', '信用度', '年収', '職業', '居住期間', '家族構成',
    '過去の詐欺被害', '保険加入状況', '連絡先確認状況'
  ],
  featureTypes: [
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'categorical', 'categorical', 'categorical', 'categorical',
    'categorical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'categorical', 'numerical', 'categorical',
    'categorical', 'categorical', 'categorical'
  ],
  problemType: 'classification',
  targetName: '詐欺判定',
  classes: ['正常', '詐欺'],
  difficulty: 'hard',
  domain: '金融'
};

// 医療診断支援データセット
export const medicalDiagnosisDataset: AdvancedProblemDataset = {
  id: 'medical_diagnosis',
  name: '医療診断支援',
  description: '患者データから疾病を診断する複雑な分類問題',
  data: generateAdvancedMedicalData(1500),
  featureNames: [
    '年齢', '性別', '身長', '体重', 'BMI', '血圧（収縮期）', '血圧（拡張期）',
    '心拍数', '体温', '血糖値', 'コレステロール', 'ヘモグロビン', '白血球数',
    '赤血球数', '血小板数', '肝機能値', '腎機能値', '症状1', '症状2', '症状3',
    '症状4', '症状5', '症状6', '症状7', '症状8', '症状9', '症状10',
    '既往歴', '家族歴', '喫煙歴', '飲酒歴', '運動習慣', '睡眠時間', 'ストレス度'
  ],
  featureTypes: [
    'numerical', 'categorical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'categorical', 'categorical', 'categorical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'categorical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'numerical', 'categorical'
  ],
  problemType: 'classification',
  targetName: '診断結果',
  classes: ['健康', '軽症', '中症', '重症', '要入院'],
  difficulty: 'hard',
  domain: '医療'
};

// 株式市場予測データセット
export const stockMarketDataset: AdvancedProblemDataset = {
  id: 'stock_market_prediction',
  name: '株式市場予測',
  description: '複雑な市場データから株価を予測する高度な回帰問題',
  data: generateAdvancedStockData(1500),
  featureNames: [
    '前日終値', '前日高値', '前日安値', '前日出来高', '5日移動平均', '20日移動平均',
    '50日移動平均', '200日移動平均', 'RSI', 'MACD', 'ボリンジャーバンド上',
    'ボリンジャーバンド下', 'ストキャスティクス', 'CCI', 'Williams %R',
    '出来高移動平均', '価格変動率', 'ボラティリティ', '相対強度', 'モメンタム',
    '市場全体の動き', 'セクター動向', '金利', '為替', 'VIX', '金価格', '原油価格'
  ],
  featureTypes: [
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical'
  ],
  problemType: 'regression',
  targetName: '翌日終値',
  difficulty: 'hard',
  domain: '金融'
};

// 推薦システムデータセット
export const recommendationDataset: AdvancedProblemDataset = {
  id: 'recommendation_system',
  name: '推薦システム',
  description: 'ユーザー行動からアイテムを推薦する複雑な分類問題',
  data: generateAdvancedRecommendationData(1500),
  featureNames: [
    'ユーザー年齢', 'ユーザー性別', 'ユーザー職業', 'ユーザー収入', 'ユーザー居住地',
    'アイテムカテゴリ', 'アイテム価格', 'アイテム評価', 'アイテム人気度',
    '過去の購入履歴', '過去の評価履歴', '過去の閲覧履歴', 'セッション時間',
    'デバイス種類', '時間帯', '曜日', '季節', 'プロモーション有無',
    '在庫状況', '配送時間', 'レビュー数', 'レビュー平均点', '類似ユーザー評価',
    'アイテム類似度', 'ユーザー類似度', 'トレンド度', '新着度'
  ],
  featureTypes: [
    'numerical', 'categorical', 'categorical', 'numerical', 'categorical',
    'categorical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical',
    'categorical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical'
  ],
  problemType: 'classification',
  targetName: '推薦判定',
  classes: ['非推薦', '推薦'],
  difficulty: 'hard',
  domain: 'EC'
};

// データ生成関数
function generateAdvancedHousingData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 基本情報（常識的な範囲）
    const landArea = Math.random() * 400 + 60; // 60-460坪（約200-1500㎡）
    const buildingArea = Math.random() * 150 + 30; // 30-180坪（約100-600㎡）
    const age = Math.random() * 40 + 5; // 5-45年
    const renovation = Math.random() > 0.7 ? Math.random() * 15 + 5 : 0; // 30%の確率でリノベーション
    const rooms = Math.floor(Math.random() * 6) + 2; // 2-7部屋
    const bathrooms = Math.floor(Math.random() * 3) + 1; // 1-3バス
    const toilets = Math.floor(Math.random() * 3) + 1; // 1-3トイレ
    const floors = Math.floor(Math.random() * 3) + 1; // 1-3階
    const garage = Math.floor(Math.random() * 3); // 0-2台
    const poolOptions = ['なし', 'あり'];
    const pool = poolOptions[Math.random() > 0.9 ? 1 : 0]; // 10%の確率（高級住宅のみ）
    const poolEncoded = poolOptions.indexOf(pool);
    const garden = Math.random() * 80 + 10; // 10-90坪
    const stationDistance = Math.random() * 1500 + 100; // 100-1600m
    const schoolDistance = Math.random() * 800 + 200; // 200-1000m
    const hospitalDistance = Math.random() * 1500 + 300; // 300-1800m
    const commercialDistance = Math.random() * 800 + 200; // 200-1000m
    const crimeRate = Math.random() * 5 + 1; // 1-6（犯罪率は低い）
    const populationDensity = Math.random() * 8000 + 2000; // 2000-10000人/km²
    const averageIncome = Math.random() * 800 + 400; // 400-1200万円
    const transportAccess = Math.random() * 8 + 2; // 2-10（交通利便性）
    const environmentScore = Math.random() * 8 + 2; // 2-10（環境スコア）
    const sunlight = Math.random() * 8 + 2; // 2-10（日当たり）
    const noiseLevel = Math.random() * 6 + 1; // 1-7（騒音レベル）
    const viewScore = Math.random() * 8 + 2; // 2-10（景観スコア）
    const security = Math.random() * 8 + 2; // 2-10（セキュリティ）
    
    // カテゴリカル変数
    const regions = ['都心部', '郊外', '住宅街', '高級住宅地', '新興住宅地'];
    const buildingStructures = ['木造', '鉄骨造', 'RC造', 'SRC造'];
    const ageCategories = ['新築', '築浅', '中古', '古い'];
    const renovationStatus = ['リノベーション済み', 'リノベーションなし'];
    const directions = ['南', '南東', '南西', '東', '西', '北東', '北西', '北'];
    const cornerRoomOptions = ['なし', 'あり'];
    const cornerRoom = cornerRoomOptions[Math.random() > 0.7 ? 1 : 0]; // 30%の確率
    const cornerRoomEncoded = cornerRoomOptions.indexOf(cornerRoom);
    
    const penthouseOptions = ['なし', 'あり'];
    const penthouse = penthouseOptions[Math.random() > 0.95 ? 1 : 0]; // 5%の確率
    const penthouseEncoded = penthouseOptions.indexOf(penthouse);
    const mansionTypes = ['分譲マンション', '賃貸マンション', 'タワーマンション', '低層マンション'];
    
    const region = regions[Math.floor(Math.random() * regions.length)];
    const buildingStructure = buildingStructures[Math.floor(Math.random() * buildingStructures.length)];
    const ageCategory = age < 5 ? ageCategories[0] : age < 15 ? ageCategories[1] : age < 30 ? ageCategories[2] : ageCategories[3];
    const renovationStatusValue = renovation > 0 ? renovationStatus[0] : renovationStatus[1];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const mansionType = mansionTypes[Math.floor(Math.random() * mansionTypes.length)];
    
    // カテゴリカル変数を数値にエンコード
    const regionEncoded = regions.indexOf(region);
    const buildingStructureEncoded = buildingStructures.indexOf(buildingStructure);
    const ageCategoryEncoded = ageCategories.indexOf(ageCategory);
    const renovationStatusEncoded = renovationStatus.indexOf(renovationStatusValue);
    const directionEncoded = directions.indexOf(direction);
    const mansionTypeEncoded = mansionTypes.indexOf(mansionType);
    
    // 追加の数値特徴量
    const totalFloors = Math.floor(Math.random() * 20) + 1; // 1-20階
    const parkingFee = Math.random() * 50000 + 10000; // 1-6万円
    const managementFee = Math.random() * 30000 + 5000; // 0.5-3.5万円
    const repairReserve = Math.random() * 20000 + 5000; // 0.5-2.5万円

    // 価格計算（複雑な式）
    let price = landArea * 50 + buildingArea * 100;
    price += (50 - age) * 20; // 築年数による減価
    price += renovation * 10; // リノベーションによる加算
    price += rooms * 50; // 部屋数による加算
    price += bathrooms * 30; // バスルームによる加算
    price += garage * 20; // ガレージによる加算
    price += poolEncoded * 100; // プールによる加算
    price += garden * 5; // 庭による加算
    price -= stationDistance * 0.1; // 駅距離による減価
    price += (10 - crimeRate) * 10; // 犯罪率による減価
    price += averageIncome * 0.1; // 平均所得による加算
    price += transportAccess * 5; // 交通利便性による加算
    price += environmentScore * 10; // 環境スコアによる加算
    price += sunlight * 5; // 日当たりによる加算
    price -= noiseLevel * 2; // 騒音による減価
    price += viewScore * 8; // 景観による加算
    price += security * 5; // セキュリティによる加算
    
    // 地域による価格調整
    price *= (regionEncoded === 0 ? 1.5 : regionEncoded === 1 ? 0.8 : regionEncoded === 2 ? 1.0 : regionEncoded === 3 ? 1.3 : 1.1);
    
    // 建物構造による価格調整
    price *= (buildingStructureEncoded === 0 ? 0.7 : buildingStructureEncoded === 1 ? 0.9 : buildingStructureEncoded === 2 ? 1.2 : 1.4);

    // ノイズを追加
    price += (Math.random() - 0.5) * price * 0.2;

    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.15) { // 15%の確率で欠損値あり
      // 築年数が古い場合、リノベーション年が欠損しやすい
      if (age > 30 && Math.random() < 0.8) {
        missingIndices.push(3); // リノベーション年
      }
      
      // 高級住宅でない場合、プール情報が欠損しやすい
      if (price < 5000 && Math.random() < 0.6) {
        missingIndices.push(9); // プール有無
      }
      
      // 郊外の場合、商業施設距離が欠損しやすい
      if (regionEncoded === 1 && Math.random() < 0.7) {
        missingIndices.push(14); // 商業施設距離
      }
      
      // 古い建物の場合、セキュリティ情報が欠損しやすい
      if (age > 20 && Math.random() < 0.5) {
        missingIndices.push(23); // セキュリティ
      }
      
      // 低価格帯の場合、管理費情報が欠損しやすい
      if (price < 3000 && Math.random() < 0.4) {
        missingIndices.push(34); // 管理費
      }
    }

    // 特徴量配列を作成（カテゴリカル変数は文字列、数値変数は数値、欠損値はNaN）
    const features = [
      landArea, buildingArea, age, renovation, rooms, bathrooms, toilets, floors,
      garage, pool, garden, stationDistance, schoolDistance, hospitalDistance,
      commercialDistance, crimeRate, populationDensity, averageIncome,
      transportAccess, environmentScore, sunlight, noiseLevel, viewScore, security,
      region, buildingStructure, ageCategory, renovationStatus,
      direction, totalFloors, cornerRoom, penthouse, mansionType,
      parkingFee, managementFee, repairReserve
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: Math.max(0, Math.round(price))
    });
  }
  return data;
}

function generateAdvancedCustomerData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 年齢: 整数で現実的な分布
    const age = Math.random() < 0.4 ? Math.floor(Math.random() * 30) + 20 : // 40%が20-49歳
                Math.random() < 0.8 ? Math.floor(Math.random() * 30) + 50 : // 40%が50-79歳
                Math.floor(Math.random() * 20) + 80; // 20%が80-99歳
    
    // 性別: カテゴリカル変数として適切に処理
    const genders = ['男性', '女性'];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const genderEncoded = genders.indexOf(gender);
    
    // 年収: 整数で現実的な分布（万円単位）
    const income = Math.random() < 0.6 ? 
      Math.floor(Math.random() * 500) + 300 : // 60%が300-799万円
      Math.floor(Math.random() * 1200) + 800; // 40%が800-1999万円
    
    // 家族構成: カテゴリカル変数として適切に処理
    const familySizes = ['1人', '2人', '3人', '4人', '5人以上'];
    const familySize = familySizes[Math.floor(Math.random() * familySizes.length)];
    const familySizeEncoded = familySizes.indexOf(familySize);
    
    // 居住地: カテゴリカル変数として適切に処理
    const residences = ['東京都', '大阪府', '神奈川県', '愛知県', '埼玉県', '千葉県', '兵庫県', '福岡県', '北海道', 'その他'];
    const residence = residences[Math.floor(Math.random() * residences.length)];
    const residenceEncoded = residences.indexOf(residence);
    
    // 職業: カテゴリカル変数として適切に処理
    const occupations = ['会社員', '自営業', '公務員', '学生', '主婦', 'フリーランス', 'その他'];
    const occupation = occupations[Math.floor(Math.random() * occupations.length)];
    const occupationEncoded = occupations.indexOf(occupation);
    
    // 教育レベル: カテゴリカル変数として適切に処理
    const educationLevels = ['高校卒', '専門学校卒', '大学卒', '大学院卒', 'その他'];
    const education = educationLevels[Math.floor(Math.random() * educationLevels.length)];
    const educationEncoded = educationLevels.indexOf(education);
    
    // 契約期間: 整数で現実的な分布（月単位）
    const contractPeriod = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 24) + 1 : // 70%が1-24ヶ月
      Math.floor(Math.random() * 36) + 24; // 30%が24-59ヶ月
    
    const monthlyFee = Math.floor(Math.random() * 30000) + 2000; // 2000-31999円
    const supportCount = Math.floor(Math.random() * 16); // 0-15回
    const satisfaction = Math.floor(Math.random() * 11); // 0-10
    const serviceCount = Math.floor(Math.random() * 8) + 1; // 1-8サービス
    const creditScore = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 200) + 600 : // 70%が600-799
      Math.floor(Math.random() * 400) + 200; // 30%が200-599
    const pastCancellations = Math.random() < 0.8 ? 
      Math.floor(Math.random() * 2) : // 80%が0-1回
      Math.floor(Math.random() * 3) + 2; // 20%が2-4回
    const referrals = Math.floor(Math.random() * 8); // 0-7回
    const socialActivity = Math.floor(Math.random() * 11); // 0-10
    const purchaseFrequency = Math.floor(Math.random() * 21); // 0-20回/月
    const averagePurchase = Math.floor(Math.random() * 50000) + 5000; // 5000-54999円
    const categoryDiversity = Math.floor(Math.random() * 11); // 0-10
    const seasonality = Math.floor(Math.random() * 11); // 0-10
    const timeBias = Math.floor(Math.random() * 11); // 0-10
    
    // デバイス種類: カテゴリカル変数として適切に処理
    const deviceTypes = ['PC', 'スマートフォン', 'タブレット', 'その他'];
    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    const deviceTypeEncoded = deviceTypes.indexOf(deviceType);
    
    // 支払い方法: カテゴリカル変数として適切に処理
    const paymentMethods = ['現金', 'クレジットカード', 'デビットカード', '電子マネー', 'その他'];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const paymentMethodEncoded = paymentMethods.indexOf(paymentMethod);
    
    const promotionResponse = Math.random() * 10; // 0-10
    
    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.12) { // 12%の確率で欠損値あり
      // 学生の場合、年収情報が欠損しやすい
      if (occupation === '学生' && Math.random() < 0.8) {
        missingIndices.push(2); // 年収
      }
      
      // 高齢者の場合、SNS活動度が欠損しやすい
      if (age > 65 && Math.random() < 0.7) {
        missingIndices.push(15); // SNS活動度
      }
      
      // 短期契約の場合、推奨回数が欠損しやすい
      if (contractPeriod < 6 && Math.random() < 0.6) {
        missingIndices.push(14); // 推奨回数
      }
      
      // 低満足度の場合、サポート回数が欠損しやすい
      if (satisfaction < 3 && Math.random() < 0.5) {
        missingIndices.push(9); // サポート回数
      }
      
      // 新規顧客の場合、過去の解約回数が欠損しやすい
      if (contractPeriod < 3 && Math.random() < 0.4) {
        missingIndices.push(13); // 過去の解約回数
      }
    }

    // 生涯価値計算（より現実的なロジック）
    let lifetimeValue = income * 0.05; // 基本価値（年収の5%）
    lifetimeValue += satisfaction * 500; // 満足度による加算
    lifetimeValue += serviceCount * 300; // サービス数による加算
    lifetimeValue += contractPeriod * 50; // 契約期間による加算
    lifetimeValue += referrals * 1000; // 推奨による加算
    lifetimeValue += purchaseFrequency * 50; // 購買頻度による加算
    lifetimeValue += averagePurchase * 0.05; // 平均購入額による加算
    lifetimeValue -= pastCancellations * 2000; // 解約による減価
    lifetimeValue += creditScore * 5; // クレジットスコアによる加算
    lifetimeValue += socialActivity * 200; // SNS活動による加算
    
    // 職業による調整
    if (occupation === '会社員') lifetimeValue *= 1.2;
    if (occupation === '自営業') lifetimeValue *= 1.1;
    if (occupation === '学生') lifetimeValue *= 0.5;
    
    // 年齢による調整
    if (age > 60) lifetimeValue *= 0.8;
    if (age < 30) lifetimeValue *= 1.1;

    // ノイズを追加
    lifetimeValue += (Math.random() - 0.5) * lifetimeValue * 0.2;

    // 特徴量配列を作成
    const features = [
      age, gender, income, familySize, residence, occupation, education,
      contractPeriod, monthlyFee, supportCount, satisfaction, serviceCount,
      creditScore, pastCancellations, referrals, socialActivity, purchaseFrequency,
      averagePurchase, categoryDiversity, seasonality, timeBias, deviceType,
      paymentMethod, promotionResponse
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: Math.max(0, Math.round(lifetimeValue))
    });
  }
  return data;
}

function generateAdvancedFraudData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 取引金額: 整数で現実的な分布（小額取引が多い）
    const amount = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 50000) + 1000 : // 70%が1-49999円
      Math.floor(Math.random() * 200000) + 50000; // 30%が5-249999円
    
    // 取引時間: 0-24時間の範囲で適切に（小数点あり）
    const time = Math.random() * 24; // 0-24時
    
    // 取引場所: 0-100のスコア（整数）
    const location = Math.floor(Math.random() * 101); // 0-100（場所スコア）
    
    // 前回取引からの時間: 整数で現実的な分布（分単位）
    const timeSinceLast = Math.random() < 0.6 ? 
      Math.floor(Math.random() * 60) + 1 : // 60%が1-60分
      Math.floor(Math.random() * 1440) + 60; // 40%が60-1499分
    
    // 前回取引金額: 現在の取引金額と相関（整数）
    const lastAmount = Math.floor(amount * (0.8 + Math.random() * 0.4)); // 現在の80-120%
    
    // 月間取引回数: 整数で現実的な分布
    const monthlyTransactions = Math.random() < 0.5 ? 
      Math.floor(Math.random() * 20) + 1 : // 50%が1-20回
      Math.floor(Math.random() * 30) + 20; // 50%が20-49回
    
    // 月間取引総額: 取引回数と相関（整数）
    const monthlyAmount = Math.floor(monthlyTransactions * (amount * (0.5 + Math.random() * 1.0)));
    
    // 時間帯: カテゴリカル変数として適切に処理
    const timePeriods = ['深夜', '早朝', '朝', '昼', '夕方', '夜'];
    const timePeriod = timePeriods[Math.floor(Math.random() * timePeriods.length)];
    const timePeriodEncoded = timePeriods.indexOf(timePeriod);
    
    // 曜日: カテゴリカル変数として適切に処理
    const daysOfWeek = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];
    const dayOfWeek = daysOfWeek[Math.floor(Math.random() * daysOfWeek.length)];
    const dayOfWeekEncoded = daysOfWeek.indexOf(dayOfWeek);
    
    // 季節: カテゴリカル変数として適切に処理
    const seasons = ['春', '夏', '秋', '冬'];
    const season = seasons[Math.floor(Math.random() * seasons.length)];
    const seasonEncoded = seasons.indexOf(season);
    
    // カード種類: カテゴリカル変数として適切に処理
    const cardTypes = ['クレジットカード', 'デビットカード', 'プリペイドカード', '電子マネー', 'その他'];
    const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    const cardTypeEncoded = cardTypes.indexOf(cardType);
    
    // 加盟店カテゴリ: カテゴリカル変数として適切に処理
    const merchantCategories = ['小売店', 'レストラン', 'ガソリンスタンド', 'オンライン', '交通機関', '医療', '娯楽', 'その他'];
    const merchantCategory = merchantCategories[Math.floor(Math.random() * merchantCategories.length)];
    const merchantCategoryEncoded = merchantCategories.indexOf(merchantCategory);
    
    // 地理的距離: より現実的な分布
    const geoDistance = Math.random() < 0.8 ? 
      Math.random() * 50 + 1 : // 80%が1-50km
      Math.random() * 950 + 50; // 20%が50-1000km
    
    // 異常度スコア: 0-10の範囲で適切に
    const anomalyScore = Math.random() * 10; // 0-10
    
    // リスクスコア: 0-10の範囲で適切に
    const riskScore = Math.random() * 10; // 0-10
    
    // 過去の拒否回数: より現実的な分布
    const pastRejections = Math.random() < 0.9 ? 
      Math.floor(Math.random() * 3) : // 90%が0-2回
      Math.floor(Math.random() * 7) + 3; // 10%が3-9回
    
    // 信用度: 整数で現実的な分布
    const creditScore = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 200) + 600 : // 70%が600-799
      Math.floor(Math.random() * 400) + 200; // 30%が200-599
    
    // 年収: 整数で現実的な分布（万円単位）
    const income = Math.random() < 0.6 ? 
      Math.floor(Math.random() * 500) + 300 : // 60%が300-799万円
      Math.floor(Math.random() * 1200) + 800; // 40%が800-1999万円
    
    // 職業: カテゴリカル変数として適切に処理
    const occupations = ['会社員', '自営業', '公務員', '学生', '主婦', 'フリーランス', 'その他'];
    const occupation = occupations[Math.floor(Math.random() * occupations.length)];
    const occupationEncoded = occupations.indexOf(occupation);
    
    // 居住期間: 整数で現実的な分布（年単位）
    const residencePeriod = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 10) + 1 : // 70%が1-10年
      Math.floor(Math.random() * 20) + 10; // 30%が10-29年
    
    // 家族構成: カテゴリカル変数として適切に処理
    const familySizes = ['1人', '2人', '3人', '4人', '5人以上'];
    const familySize = familySizes[Math.floor(Math.random() * familySizes.length)];
    const familySizeEncoded = familySizes.indexOf(familySize);
    
    // 過去の詐欺被害: カテゴリカル変数として適切に処理
    const pastFraudOptions = ['なし', 'あり'];
    const pastFraud = pastFraudOptions[Math.random() > 0.95 ? 1 : 0]; // 5%の確率
    const pastFraudEncoded = pastFraudOptions.indexOf(pastFraud);
    
    // 保険加入状況: カテゴリカル変数として適切に処理
    const insuranceOptions = ['未加入', '加入'];
    const insurance = insuranceOptions[Math.random() > 0.3 ? 1 : 0]; // 70%の確率
    const insuranceEncoded = insuranceOptions.indexOf(insurance);
    
    // 連絡先確認状況: カテゴリカル変数として適切に処理
    const contactOptions = ['未確認', '確認済み'];
    const contactVerified = contactOptions[Math.random() > 0.2 ? 1 : 0]; // 80%の確率
    const contactVerifiedEncoded = contactOptions.indexOf(contactVerified);
    
    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.08) { // 8%の確率で欠損値あり
      // 小額取引の場合、地理的距離が欠損しやすい
      if (amount < 10000 && Math.random() < 0.6) {
        missingIndices.push(12); // 地理的距離
      }
      
      // 深夜の取引の場合、加盟店カテゴリが欠損しやすい
      if (time < 6 || time > 22) {
        if (Math.random() < 0.5) {
          missingIndices.push(11); // 加盟店カテゴリ
        }
      }
      
      // 新規カードの場合、過去の拒否回数が欠損しやすい
      if (creditScore > 700 && Math.random() < 0.7) {
        missingIndices.push(15); // 過去の拒否回数
      }
      
      // 高齢者の場合、SNS活動度が欠損しやすい
      if (Math.random() < 0.3) {
        missingIndices.push(19); // デバイス種類
      }
    }

    // 詐欺判定ロジック（より現実的なロジック）
    let isFraud = 0;
    if (amount > 100000) isFraud += 0.2; // 高額取引（10万円以上）
    if (time < 6 || time > 22) isFraud += 0.3; // 深夜・早朝
    if (geoDistance > 200) isFraud += 0.4; // 遠距離（200km以上）
    if (anomalyScore > 7) isFraud += 0.5; // 異常度
    if (riskScore > 8) isFraud += 0.4; // リスクスコア
    if (pastRejections > 2) isFraud += 0.3; // 過去の拒否
    if (creditScore < 400) isFraud += 0.3; // 低クレジット
    if (pastFraud === 'あり') isFraud += 0.6; // 過去の詐欺
    if (contactVerified === '未確認') isFraud += 0.2; // 連絡先未確認
    if (timeSinceLast < 5) isFraud += 0.3; // 短時間での連続取引

    // ランダム要素を追加
    isFraud += (Math.random() - 0.5) * 0.2;

    // 特徴量配列を作成
    const features = [
      amount, time, location, timeSinceLast, lastAmount, monthlyTransactions,
      monthlyAmount, timePeriod, dayOfWeek, season, cardType, merchantCategory,
      geoDistance, anomalyScore, riskScore, pastRejections, creditScore,
      income, occupation, residencePeriod, familySize, pastFraud, insurance,
      contactVerified
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: isFraud > 0.5 ? 1 : 0
    });
  }
  return data;
}

function generateAdvancedMedicalData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 年齢: 整数で現実的な分布（若年層が多い）
    const age = Math.random() < 0.3 ? Math.floor(Math.random() * 30) + 20 : // 30%が20-49歳
                Math.random() < 0.6 ? Math.floor(Math.random() * 30) + 50 : // 30%が50-79歳
                Math.floor(Math.random() * 20) + 80; // 40%が80-99歳
    
    // 性別: カテゴリカル変数として適切に処理
    const genders = ['男性', '女性'];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const genderEncoded = genders.indexOf(gender);
    
    // 身長・体重: 性別に応じた現実的な値（整数）
    const isMale = gender === '男性';
    const height = isMale ? 
      Math.floor(Math.random() * 20) + 160 : // 男性: 160-179cm
      Math.floor(Math.random() * 20) + 150;  // 女性: 150-169cm
    const weight = isMale ?
      Math.floor(Math.random() * 30) + 60 :  // 男性: 60-89kg
      Math.floor(Math.random() * 25) + 45;   // 女性: 45-69kg
    
    const bmi = Math.round((weight / ((height / 100) ** 2)) * 10) / 10; // 小数点第1位まで
    
    // 血圧: 整数で現実的な分布（異常値も含む）
    const systolicBP = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 20) + 110 : // 70%が正常範囲
      Math.floor(Math.random() * 40) + 130;  // 30%が異常値
    const diastolicBP = Math.random() < 0.7 ?
      Math.floor(Math.random() * 15) + 70 :  // 70%が正常範囲
      Math.floor(Math.random() * 25) + 85;   // 30%が異常値
    
    const heartRate = Math.floor(Math.random() * 40) + 60; // 60-99bpm
    const temperature = Math.random() < 0.9 ?
      Math.round((Math.random() * 0.5 + 36.5) * 10) / 10 : // 90%が正常（小数点第1位）
      Math.round((Math.random() * 1.5 + 37.5) * 10) / 10;  // 10%が発熱（小数点第1位）
    
    // 検査値: 整数で現実的な分布
    const bloodSugar = Math.random() < 0.8 ?
      Math.floor(Math.random() * 40) + 80 :   // 80%が正常
      Math.floor(Math.random() * 100) + 120;  // 20%が異常
    const cholesterol = Math.random() < 0.6 ?
      Math.floor(Math.random() * 50) + 150 :  // 60%が正常
      Math.floor(Math.random() * 100) + 200;  // 40%が異常
    
    const hemoglobin = Math.round((Math.random() * 3 + 11) * 10) / 10; // 11-14g/dL（小数点第1位）
    const whiteBloodCells = Math.floor(Math.random() * 4000) + 5000; // 5000-8999/μL
    const redBloodCells = Math.round((Math.random() * 1 + 4.5) * 100) / 100; // 4.5-5.5M/μL（小数点第2位）
    const platelets = Math.floor(Math.random() * 100000) + 200000; // 200000-299999/μL
    const liverFunction = Math.floor(Math.random() * 50) + 30; // 30-79
    const kidneyFunction = Math.floor(Math.random() * 50) + 30; // 30-79
    
    // 症状: カテゴリカル変数として適切に処理
    const symptomOptions = ['なし', 'あり'];
    const symptoms = [
      symptomOptions[Math.random() > 0.8 ? 1 : 0], // 症状1: 20%の確率
      symptomOptions[Math.random() > 0.9 ? 1 : 0], // 症状2: 10%の確率
      symptomOptions[Math.random() > 0.7 ? 1 : 0], // 症状3: 30%の確率
      symptomOptions[Math.random() > 0.85 ? 1 : 0], // 症状4: 15%の確率
      symptomOptions[Math.random() > 0.75 ? 1 : 0], // 症状5: 25%の確率
      symptomOptions[Math.random() > 0.9 ? 1 : 0], // 症状6: 10%の確率
      symptomOptions[Math.random() > 0.8 ? 1 : 0], // 症状7: 20%の確率
      symptomOptions[Math.random() > 0.85 ? 1 : 0], // 症状8: 15%の確率
      symptomOptions[Math.random() > 0.7 ? 1 : 0], // 症状9: 30%の確率
      symptomOptions[Math.random() > 0.9 ? 1 : 0]  // 症状10: 10%の確率
    ];
    const symptomsEncoded = symptoms.map(s => symptomOptions.indexOf(s));
    
    // 生活習慣: カテゴリカル変数として適切に処理
    const historyLevels = ['なし', '軽度', '中程度', '重度', '非常に重度'];
    const medicalHistory = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const medicalHistoryEncoded = historyLevels.indexOf(medicalHistory);
    
    const familyHistory = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const familyHistoryEncoded = historyLevels.indexOf(familyHistory);
    
    const smoking = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const smokingEncoded = historyLevels.indexOf(smoking);
    
    const drinking = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const drinkingEncoded = historyLevels.indexOf(drinking);
    
    const exercise = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const exerciseEncoded = historyLevels.indexOf(exercise);
    
    const sleep = Math.floor(Math.random() * 4) + 6; // 6-9時間（整数）
    
    const stressLevels = ['なし', '軽度', '中程度', '重度', '非常に重度'];
    const stress = stressLevels[Math.floor(Math.random() * stressLevels.length)];
    const stressEncoded = stressLevels.indexOf(stress);
    
    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.18) { // 18%の確率で欠損値あり
      // 若年者の場合、既往歴が欠損しやすい
      if (age < 30 && Math.random() < 0.6) {
        missingIndices.push(27); // 既往歴
      }
      
      // 高齢者の場合、家族歴が欠損しやすい
      if (age > 70 && Math.random() < 0.5) {
        missingIndices.push(28); // 家族歴
      }
      
      // 健康な人の場合、症状情報が欠損しやすい
      if (bmi >= 18.5 && bmi <= 25 && systolicBP < 120 && diastolicBP < 80) {
        if (Math.random() < 0.7) {
          // 症状1-10のうちランダムに1-3個を欠損
          const symptomIndices = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
          const numMissing = Math.floor(Math.random() * 3) + 1;
          const shuffled = symptomIndices.sort(() => 0.5 - Math.random());
          missingIndices.push(...shuffled.slice(0, numMissing));
        }
      }
      
      // 緊急事態の場合、生活習慣情報が欠損しやすい
      if (temperature > 38 || systolicBP > 180 || diastolicBP > 110) {
        if (Math.random() < 0.8) {
          missingIndices.push(30); // 喫煙歴
          missingIndices.push(31); // 飲酒歴
          missingIndices.push(32); // 運動習慣
        }
      }
      
      // 低所得者の場合、詳細な検査値が欠損しやすい
      if (Math.random() < 0.4) {
        missingIndices.push(10); // 血糖値
        missingIndices.push(11); // コレステロール
      }
    }

    // 診断結果判定（より現実的なロジック）
    let diagnosis = 0; // 0: 健康, 1: 軽症, 2: 中症, 3: 重症, 4: 要入院
    
    // 年齢による基本リスク
    if (age > 70) diagnosis += 1;
    if (age > 85) diagnosis += 1;
    
    // 検査値による判定
    if (bmi > 30 || bmi < 18.5) diagnosis += 1; // BMI異常
    if (systolicBP > 140 || diastolicBP > 90) diagnosis += 1; // 高血圧
    if (bloodSugar > 126) diagnosis += 2; // 糖尿病
    if (cholesterol > 240) diagnosis += 1; // 高コレステロール
    if (temperature > 37.5) diagnosis += 1; // 発熱
    if (heartRate > 100 || heartRate < 50) diagnosis += 1; // 心拍数異常
    
    // 症状による判定
    const symptomCount = symptomsEncoded.filter(s => s === 1).length;
    if (symptomCount > 3) diagnosis += 1;
    if (symptomCount > 6) diagnosis += 1;
    
    // 生活習慣による判定
    if (medicalHistoryEncoded > 2) diagnosis += 1; // 既往歴（中程度以上）
    if (familyHistoryEncoded > 2) diagnosis += 1; // 家族歴（中程度以上）
    if (smokingEncoded > 2) diagnosis += 1; // 喫煙（中程度以上）
    if (stressEncoded > 3) diagnosis += 1; // 高ストレス（重度以上）
    if (sleep < 6 || sleep > 9) diagnosis += 1; // 睡眠異常

    // ランダム要素を追加
    diagnosis += Math.floor(Math.random() * 3) - 1;
    diagnosis = Math.max(0, Math.min(4, diagnosis));

    // 特徴量配列を作成
    const features = [
      age, gender, height, weight, bmi, systolicBP, diastolicBP, heartRate,
      temperature, bloodSugar, cholesterol, hemoglobin, whiteBloodCells,
      redBloodCells, platelets, liverFunction, kidneyFunction, ...symptoms,
      medicalHistory, familyHistory, smoking, drinking, exercise, sleep, stress
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: diagnosis
    });
  }
  return data;
}

function generateAdvancedStockData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  let basePrice = 1000; // 基準価格

  for (let i = 0; i < count; i++) {
    // 価格変動をシミュレート
    const change = (Math.random() - 0.5) * 0.1; // -5% to +5%
    basePrice *= (1 + change);
    
    const prevClose = basePrice;
    const prevHigh = prevClose * (1 + Math.random() * 0.05);
    const prevLow = prevClose * (1 - Math.random() * 0.05);
    const volume = Math.random() * 1000000 + 100000;
    const ma5 = prevClose * (1 + (Math.random() - 0.5) * 0.02);
    const ma20 = prevClose * (1 + (Math.random() - 0.5) * 0.05);
    const ma50 = prevClose * (1 + (Math.random() - 0.5) * 0.1);
    const ma200 = prevClose * (1 + (Math.random() - 0.5) * 0.2);
    const rsi = Math.random() * 100;
    const macd = (Math.random() - 0.5) * 10;
    const bbUpper = prevClose * (1 + Math.random() * 0.1);
    const bbLower = prevClose * (1 - Math.random() * 0.1);
    const stoch = Math.random() * 100;
    const cci = (Math.random() - 0.5) * 200;
    const williams = (Math.random() - 0.5) * 100;
    const volumeMA = volume * (1 + (Math.random() - 0.5) * 0.2);
    const priceChange = (Math.random() - 0.5) * 0.1;
    const volatility = Math.random() * 0.5;
    const relativeStrength = Math.random() * 10;
    const momentum = (Math.random() - 0.5) * 20;
    const marketMovement = (Math.random() - 0.5) * 0.1;
    const sectorTrend = (Math.random() - 0.5) * 0.1;
    const interestRate = Math.random() * 5 + 1;
    const exchangeRate = Math.random() * 50 + 100;
    const vix = Math.random() * 50 + 10;
    const goldPrice = Math.random() * 1000 + 1500;
    const oilPrice = Math.random() * 50 + 50;

    // 翌日終値予測（簡略化）
    let nextClose = prevClose;
    nextClose += (ma5 - prevClose) * 0.1;
    nextClose += (ma20 - prevClose) * 0.05;
    nextClose += (rsi - 50) * 0.01;
    nextClose += macd * 0.1;
    nextClose += marketMovement * prevClose;
    nextClose += sectorTrend * prevClose;
    nextClose += (Math.random() - 0.5) * prevClose * 0.02; // ランダム要素

    data.push({
      features: [
        prevClose, prevHigh, prevLow, volume, ma5, ma20, ma50, ma200,
        rsi, macd, bbUpper, bbLower, stoch, cci, williams, volumeMA,
        priceChange, volatility, relativeStrength, momentum, marketMovement,
        sectorTrend, interestRate, exchangeRate, vix, goldPrice, oilPrice
      ],
      label: Math.max(0, nextClose)
    });
  }
  return data;
}

function generateAdvancedRecommendationData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    const userAge = Math.random() * 60 + 18; // 18-78歳
    const userGender = Math.random() > 0.5 ? 1 : 0; // 0: 女性, 1: 男性
    const userOccupation = Math.random() * 10; // 0-10
    const userIncome = Math.random() * 2000 + 200; // 200-2200万円
    const userLocation = Math.random() * 10; // 0-10
    const itemCategory = Math.random() * 20; // 0-20
    const itemPrice = Math.random() * 100000 + 1000; // 1000-101000円
    const itemRating = Math.random() * 5; // 0-5
    const itemPopularity = Math.random() * 10; // 0-10
    const purchaseHistory = Math.random() * 100; // 0-100回
    const ratingHistory = Math.random() * 50; // 0-50回
    const viewHistory = Math.random() * 200; // 0-200回
    const sessionTime = Math.random() * 3600; // 0-3600秒
    const deviceType = Math.random() * 3; // 0-3
    const timeOfDay = Math.random() * 24; // 0-24時
    const dayOfWeek = Math.random() * 7; // 0-7日
    const season = Math.random() * 4; // 0-4季節
    const hasPromotion = Math.random() > 0.5 ? 1 : 0; // 50%の確率
    const stockStatus = Math.random() * 10; // 0-10
    const deliveryTime = Math.random() * 7; // 0-7日
    const reviewCount = Math.floor(Math.random() * 1000); // 0-999回
    const reviewAverage = Math.random() * 5; // 0-5
    const similarUserRating = Math.random() * 5; // 0-5
    const itemSimilarity = Math.random() * 10; // 0-10
    const userSimilarity = Math.random() * 10; // 0-10
    const trendScore = Math.random() * 10; // 0-10
    const noveltyScore = Math.random() * 10; // 0-10

    // 推薦判定ロジック
    let recommendation = 0; // 0: 非推薦, 1: 推薦
    if (itemRating > 4) recommendation += 0.3; // 高評価
    if (itemPopularity > 7) recommendation += 0.2; // 人気
    if (purchaseHistory > 50) recommendation += 0.2; // 購買履歴
    if (ratingHistory > 20) recommendation += 0.1; // 評価履歴
    if (sessionTime > 1800) recommendation += 0.1; // 長時間セッション
    if (similarUserRating > 4) recommendation += 0.2; // 類似ユーザー評価
    if (itemSimilarity > 7) recommendation += 0.3; // アイテム類似度
    if (userSimilarity > 7) recommendation += 0.2; // ユーザー類似度
    if (trendScore > 7) recommendation += 0.1; // トレンド
    if (hasPromotion) recommendation += 0.1; // プロモーション

    // ランダム要素を追加
    recommendation += (Math.random() - 0.5) * 0.2;

    data.push({
      features: [
        userAge, userGender, userOccupation, userIncome, userLocation,
        itemCategory, itemPrice, itemRating, itemPopularity, purchaseHistory,
        ratingHistory, viewHistory, sessionTime, deviceType, timeOfDay,
        dayOfWeek, season, hasPromotion, stockStatus, deliveryTime,
        reviewCount, reviewAverage, similarUserRating, itemSimilarity,
        userSimilarity, trendScore, noveltyScore
      ],
      label: recommendation > 0.5 ? 1 : 0
    });
  }
  return data;
}

// ランダムにデータセットを取得
export function getRandomAdvancedProblemDataset(): AdvancedProblemDataset {
  const datasets = [
    advancedHousingDataset,
    customerLifetimeValueDataset,
    fraudDetectionDataset,
    medicalDiagnosisDataset,
    stockMarketDataset,
    recommendationDataset
  ];
  
  const randomIndex = Math.floor(Math.random() * datasets.length);
  return datasets[randomIndex];
}
export interface AdvancedProblemDataset {
  id: string;
  name: string;
  description: string;
  data: { features: (number | string)[]; label: number | string }[]; // カテゴリカル変数は文字列として格納
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[]; // 特徴量のタイプ
  problemType: 'classification' | 'regression';
  targetName: string;
  classes?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  domain: string;
}

// 高度な住宅価格予測データセット
export const advancedHousingDataset: AdvancedProblemDataset = {
  id: 'advanced_housing',
  name: '高級住宅価格予測',
  description: '複雑な住宅データから価格を予測する高度な回帰問題',
  data: generateAdvancedHousingData(1500),
  featureNames: [
    '土地面積', '建物面積', '築年数', 'リノベーション年', '部屋数', 'バスルーム数', 
    'トイレ数', '階数', 'ガレージ台数', 'プール有無', '庭面積', '最寄り駅距離',
    '学校距離', '病院距離', '商業施設距離', '犯罪率', '人口密度', '平均所得',
    '交通利便性', '環境スコア', '日当たり', '騒音レベル', '景観スコア', 'セキュリティ',
    '地域', '建物構造', '築年数カテゴリ', 'リノベーション有無', '向き', '総階数',
    '角部屋', 'ペントハウス', 'マンション種別', '駐車場料金', '管理費', '修繕積立金'
  ],
  featureTypes: [
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'categorical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'numerical',
    'categorical', 'categorical', 'categorical', 'numerical', 'numerical', 'numerical'
  ],
  problemType: 'regression',
  targetName: '価格（万円）',
  difficulty: 'hard',
  domain: '不動産'
};

// 顧客生涯価値予測データセット
export const customerLifetimeValueDataset: AdvancedProblemDataset = {
  id: 'customer_lifetime_value',
  name: '顧客生涯価値予測',
  description: '顧客の行動パターンから生涯価値を予測する複雑な回帰問題',
  data: generateAdvancedCustomerData(1500),
  featureNames: [
    '年齢', '性別', '年収', '家族構成', '居住地', '職業', '教育レベル',
    '契約期間', '月額料金', 'サポート回数', '満足度', 'サービス利用数',
    'クレジットスコア', '過去の解約回数', '推奨回数', 'SNS活動度',
    '購買頻度', '平均購入額', 'カテゴリ多様性', '季節性', '時間帯偏り',
    'デバイス種類', '支払い方法', 'プロモーション反応率'
  ],
  featureTypes: [
    'numerical', 'categorical', 'numerical', 'categorical', 'categorical', 'categorical', 'categorical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'categorical', 'categorical', 'numerical'
  ],
  problemType: 'regression',
  targetName: '生涯価値（万円）',
  difficulty: 'hard',
  domain: 'マーケティング'
};

// 金融詐欺検出データセット
export const fraudDetectionDataset: AdvancedProblemDataset = {
  id: 'fraud_detection',
  name: '金融詐欺検出',
  description: '取引データから詐欺を検出する高度な分類問題',
  data: generateAdvancedFraudData(1500),
  featureNames: [
    '取引金額', '取引時間', '取引場所', '前回取引からの時間', '前回取引金額',
    '月間取引回数', '月間取引総額', '時間帯', '曜日', '季節', 'カード種類',
    '加盟店カテゴリ', '地理的距離', '異常度スコア', 'リスクスコア',
    '過去の拒否回数', '信用度', '年収', '職業', '居住期間', '家族構成',
    '過去の詐欺被害', '保険加入状況', '連絡先確認状況'
  ],
  featureTypes: [
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'categorical', 'categorical', 'categorical', 'categorical',
    'categorical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'categorical', 'numerical', 'categorical',
    'categorical', 'categorical', 'categorical'
  ],
  problemType: 'classification',
  targetName: '詐欺判定',
  classes: ['正常', '詐欺'],
  difficulty: 'hard',
  domain: '金融'
};

// 医療診断支援データセット
export const medicalDiagnosisDataset: AdvancedProblemDataset = {
  id: 'medical_diagnosis',
  name: '医療診断支援',
  description: '患者データから疾病を診断する複雑な分類問題',
  data: generateAdvancedMedicalData(1500),
  featureNames: [
    '年齢', '性別', '身長', '体重', 'BMI', '血圧（収縮期）', '血圧（拡張期）',
    '心拍数', '体温', '血糖値', 'コレステロール', 'ヘモグロビン', '白血球数',
    '赤血球数', '血小板数', '肝機能値', '腎機能値', '症状1', '症状2', '症状3',
    '症状4', '症状5', '症状6', '症状7', '症状8', '症状9', '症状10',
    '既往歴', '家族歴', '喫煙歴', '飲酒歴', '運動習慣', '睡眠時間', 'ストレス度'
  ],
  featureTypes: [
    'numerical', 'categorical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'categorical', 'categorical', 'categorical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'categorical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'numerical', 'categorical'
  ],
  problemType: 'classification',
  targetName: '診断結果',
  classes: ['健康', '軽症', '中症', '重症', '要入院'],
  difficulty: 'hard',
  domain: '医療'
};

// 株式市場予測データセット
export const stockMarketDataset: AdvancedProblemDataset = {
  id: 'stock_market_prediction',
  name: '株式市場予測',
  description: '複雑な市場データから株価を予測する高度な回帰問題',
  data: generateAdvancedStockData(1500),
  featureNames: [
    '前日終値', '前日高値', '前日安値', '前日出来高', '5日移動平均', '20日移動平均',
    '50日移動平均', '200日移動平均', 'RSI', 'MACD', 'ボリンジャーバンド上',
    'ボリンジャーバンド下', 'ストキャスティクス', 'CCI', 'Williams %R',
    '出来高移動平均', '価格変動率', 'ボラティリティ', '相対強度', 'モメンタム',
    '市場全体の動き', 'セクター動向', '金利', '為替', 'VIX', '金価格', '原油価格'
  ],
  featureTypes: [
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical'
  ],
  problemType: 'regression',
  targetName: '翌日終値',
  difficulty: 'hard',
  domain: '金融'
};

// 推薦システムデータセット
export const recommendationDataset: AdvancedProblemDataset = {
  id: 'recommendation_system',
  name: '推薦システム',
  description: 'ユーザー行動からアイテムを推薦する複雑な分類問題',
  data: generateAdvancedRecommendationData(1500),
  featureNames: [
    'ユーザー年齢', 'ユーザー性別', 'ユーザー職業', 'ユーザー収入', 'ユーザー居住地',
    'アイテムカテゴリ', 'アイテム価格', 'アイテム評価', 'アイテム人気度',
    '過去の購入履歴', '過去の評価履歴', '過去の閲覧履歴', 'セッション時間',
    'デバイス種類', '時間帯', '曜日', '季節', 'プロモーション有無',
    '在庫状況', '配送時間', 'レビュー数', 'レビュー平均点', '類似ユーザー評価',
    'アイテム類似度', 'ユーザー類似度', 'トレンド度', '新着度'
  ],
  featureTypes: [
    'numerical', 'categorical', 'categorical', 'numerical', 'categorical',
    'categorical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical',
    'categorical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical'
  ],
  problemType: 'classification',
  targetName: '推薦判定',
  classes: ['非推薦', '推薦'],
  difficulty: 'hard',
  domain: 'EC'
};

// データ生成関数
function generateAdvancedHousingData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 基本情報（常識的な範囲）
    const landArea = Math.random() * 400 + 60; // 60-460坪（約200-1500㎡）
    const buildingArea = Math.random() * 150 + 30; // 30-180坪（約100-600㎡）
    const age = Math.random() * 40 + 5; // 5-45年
    const renovation = Math.random() > 0.7 ? Math.random() * 15 + 5 : 0; // 30%の確率でリノベーション
    const rooms = Math.floor(Math.random() * 6) + 2; // 2-7部屋
    const bathrooms = Math.floor(Math.random() * 3) + 1; // 1-3バス
    const toilets = Math.floor(Math.random() * 3) + 1; // 1-3トイレ
    const floors = Math.floor(Math.random() * 3) + 1; // 1-3階
    const garage = Math.floor(Math.random() * 3); // 0-2台
    const poolOptions = ['なし', 'あり'];
    const pool = poolOptions[Math.random() > 0.9 ? 1 : 0]; // 10%の確率（高級住宅のみ）
    const poolEncoded = poolOptions.indexOf(pool);
    const garden = Math.random() * 80 + 10; // 10-90坪
    const stationDistance = Math.random() * 1500 + 100; // 100-1600m
    const schoolDistance = Math.random() * 800 + 200; // 200-1000m
    const hospitalDistance = Math.random() * 1500 + 300; // 300-1800m
    const commercialDistance = Math.random() * 800 + 200; // 200-1000m
    const crimeRate = Math.random() * 5 + 1; // 1-6（犯罪率は低い）
    const populationDensity = Math.random() * 8000 + 2000; // 2000-10000人/km²
    const averageIncome = Math.random() * 800 + 400; // 400-1200万円
    const transportAccess = Math.random() * 8 + 2; // 2-10（交通利便性）
    const environmentScore = Math.random() * 8 + 2; // 2-10（環境スコア）
    const sunlight = Math.random() * 8 + 2; // 2-10（日当たり）
    const noiseLevel = Math.random() * 6 + 1; // 1-7（騒音レベル）
    const viewScore = Math.random() * 8 + 2; // 2-10（景観スコア）
    const security = Math.random() * 8 + 2; // 2-10（セキュリティ）
    
    // カテゴリカル変数
    const regions = ['都心部', '郊外', '住宅街', '高級住宅地', '新興住宅地'];
    const buildingStructures = ['木造', '鉄骨造', 'RC造', 'SRC造'];
    const ageCategories = ['新築', '築浅', '中古', '古い'];
    const renovationStatus = ['リノベーション済み', 'リノベーションなし'];
    const directions = ['南', '南東', '南西', '東', '西', '北東', '北西', '北'];
    const cornerRoomOptions = ['なし', 'あり'];
    const cornerRoom = cornerRoomOptions[Math.random() > 0.7 ? 1 : 0]; // 30%の確率
    const cornerRoomEncoded = cornerRoomOptions.indexOf(cornerRoom);
    
    const penthouseOptions = ['なし', 'あり'];
    const penthouse = penthouseOptions[Math.random() > 0.95 ? 1 : 0]; // 5%の確率
    const penthouseEncoded = penthouseOptions.indexOf(penthouse);
    const mansionTypes = ['分譲マンション', '賃貸マンション', 'タワーマンション', '低層マンション'];
    
    const region = regions[Math.floor(Math.random() * regions.length)];
    const buildingStructure = buildingStructures[Math.floor(Math.random() * buildingStructures.length)];
    const ageCategory = age < 5 ? ageCategories[0] : age < 15 ? ageCategories[1] : age < 30 ? ageCategories[2] : ageCategories[3];
    const renovationStatusValue = renovation > 0 ? renovationStatus[0] : renovationStatus[1];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const mansionType = mansionTypes[Math.floor(Math.random() * mansionTypes.length)];
    
    // カテゴリカル変数を数値にエンコード
    const regionEncoded = regions.indexOf(region);
    const buildingStructureEncoded = buildingStructures.indexOf(buildingStructure);
    const ageCategoryEncoded = ageCategories.indexOf(ageCategory);
    const renovationStatusEncoded = renovationStatus.indexOf(renovationStatusValue);
    const directionEncoded = directions.indexOf(direction);
    const mansionTypeEncoded = mansionTypes.indexOf(mansionType);
    
    // 追加の数値特徴量
    const totalFloors = Math.floor(Math.random() * 20) + 1; // 1-20階
    const parkingFee = Math.random() * 50000 + 10000; // 1-6万円
    const managementFee = Math.random() * 30000 + 5000; // 0.5-3.5万円
    const repairReserve = Math.random() * 20000 + 5000; // 0.5-2.5万円

    // 価格計算（複雑な式）
    let price = landArea * 50 + buildingArea * 100;
    price += (50 - age) * 20; // 築年数による減価
    price += renovation * 10; // リノベーションによる加算
    price += rooms * 50; // 部屋数による加算
    price += bathrooms * 30; // バスルームによる加算
    price += garage * 20; // ガレージによる加算
    price += poolEncoded * 100; // プールによる加算
    price += garden * 5; // 庭による加算
    price -= stationDistance * 0.1; // 駅距離による減価
    price += (10 - crimeRate) * 10; // 犯罪率による減価
    price += averageIncome * 0.1; // 平均所得による加算
    price += transportAccess * 5; // 交通利便性による加算
    price += environmentScore * 10; // 環境スコアによる加算
    price += sunlight * 5; // 日当たりによる加算
    price -= noiseLevel * 2; // 騒音による減価
    price += viewScore * 8; // 景観による加算
    price += security * 5; // セキュリティによる加算
    
    // 地域による価格調整
    price *= (regionEncoded === 0 ? 1.5 : regionEncoded === 1 ? 0.8 : regionEncoded === 2 ? 1.0 : regionEncoded === 3 ? 1.3 : 1.1);
    
    // 建物構造による価格調整
    price *= (buildingStructureEncoded === 0 ? 0.7 : buildingStructureEncoded === 1 ? 0.9 : buildingStructureEncoded === 2 ? 1.2 : 1.4);

    // ノイズを追加
    price += (Math.random() - 0.5) * price * 0.2;

    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.15) { // 15%の確率で欠損値あり
      // 築年数が古い場合、リノベーション年が欠損しやすい
      if (age > 30 && Math.random() < 0.8) {
        missingIndices.push(3); // リノベーション年
      }
      
      // 高級住宅でない場合、プール情報が欠損しやすい
      if (price < 5000 && Math.random() < 0.6) {
        missingIndices.push(9); // プール有無
      }
      
      // 郊外の場合、商業施設距離が欠損しやすい
      if (regionEncoded === 1 && Math.random() < 0.7) {
        missingIndices.push(14); // 商業施設距離
      }
      
      // 古い建物の場合、セキュリティ情報が欠損しやすい
      if (age > 20 && Math.random() < 0.5) {
        missingIndices.push(23); // セキュリティ
      }
      
      // 低価格帯の場合、管理費情報が欠損しやすい
      if (price < 3000 && Math.random() < 0.4) {
        missingIndices.push(34); // 管理費
      }
    }

    // 特徴量配列を作成（カテゴリカル変数は文字列、数値変数は数値、欠損値はNaN）
    const features = [
      landArea, buildingArea, age, renovation, rooms, bathrooms, toilets, floors,
      garage, pool, garden, stationDistance, schoolDistance, hospitalDistance,
      commercialDistance, crimeRate, populationDensity, averageIncome,
      transportAccess, environmentScore, sunlight, noiseLevel, viewScore, security,
      region, buildingStructure, ageCategory, renovationStatus,
      direction, totalFloors, cornerRoom, penthouse, mansionType,
      parkingFee, managementFee, repairReserve
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: Math.max(0, Math.round(price))
    });
  }
  return data;
}

function generateAdvancedCustomerData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 年齢: 整数で現実的な分布
    const age = Math.random() < 0.4 ? Math.floor(Math.random() * 30) + 20 : // 40%が20-49歳
                Math.random() < 0.8 ? Math.floor(Math.random() * 30) + 50 : // 40%が50-79歳
                Math.floor(Math.random() * 20) + 80; // 20%が80-99歳
    
    // 性別: カテゴリカル変数として適切に処理
    const genders = ['男性', '女性'];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const genderEncoded = genders.indexOf(gender);
    
    // 年収: 整数で現実的な分布（万円単位）
    const income = Math.random() < 0.6 ? 
      Math.floor(Math.random() * 500) + 300 : // 60%が300-799万円
      Math.floor(Math.random() * 1200) + 800; // 40%が800-1999万円
    
    // 家族構成: カテゴリカル変数として適切に処理
    const familySizes = ['1人', '2人', '3人', '4人', '5人以上'];
    const familySize = familySizes[Math.floor(Math.random() * familySizes.length)];
    const familySizeEncoded = familySizes.indexOf(familySize);
    
    // 居住地: カテゴリカル変数として適切に処理
    const residences = ['東京都', '大阪府', '神奈川県', '愛知県', '埼玉県', '千葉県', '兵庫県', '福岡県', '北海道', 'その他'];
    const residence = residences[Math.floor(Math.random() * residences.length)];
    const residenceEncoded = residences.indexOf(residence);
    
    // 職業: カテゴリカル変数として適切に処理
    const occupations = ['会社員', '自営業', '公務員', '学生', '主婦', 'フリーランス', 'その他'];
    const occupation = occupations[Math.floor(Math.random() * occupations.length)];
    const occupationEncoded = occupations.indexOf(occupation);
    
    // 教育レベル: カテゴリカル変数として適切に処理
    const educationLevels = ['高校卒', '専門学校卒', '大学卒', '大学院卒', 'その他'];
    const education = educationLevels[Math.floor(Math.random() * educationLevels.length)];
    const educationEncoded = educationLevels.indexOf(education);
    
    // 契約期間: 整数で現実的な分布（月単位）
    const contractPeriod = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 24) + 1 : // 70%が1-24ヶ月
      Math.floor(Math.random() * 36) + 24; // 30%が24-59ヶ月
    
    const monthlyFee = Math.floor(Math.random() * 30000) + 2000; // 2000-31999円
    const supportCount = Math.floor(Math.random() * 16); // 0-15回
    const satisfaction = Math.floor(Math.random() * 11); // 0-10
    const serviceCount = Math.floor(Math.random() * 8) + 1; // 1-8サービス
    const creditScore = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 200) + 600 : // 70%が600-799
      Math.floor(Math.random() * 400) + 200; // 30%が200-599
    const pastCancellations = Math.random() < 0.8 ? 
      Math.floor(Math.random() * 2) : // 80%が0-1回
      Math.floor(Math.random() * 3) + 2; // 20%が2-4回
    const referrals = Math.floor(Math.random() * 8); // 0-7回
    const socialActivity = Math.floor(Math.random() * 11); // 0-10
    const purchaseFrequency = Math.floor(Math.random() * 21); // 0-20回/月
    const averagePurchase = Math.floor(Math.random() * 50000) + 5000; // 5000-54999円
    const categoryDiversity = Math.floor(Math.random() * 11); // 0-10
    const seasonality = Math.floor(Math.random() * 11); // 0-10
    const timeBias = Math.floor(Math.random() * 11); // 0-10
    
    // デバイス種類: カテゴリカル変数として適切に処理
    const deviceTypes = ['PC', 'スマートフォン', 'タブレット', 'その他'];
    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    const deviceTypeEncoded = deviceTypes.indexOf(deviceType);
    
    // 支払い方法: カテゴリカル変数として適切に処理
    const paymentMethods = ['現金', 'クレジットカード', 'デビットカード', '電子マネー', 'その他'];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const paymentMethodEncoded = paymentMethods.indexOf(paymentMethod);
    
    const promotionResponse = Math.random() * 10; // 0-10
    
    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.12) { // 12%の確率で欠損値あり
      // 学生の場合、年収情報が欠損しやすい
      if (occupation === '学生' && Math.random() < 0.8) {
        missingIndices.push(2); // 年収
      }
      
      // 高齢者の場合、SNS活動度が欠損しやすい
      if (age > 65 && Math.random() < 0.7) {
        missingIndices.push(15); // SNS活動度
      }
      
      // 短期契約の場合、推奨回数が欠損しやすい
      if (contractPeriod < 6 && Math.random() < 0.6) {
        missingIndices.push(14); // 推奨回数
      }
      
      // 低満足度の場合、サポート回数が欠損しやすい
      if (satisfaction < 3 && Math.random() < 0.5) {
        missingIndices.push(9); // サポート回数
      }
      
      // 新規顧客の場合、過去の解約回数が欠損しやすい
      if (contractPeriod < 3 && Math.random() < 0.4) {
        missingIndices.push(13); // 過去の解約回数
      }
    }

    // 生涯価値計算（より現実的なロジック）
    let lifetimeValue = income * 0.05; // 基本価値（年収の5%）
    lifetimeValue += satisfaction * 500; // 満足度による加算
    lifetimeValue += serviceCount * 300; // サービス数による加算
    lifetimeValue += contractPeriod * 50; // 契約期間による加算
    lifetimeValue += referrals * 1000; // 推奨による加算
    lifetimeValue += purchaseFrequency * 50; // 購買頻度による加算
    lifetimeValue += averagePurchase * 0.05; // 平均購入額による加算
    lifetimeValue -= pastCancellations * 2000; // 解約による減価
    lifetimeValue += creditScore * 5; // クレジットスコアによる加算
    lifetimeValue += socialActivity * 200; // SNS活動による加算
    
    // 職業による調整
    if (occupation === '会社員') lifetimeValue *= 1.2;
    if (occupation === '自営業') lifetimeValue *= 1.1;
    if (occupation === '学生') lifetimeValue *= 0.5;
    
    // 年齢による調整
    if (age > 60) lifetimeValue *= 0.8;
    if (age < 30) lifetimeValue *= 1.1;

    // ノイズを追加
    lifetimeValue += (Math.random() - 0.5) * lifetimeValue * 0.2;

    // 特徴量配列を作成
    const features = [
      age, gender, income, familySize, residence, occupation, education,
      contractPeriod, monthlyFee, supportCount, satisfaction, serviceCount,
      creditScore, pastCancellations, referrals, socialActivity, purchaseFrequency,
      averagePurchase, categoryDiversity, seasonality, timeBias, deviceType,
      paymentMethod, promotionResponse
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: Math.max(0, Math.round(lifetimeValue))
    });
  }
  return data;
}

function generateAdvancedFraudData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 取引金額: 整数で現実的な分布（小額取引が多い）
    const amount = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 50000) + 1000 : // 70%が1-49999円
      Math.floor(Math.random() * 200000) + 50000; // 30%が5-249999円
    
    // 取引時間: 0-24時間の範囲で適切に（小数点あり）
    const time = Math.random() * 24; // 0-24時
    
    // 取引場所: 0-100のスコア（整数）
    const location = Math.floor(Math.random() * 101); // 0-100（場所スコア）
    
    // 前回取引からの時間: 整数で現実的な分布（分単位）
    const timeSinceLast = Math.random() < 0.6 ? 
      Math.floor(Math.random() * 60) + 1 : // 60%が1-60分
      Math.floor(Math.random() * 1440) + 60; // 40%が60-1499分
    
    // 前回取引金額: 現在の取引金額と相関（整数）
    const lastAmount = Math.floor(amount * (0.8 + Math.random() * 0.4)); // 現在の80-120%
    
    // 月間取引回数: 整数で現実的な分布
    const monthlyTransactions = Math.random() < 0.5 ? 
      Math.floor(Math.random() * 20) + 1 : // 50%が1-20回
      Math.floor(Math.random() * 30) + 20; // 50%が20-49回
    
    // 月間取引総額: 取引回数と相関（整数）
    const monthlyAmount = Math.floor(monthlyTransactions * (amount * (0.5 + Math.random() * 1.0)));
    
    // 時間帯: カテゴリカル変数として適切に処理
    const timePeriods = ['深夜', '早朝', '朝', '昼', '夕方', '夜'];
    const timePeriod = timePeriods[Math.floor(Math.random() * timePeriods.length)];
    const timePeriodEncoded = timePeriods.indexOf(timePeriod);
    
    // 曜日: カテゴリカル変数として適切に処理
    const daysOfWeek = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];
    const dayOfWeek = daysOfWeek[Math.floor(Math.random() * daysOfWeek.length)];
    const dayOfWeekEncoded = daysOfWeek.indexOf(dayOfWeek);
    
    // 季節: カテゴリカル変数として適切に処理
    const seasons = ['春', '夏', '秋', '冬'];
    const season = seasons[Math.floor(Math.random() * seasons.length)];
    const seasonEncoded = seasons.indexOf(season);
    
    // カード種類: カテゴリカル変数として適切に処理
    const cardTypes = ['クレジットカード', 'デビットカード', 'プリペイドカード', '電子マネー', 'その他'];
    const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    const cardTypeEncoded = cardTypes.indexOf(cardType);
    
    // 加盟店カテゴリ: カテゴリカル変数として適切に処理
    const merchantCategories = ['小売店', 'レストラン', 'ガソリンスタンド', 'オンライン', '交通機関', '医療', '娯楽', 'その他'];
    const merchantCategory = merchantCategories[Math.floor(Math.random() * merchantCategories.length)];
    const merchantCategoryEncoded = merchantCategories.indexOf(merchantCategory);
    
    // 地理的距離: より現実的な分布
    const geoDistance = Math.random() < 0.8 ? 
      Math.random() * 50 + 1 : // 80%が1-50km
      Math.random() * 950 + 50; // 20%が50-1000km
    
    // 異常度スコア: 0-10の範囲で適切に
    const anomalyScore = Math.random() * 10; // 0-10
    
    // リスクスコア: 0-10の範囲で適切に
    const riskScore = Math.random() * 10; // 0-10
    
    // 過去の拒否回数: より現実的な分布
    const pastRejections = Math.random() < 0.9 ? 
      Math.floor(Math.random() * 3) : // 90%が0-2回
      Math.floor(Math.random() * 7) + 3; // 10%が3-9回
    
    // 信用度: 整数で現実的な分布
    const creditScore = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 200) + 600 : // 70%が600-799
      Math.floor(Math.random() * 400) + 200; // 30%が200-599
    
    // 年収: 整数で現実的な分布（万円単位）
    const income = Math.random() < 0.6 ? 
      Math.floor(Math.random() * 500) + 300 : // 60%が300-799万円
      Math.floor(Math.random() * 1200) + 800; // 40%が800-1999万円
    
    // 職業: カテゴリカル変数として適切に処理
    const occupations = ['会社員', '自営業', '公務員', '学生', '主婦', 'フリーランス', 'その他'];
    const occupation = occupations[Math.floor(Math.random() * occupations.length)];
    const occupationEncoded = occupations.indexOf(occupation);
    
    // 居住期間: 整数で現実的な分布（年単位）
    const residencePeriod = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 10) + 1 : // 70%が1-10年
      Math.floor(Math.random() * 20) + 10; // 30%が10-29年
    
    // 家族構成: カテゴリカル変数として適切に処理
    const familySizes = ['1人', '2人', '3人', '4人', '5人以上'];
    const familySize = familySizes[Math.floor(Math.random() * familySizes.length)];
    const familySizeEncoded = familySizes.indexOf(familySize);
    
    // 過去の詐欺被害: カテゴリカル変数として適切に処理
    const pastFraudOptions = ['なし', 'あり'];
    const pastFraud = pastFraudOptions[Math.random() > 0.95 ? 1 : 0]; // 5%の確率
    const pastFraudEncoded = pastFraudOptions.indexOf(pastFraud);
    
    // 保険加入状況: カテゴリカル変数として適切に処理
    const insuranceOptions = ['未加入', '加入'];
    const insurance = insuranceOptions[Math.random() > 0.3 ? 1 : 0]; // 70%の確率
    const insuranceEncoded = insuranceOptions.indexOf(insurance);
    
    // 連絡先確認状況: カテゴリカル変数として適切に処理
    const contactOptions = ['未確認', '確認済み'];
    const contactVerified = contactOptions[Math.random() > 0.2 ? 1 : 0]; // 80%の確率
    const contactVerifiedEncoded = contactOptions.indexOf(contactVerified);
    
    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.08) { // 8%の確率で欠損値あり
      // 小額取引の場合、地理的距離が欠損しやすい
      if (amount < 10000 && Math.random() < 0.6) {
        missingIndices.push(12); // 地理的距離
      }
      
      // 深夜の取引の場合、加盟店カテゴリが欠損しやすい
      if (time < 6 || time > 22) {
        if (Math.random() < 0.5) {
          missingIndices.push(11); // 加盟店カテゴリ
        }
      }
      
      // 新規カードの場合、過去の拒否回数が欠損しやすい
      if (creditScore > 700 && Math.random() < 0.7) {
        missingIndices.push(15); // 過去の拒否回数
      }
      
      // 高齢者の場合、SNS活動度が欠損しやすい
      if (Math.random() < 0.3) {
        missingIndices.push(19); // デバイス種類
      }
    }

    // 詐欺判定ロジック（より現実的なロジック）
    let isFraud = 0;
    if (amount > 100000) isFraud += 0.2; // 高額取引（10万円以上）
    if (time < 6 || time > 22) isFraud += 0.3; // 深夜・早朝
    if (geoDistance > 200) isFraud += 0.4; // 遠距離（200km以上）
    if (anomalyScore > 7) isFraud += 0.5; // 異常度
    if (riskScore > 8) isFraud += 0.4; // リスクスコア
    if (pastRejections > 2) isFraud += 0.3; // 過去の拒否
    if (creditScore < 400) isFraud += 0.3; // 低クレジット
    if (pastFraud === 'あり') isFraud += 0.6; // 過去の詐欺
    if (contactVerified === '未確認') isFraud += 0.2; // 連絡先未確認
    if (timeSinceLast < 5) isFraud += 0.3; // 短時間での連続取引

    // ランダム要素を追加
    isFraud += (Math.random() - 0.5) * 0.2;

    // 特徴量配列を作成
    const features = [
      amount, time, location, timeSinceLast, lastAmount, monthlyTransactions,
      monthlyAmount, timePeriod, dayOfWeek, season, cardType, merchantCategory,
      geoDistance, anomalyScore, riskScore, pastRejections, creditScore,
      income, occupation, residencePeriod, familySize, pastFraud, insurance,
      contactVerified
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: isFraud > 0.5 ? 1 : 0
    });
  }
  return data;
}

function generateAdvancedMedicalData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 年齢: 整数で現実的な分布（若年層が多い）
    const age = Math.random() < 0.3 ? Math.floor(Math.random() * 30) + 20 : // 30%が20-49歳
                Math.random() < 0.6 ? Math.floor(Math.random() * 30) + 50 : // 30%が50-79歳
                Math.floor(Math.random() * 20) + 80; // 40%が80-99歳
    
    // 性別: カテゴリカル変数として適切に処理
    const genders = ['男性', '女性'];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const genderEncoded = genders.indexOf(gender);
    
    // 身長・体重: 性別に応じた現実的な値（整数）
    const isMale = gender === '男性';
    const height = isMale ? 
      Math.floor(Math.random() * 20) + 160 : // 男性: 160-179cm
      Math.floor(Math.random() * 20) + 150;  // 女性: 150-169cm
    const weight = isMale ?
      Math.floor(Math.random() * 30) + 60 :  // 男性: 60-89kg
      Math.floor(Math.random() * 25) + 45;   // 女性: 45-69kg
    
    const bmi = Math.round((weight / ((height / 100) ** 2)) * 10) / 10; // 小数点第1位まで
    
    // 血圧: 整数で現実的な分布（異常値も含む）
    const systolicBP = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 20) + 110 : // 70%が正常範囲
      Math.floor(Math.random() * 40) + 130;  // 30%が異常値
    const diastolicBP = Math.random() < 0.7 ?
      Math.floor(Math.random() * 15) + 70 :  // 70%が正常範囲
      Math.floor(Math.random() * 25) + 85;   // 30%が異常値
    
    const heartRate = Math.floor(Math.random() * 40) + 60; // 60-99bpm
    const temperature = Math.random() < 0.9 ?
      Math.round((Math.random() * 0.5 + 36.5) * 10) / 10 : // 90%が正常（小数点第1位）
      Math.round((Math.random() * 1.5 + 37.5) * 10) / 10;  // 10%が発熱（小数点第1位）
    
    // 検査値: 整数で現実的な分布
    const bloodSugar = Math.random() < 0.8 ?
      Math.floor(Math.random() * 40) + 80 :   // 80%が正常
      Math.floor(Math.random() * 100) + 120;  // 20%が異常
    const cholesterol = Math.random() < 0.6 ?
      Math.floor(Math.random() * 50) + 150 :  // 60%が正常
      Math.floor(Math.random() * 100) + 200;  // 40%が異常
    
    const hemoglobin = Math.round((Math.random() * 3 + 11) * 10) / 10; // 11-14g/dL（小数点第1位）
    const whiteBloodCells = Math.floor(Math.random() * 4000) + 5000; // 5000-8999/μL
    const redBloodCells = Math.round((Math.random() * 1 + 4.5) * 100) / 100; // 4.5-5.5M/μL（小数点第2位）
    const platelets = Math.floor(Math.random() * 100000) + 200000; // 200000-299999/μL
    const liverFunction = Math.floor(Math.random() * 50) + 30; // 30-79
    const kidneyFunction = Math.floor(Math.random() * 50) + 30; // 30-79
    
    // 症状: カテゴリカル変数として適切に処理
    const symptomOptions = ['なし', 'あり'];
    const symptoms = [
      symptomOptions[Math.random() > 0.8 ? 1 : 0], // 症状1: 20%の確率
      symptomOptions[Math.random() > 0.9 ? 1 : 0], // 症状2: 10%の確率
      symptomOptions[Math.random() > 0.7 ? 1 : 0], // 症状3: 30%の確率
      symptomOptions[Math.random() > 0.85 ? 1 : 0], // 症状4: 15%の確率
      symptomOptions[Math.random() > 0.75 ? 1 : 0], // 症状5: 25%の確率
      symptomOptions[Math.random() > 0.9 ? 1 : 0], // 症状6: 10%の確率
      symptomOptions[Math.random() > 0.8 ? 1 : 0], // 症状7: 20%の確率
      symptomOptions[Math.random() > 0.85 ? 1 : 0], // 症状8: 15%の確率
      symptomOptions[Math.random() > 0.7 ? 1 : 0], // 症状9: 30%の確率
      symptomOptions[Math.random() > 0.9 ? 1 : 0]  // 症状10: 10%の確率
    ];
    const symptomsEncoded = symptoms.map(s => symptomOptions.indexOf(s));
    
    // 生活習慣: カテゴリカル変数として適切に処理
    const historyLevels = ['なし', '軽度', '中程度', '重度', '非常に重度'];
    const medicalHistory = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const medicalHistoryEncoded = historyLevels.indexOf(medicalHistory);
    
    const familyHistory = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const familyHistoryEncoded = historyLevels.indexOf(familyHistory);
    
    const smoking = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const smokingEncoded = historyLevels.indexOf(smoking);
    
    const drinking = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const drinkingEncoded = historyLevels.indexOf(drinking);
    
    const exercise = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const exerciseEncoded = historyLevels.indexOf(exercise);
    
    const sleep = Math.floor(Math.random() * 4) + 6; // 6-9時間（整数）
    
    const stressLevels = ['なし', '軽度', '中程度', '重度', '非常に重度'];
    const stress = stressLevels[Math.floor(Math.random() * stressLevels.length)];
    const stressEncoded = stressLevels.indexOf(stress);
    
    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.18) { // 18%の確率で欠損値あり
      // 若年者の場合、既往歴が欠損しやすい
      if (age < 30 && Math.random() < 0.6) {
        missingIndices.push(27); // 既往歴
      }
      
      // 高齢者の場合、家族歴が欠損しやすい
      if (age > 70 && Math.random() < 0.5) {
        missingIndices.push(28); // 家族歴
      }
      
      // 健康な人の場合、症状情報が欠損しやすい
      if (bmi >= 18.5 && bmi <= 25 && systolicBP < 120 && diastolicBP < 80) {
        if (Math.random() < 0.7) {
          // 症状1-10のうちランダムに1-3個を欠損
          const symptomIndices = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
          const numMissing = Math.floor(Math.random() * 3) + 1;
          const shuffled = symptomIndices.sort(() => 0.5 - Math.random());
          missingIndices.push(...shuffled.slice(0, numMissing));
        }
      }
      
      // 緊急事態の場合、生活習慣情報が欠損しやすい
      if (temperature > 38 || systolicBP > 180 || diastolicBP > 110) {
        if (Math.random() < 0.8) {
          missingIndices.push(30); // 喫煙歴
          missingIndices.push(31); // 飲酒歴
          missingIndices.push(32); // 運動習慣
        }
      }
      
      // 低所得者の場合、詳細な検査値が欠損しやすい
      if (Math.random() < 0.4) {
        missingIndices.push(10); // 血糖値
        missingIndices.push(11); // コレステロール
      }
    }

    // 診断結果判定（より現実的なロジック）
    let diagnosis = 0; // 0: 健康, 1: 軽症, 2: 中症, 3: 重症, 4: 要入院
    
    // 年齢による基本リスク
    if (age > 70) diagnosis += 1;
    if (age > 85) diagnosis += 1;
    
    // 検査値による判定
    if (bmi > 30 || bmi < 18.5) diagnosis += 1; // BMI異常
    if (systolicBP > 140 || diastolicBP > 90) diagnosis += 1; // 高血圧
    if (bloodSugar > 126) diagnosis += 2; // 糖尿病
    if (cholesterol > 240) diagnosis += 1; // 高コレステロール
    if (temperature > 37.5) diagnosis += 1; // 発熱
    if (heartRate > 100 || heartRate < 50) diagnosis += 1; // 心拍数異常
    
    // 症状による判定
    const symptomCount = symptomsEncoded.filter(s => s === 1).length;
    if (symptomCount > 3) diagnosis += 1;
    if (symptomCount > 6) diagnosis += 1;
    
    // 生活習慣による判定
    if (medicalHistoryEncoded > 2) diagnosis += 1; // 既往歴（中程度以上）
    if (familyHistoryEncoded > 2) diagnosis += 1; // 家族歴（中程度以上）
    if (smokingEncoded > 2) diagnosis += 1; // 喫煙（中程度以上）
    if (stressEncoded > 3) diagnosis += 1; // 高ストレス（重度以上）
    if (sleep < 6 || sleep > 9) diagnosis += 1; // 睡眠異常

    // ランダム要素を追加
    diagnosis += Math.floor(Math.random() * 3) - 1;
    diagnosis = Math.max(0, Math.min(4, diagnosis));

    // 特徴量配列を作成
    const features = [
      age, gender, height, weight, bmi, systolicBP, diastolicBP, heartRate,
      temperature, bloodSugar, cholesterol, hemoglobin, whiteBloodCells,
      redBloodCells, platelets, liverFunction, kidneyFunction, ...symptoms,
      medicalHistory, familyHistory, smoking, drinking, exercise, sleep, stress
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: diagnosis
    });
  }
  return data;
}

function generateAdvancedStockData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  let basePrice = 1000; // 基準価格

  for (let i = 0; i < count; i++) {
    // 価格変動をシミュレート
    const change = (Math.random() - 0.5) * 0.1; // -5% to +5%
    basePrice *= (1 + change);
    
    const prevClose = basePrice;
    const prevHigh = prevClose * (1 + Math.random() * 0.05);
    const prevLow = prevClose * (1 - Math.random() * 0.05);
    const volume = Math.random() * 1000000 + 100000;
    const ma5 = prevClose * (1 + (Math.random() - 0.5) * 0.02);
    const ma20 = prevClose * (1 + (Math.random() - 0.5) * 0.05);
    const ma50 = prevClose * (1 + (Math.random() - 0.5) * 0.1);
    const ma200 = prevClose * (1 + (Math.random() - 0.5) * 0.2);
    const rsi = Math.random() * 100;
    const macd = (Math.random() - 0.5) * 10;
    const bbUpper = prevClose * (1 + Math.random() * 0.1);
    const bbLower = prevClose * (1 - Math.random() * 0.1);
    const stoch = Math.random() * 100;
    const cci = (Math.random() - 0.5) * 200;
    const williams = (Math.random() - 0.5) * 100;
    const volumeMA = volume * (1 + (Math.random() - 0.5) * 0.2);
    const priceChange = (Math.random() - 0.5) * 0.1;
    const volatility = Math.random() * 0.5;
    const relativeStrength = Math.random() * 10;
    const momentum = (Math.random() - 0.5) * 20;
    const marketMovement = (Math.random() - 0.5) * 0.1;
    const sectorTrend = (Math.random() - 0.5) * 0.1;
    const interestRate = Math.random() * 5 + 1;
    const exchangeRate = Math.random() * 50 + 100;
    const vix = Math.random() * 50 + 10;
    const goldPrice = Math.random() * 1000 + 1500;
    const oilPrice = Math.random() * 50 + 50;

    // 翌日終値予測（簡略化）
    let nextClose = prevClose;
    nextClose += (ma5 - prevClose) * 0.1;
    nextClose += (ma20 - prevClose) * 0.05;
    nextClose += (rsi - 50) * 0.01;
    nextClose += macd * 0.1;
    nextClose += marketMovement * prevClose;
    nextClose += sectorTrend * prevClose;
    nextClose += (Math.random() - 0.5) * prevClose * 0.02; // ランダム要素

    data.push({
      features: [
        prevClose, prevHigh, prevLow, volume, ma5, ma20, ma50, ma200,
        rsi, macd, bbUpper, bbLower, stoch, cci, williams, volumeMA,
        priceChange, volatility, relativeStrength, momentum, marketMovement,
        sectorTrend, interestRate, exchangeRate, vix, goldPrice, oilPrice
      ],
      label: Math.max(0, nextClose)
    });
  }
  return data;
}

function generateAdvancedRecommendationData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    const userAge = Math.random() * 60 + 18; // 18-78歳
    const userGender = Math.random() > 0.5 ? 1 : 0; // 0: 女性, 1: 男性
    const userOccupation = Math.random() * 10; // 0-10
    const userIncome = Math.random() * 2000 + 200; // 200-2200万円
    const userLocation = Math.random() * 10; // 0-10
    const itemCategory = Math.random() * 20; // 0-20
    const itemPrice = Math.random() * 100000 + 1000; // 1000-101000円
    const itemRating = Math.random() * 5; // 0-5
    const itemPopularity = Math.random() * 10; // 0-10
    const purchaseHistory = Math.random() * 100; // 0-100回
    const ratingHistory = Math.random() * 50; // 0-50回
    const viewHistory = Math.random() * 200; // 0-200回
    const sessionTime = Math.random() * 3600; // 0-3600秒
    const deviceType = Math.random() * 3; // 0-3
    const timeOfDay = Math.random() * 24; // 0-24時
    const dayOfWeek = Math.random() * 7; // 0-7日
    const season = Math.random() * 4; // 0-4季節
    const hasPromotion = Math.random() > 0.5 ? 1 : 0; // 50%の確率
    const stockStatus = Math.random() * 10; // 0-10
    const deliveryTime = Math.random() * 7; // 0-7日
    const reviewCount = Math.floor(Math.random() * 1000); // 0-999回
    const reviewAverage = Math.random() * 5; // 0-5
    const similarUserRating = Math.random() * 5; // 0-5
    const itemSimilarity = Math.random() * 10; // 0-10
    const userSimilarity = Math.random() * 10; // 0-10
    const trendScore = Math.random() * 10; // 0-10
    const noveltyScore = Math.random() * 10; // 0-10

    // 推薦判定ロジック
    let recommendation = 0; // 0: 非推薦, 1: 推薦
    if (itemRating > 4) recommendation += 0.3; // 高評価
    if (itemPopularity > 7) recommendation += 0.2; // 人気
    if (purchaseHistory > 50) recommendation += 0.2; // 購買履歴
    if (ratingHistory > 20) recommendation += 0.1; // 評価履歴
    if (sessionTime > 1800) recommendation += 0.1; // 長時間セッション
    if (similarUserRating > 4) recommendation += 0.2; // 類似ユーザー評価
    if (itemSimilarity > 7) recommendation += 0.3; // アイテム類似度
    if (userSimilarity > 7) recommendation += 0.2; // ユーザー類似度
    if (trendScore > 7) recommendation += 0.1; // トレンド
    if (hasPromotion) recommendation += 0.1; // プロモーション

    // ランダム要素を追加
    recommendation += (Math.random() - 0.5) * 0.2;

    data.push({
      features: [
        userAge, userGender, userOccupation, userIncome, userLocation,
        itemCategory, itemPrice, itemRating, itemPopularity, purchaseHistory,
        ratingHistory, viewHistory, sessionTime, deviceType, timeOfDay,
        dayOfWeek, season, hasPromotion, stockStatus, deliveryTime,
        reviewCount, reviewAverage, similarUserRating, itemSimilarity,
        userSimilarity, trendScore, noveltyScore
      ],
      label: recommendation > 0.5 ? 1 : 0
    });
  }
  return data;
}

// ランダムにデータセットを取得
export function getRandomAdvancedProblemDataset(): AdvancedProblemDataset {
  const datasets = [
    advancedHousingDataset,
    customerLifetimeValueDataset,
    fraudDetectionDataset,
    medicalDiagnosisDataset,
    stockMarketDataset,
    recommendationDataset
  ];
  
  const randomIndex = Math.floor(Math.random() * datasets.length);
  return datasets[randomIndex];
}

export interface AdvancedProblemDataset {
  id: string;
  name: string;
  description: string;
  data: { features: (number | string)[]; label: number | string }[]; // カテゴリカル変数は文字列として格納
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[]; // 特徴量のタイプ
  problemType: 'classification' | 'regression';
  targetName: string;
  classes?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  domain: string;
}

// 高度な住宅価格予測データセット
export const advancedHousingDataset: AdvancedProblemDataset = {
  id: 'advanced_housing',
  name: '高級住宅価格予測',
  description: '複雑な住宅データから価格を予測する高度な回帰問題',
  data: generateAdvancedHousingData(1500),
  featureNames: [
    '土地面積', '建物面積', '築年数', 'リノベーション年', '部屋数', 'バスルーム数', 
    'トイレ数', '階数', 'ガレージ台数', 'プール有無', '庭面積', '最寄り駅距離',
    '学校距離', '病院距離', '商業施設距離', '犯罪率', '人口密度', '平均所得',
    '交通利便性', '環境スコア', '日当たり', '騒音レベル', '景観スコア', 'セキュリティ',
    '地域', '建物構造', '築年数カテゴリ', 'リノベーション有無', '向き', '総階数',
    '角部屋', 'ペントハウス', 'マンション種別', '駐車場料金', '管理費', '修繕積立金'
  ],
  featureTypes: [
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'categorical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'numerical',
    'categorical', 'categorical', 'categorical', 'numerical', 'numerical', 'numerical'
  ],
  problemType: 'regression',
  targetName: '価格（万円）',
  difficulty: 'hard',
  domain: '不動産'
};

// 顧客生涯価値予測データセット
export const customerLifetimeValueDataset: AdvancedProblemDataset = {
  id: 'customer_lifetime_value',
  name: '顧客生涯価値予測',
  description: '顧客の行動パターンから生涯価値を予測する複雑な回帰問題',
  data: generateAdvancedCustomerData(1500),
  featureNames: [
    '年齢', '性別', '年収', '家族構成', '居住地', '職業', '教育レベル',
    '契約期間', '月額料金', 'サポート回数', '満足度', 'サービス利用数',
    'クレジットスコア', '過去の解約回数', '推奨回数', 'SNS活動度',
    '購買頻度', '平均購入額', 'カテゴリ多様性', '季節性', '時間帯偏り',
    'デバイス種類', '支払い方法', 'プロモーション反応率'
  ],
  featureTypes: [
    'numerical', 'categorical', 'numerical', 'categorical', 'categorical', 'categorical', 'categorical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'categorical', 'categorical', 'numerical'
  ],
  problemType: 'regression',
  targetName: '生涯価値（万円）',
  difficulty: 'hard',
  domain: 'マーケティング'
};

// 金融詐欺検出データセット
export const fraudDetectionDataset: AdvancedProblemDataset = {
  id: 'fraud_detection',
  name: '金融詐欺検出',
  description: '取引データから詐欺を検出する高度な分類問題',
  data: generateAdvancedFraudData(1500),
  featureNames: [
    '取引金額', '取引時間', '取引場所', '前回取引からの時間', '前回取引金額',
    '月間取引回数', '月間取引総額', '時間帯', '曜日', '季節', 'カード種類',
    '加盟店カテゴリ', '地理的距離', '異常度スコア', 'リスクスコア',
    '過去の拒否回数', '信用度', '年収', '職業', '居住期間', '家族構成',
    '過去の詐欺被害', '保険加入状況', '連絡先確認状況'
  ],
  featureTypes: [
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'categorical', 'categorical', 'categorical', 'categorical',
    'categorical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'categorical', 'numerical', 'categorical',
    'categorical', 'categorical', 'categorical'
  ],
  problemType: 'classification',
  targetName: '詐欺判定',
  classes: ['正常', '詐欺'],
  difficulty: 'hard',
  domain: '金融'
};

// 医療診断支援データセット
export const medicalDiagnosisDataset: AdvancedProblemDataset = {
  id: 'medical_diagnosis',
  name: '医療診断支援',
  description: '患者データから疾病を診断する複雑な分類問題',
  data: generateAdvancedMedicalData(1500),
  featureNames: [
    '年齢', '性別', '身長', '体重', 'BMI', '血圧（収縮期）', '血圧（拡張期）',
    '心拍数', '体温', '血糖値', 'コレステロール', 'ヘモグロビン', '白血球数',
    '赤血球数', '血小板数', '肝機能値', '腎機能値', '症状1', '症状2', '症状3',
    '症状4', '症状5', '症状6', '症状7', '症状8', '症状9', '症状10',
    '既往歴', '家族歴', '喫煙歴', '飲酒歴', '運動習慣', '睡眠時間', 'ストレス度'
  ],
  featureTypes: [
    'numerical', 'categorical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'categorical', 'categorical', 'categorical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'categorical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical', 'numerical', 'categorical'
  ],
  problemType: 'classification',
  targetName: '診断結果',
  classes: ['健康', '軽症', '中症', '重症', '要入院'],
  difficulty: 'hard',
  domain: '医療'
};

// 株式市場予測データセット
export const stockMarketDataset: AdvancedProblemDataset = {
  id: 'stock_market_prediction',
  name: '株式市場予測',
  description: '複雑な市場データから株価を予測する高度な回帰問題',
  data: generateAdvancedStockData(1500),
  featureNames: [
    '前日終値', '前日高値', '前日安値', '前日出来高', '5日移動平均', '20日移動平均',
    '50日移動平均', '200日移動平均', 'RSI', 'MACD', 'ボリンジャーバンド上',
    'ボリンジャーバンド下', 'ストキャスティクス', 'CCI', 'Williams %R',
    '出来高移動平均', '価格変動率', 'ボラティリティ', '相対強度', 'モメンタム',
    '市場全体の動き', 'セクター動向', '金利', '為替', 'VIX', '金価格', '原油価格'
  ],
  featureTypes: [
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical'
  ],
  problemType: 'regression',
  targetName: '翌日終値',
  difficulty: 'hard',
  domain: '金融'
};

// 推薦システムデータセット
export const recommendationDataset: AdvancedProblemDataset = {
  id: 'recommendation_system',
  name: '推薦システム',
  description: 'ユーザー行動からアイテムを推薦する複雑な分類問題',
  data: generateAdvancedRecommendationData(1500),
  featureNames: [
    'ユーザー年齢', 'ユーザー性別', 'ユーザー職業', 'ユーザー収入', 'ユーザー居住地',
    'アイテムカテゴリ', 'アイテム価格', 'アイテム評価', 'アイテム人気度',
    '過去の購入履歴', '過去の評価履歴', '過去の閲覧履歴', 'セッション時間',
    'デバイス種類', '時間帯', '曜日', '季節', 'プロモーション有無',
    '在庫状況', '配送時間', 'レビュー数', 'レビュー平均点', '類似ユーザー評価',
    'アイテム類似度', 'ユーザー類似度', 'トレンド度', '新着度'
  ],
  featureTypes: [
    'numerical', 'categorical', 'categorical', 'numerical', 'categorical',
    'categorical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical',
    'categorical', 'categorical', 'categorical', 'categorical', 'categorical',
    'categorical', 'numerical', 'numerical', 'numerical', 'numerical',
    'numerical', 'numerical', 'numerical', 'numerical'
  ],
  problemType: 'classification',
  targetName: '推薦判定',
  classes: ['非推薦', '推薦'],
  difficulty: 'hard',
  domain: 'EC'
};

// データ生成関数
function generateAdvancedHousingData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 基本情報（常識的な範囲）
    const landArea = Math.random() * 400 + 60; // 60-460坪（約200-1500㎡）
    const buildingArea = Math.random() * 150 + 30; // 30-180坪（約100-600㎡）
    const age = Math.random() * 40 + 5; // 5-45年
    const renovation = Math.random() > 0.7 ? Math.random() * 15 + 5 : 0; // 30%の確率でリノベーション
    const rooms = Math.floor(Math.random() * 6) + 2; // 2-7部屋
    const bathrooms = Math.floor(Math.random() * 3) + 1; // 1-3バス
    const toilets = Math.floor(Math.random() * 3) + 1; // 1-3トイレ
    const floors = Math.floor(Math.random() * 3) + 1; // 1-3階
    const garage = Math.floor(Math.random() * 3); // 0-2台
    const poolOptions = ['なし', 'あり'];
    const pool = poolOptions[Math.random() > 0.9 ? 1 : 0]; // 10%の確率（高級住宅のみ）
    const poolEncoded = poolOptions.indexOf(pool);
    const garden = Math.random() * 80 + 10; // 10-90坪
    const stationDistance = Math.random() * 1500 + 100; // 100-1600m
    const schoolDistance = Math.random() * 800 + 200; // 200-1000m
    const hospitalDistance = Math.random() * 1500 + 300; // 300-1800m
    const commercialDistance = Math.random() * 800 + 200; // 200-1000m
    const crimeRate = Math.random() * 5 + 1; // 1-6（犯罪率は低い）
    const populationDensity = Math.random() * 8000 + 2000; // 2000-10000人/km²
    const averageIncome = Math.random() * 800 + 400; // 400-1200万円
    const transportAccess = Math.random() * 8 + 2; // 2-10（交通利便性）
    const environmentScore = Math.random() * 8 + 2; // 2-10（環境スコア）
    const sunlight = Math.random() * 8 + 2; // 2-10（日当たり）
    const noiseLevel = Math.random() * 6 + 1; // 1-7（騒音レベル）
    const viewScore = Math.random() * 8 + 2; // 2-10（景観スコア）
    const security = Math.random() * 8 + 2; // 2-10（セキュリティ）
    
    // カテゴリカル変数
    const regions = ['都心部', '郊外', '住宅街', '高級住宅地', '新興住宅地'];
    const buildingStructures = ['木造', '鉄骨造', 'RC造', 'SRC造'];
    const ageCategories = ['新築', '築浅', '中古', '古い'];
    const renovationStatus = ['リノベーション済み', 'リノベーションなし'];
    const directions = ['南', '南東', '南西', '東', '西', '北東', '北西', '北'];
    const cornerRoomOptions = ['なし', 'あり'];
    const cornerRoom = cornerRoomOptions[Math.random() > 0.7 ? 1 : 0]; // 30%の確率
    const cornerRoomEncoded = cornerRoomOptions.indexOf(cornerRoom);
    
    const penthouseOptions = ['なし', 'あり'];
    const penthouse = penthouseOptions[Math.random() > 0.95 ? 1 : 0]; // 5%の確率
    const penthouseEncoded = penthouseOptions.indexOf(penthouse);
    const mansionTypes = ['分譲マンション', '賃貸マンション', 'タワーマンション', '低層マンション'];
    
    const region = regions[Math.floor(Math.random() * regions.length)];
    const buildingStructure = buildingStructures[Math.floor(Math.random() * buildingStructures.length)];
    const ageCategory = age < 5 ? ageCategories[0] : age < 15 ? ageCategories[1] : age < 30 ? ageCategories[2] : ageCategories[3];
    const renovationStatusValue = renovation > 0 ? renovationStatus[0] : renovationStatus[1];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const mansionType = mansionTypes[Math.floor(Math.random() * mansionTypes.length)];
    
    // カテゴリカル変数を数値にエンコード
    const regionEncoded = regions.indexOf(region);
    const buildingStructureEncoded = buildingStructures.indexOf(buildingStructure);
    const ageCategoryEncoded = ageCategories.indexOf(ageCategory);
    const renovationStatusEncoded = renovationStatus.indexOf(renovationStatusValue);
    const directionEncoded = directions.indexOf(direction);
    const mansionTypeEncoded = mansionTypes.indexOf(mansionType);
    
    // 追加の数値特徴量
    const totalFloors = Math.floor(Math.random() * 20) + 1; // 1-20階
    const parkingFee = Math.random() * 50000 + 10000; // 1-6万円
    const managementFee = Math.random() * 30000 + 5000; // 0.5-3.5万円
    const repairReserve = Math.random() * 20000 + 5000; // 0.5-2.5万円

    // 価格計算（複雑な式）
    let price = landArea * 50 + buildingArea * 100;
    price += (50 - age) * 20; // 築年数による減価
    price += renovation * 10; // リノベーションによる加算
    price += rooms * 50; // 部屋数による加算
    price += bathrooms * 30; // バスルームによる加算
    price += garage * 20; // ガレージによる加算
    price += poolEncoded * 100; // プールによる加算
    price += garden * 5; // 庭による加算
    price -= stationDistance * 0.1; // 駅距離による減価
    price += (10 - crimeRate) * 10; // 犯罪率による減価
    price += averageIncome * 0.1; // 平均所得による加算
    price += transportAccess * 5; // 交通利便性による加算
    price += environmentScore * 10; // 環境スコアによる加算
    price += sunlight * 5; // 日当たりによる加算
    price -= noiseLevel * 2; // 騒音による減価
    price += viewScore * 8; // 景観による加算
    price += security * 5; // セキュリティによる加算
    
    // 地域による価格調整
    price *= (regionEncoded === 0 ? 1.5 : regionEncoded === 1 ? 0.8 : regionEncoded === 2 ? 1.0 : regionEncoded === 3 ? 1.3 : 1.1);
    
    // 建物構造による価格調整
    price *= (buildingStructureEncoded === 0 ? 0.7 : buildingStructureEncoded === 1 ? 0.9 : buildingStructureEncoded === 2 ? 1.2 : 1.4);

    // ノイズを追加
    price += (Math.random() - 0.5) * price * 0.2;

    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.15) { // 15%の確率で欠損値あり
      // 築年数が古い場合、リノベーション年が欠損しやすい
      if (age > 30 && Math.random() < 0.8) {
        missingIndices.push(3); // リノベーション年
      }
      
      // 高級住宅でない場合、プール情報が欠損しやすい
      if (price < 5000 && Math.random() < 0.6) {
        missingIndices.push(9); // プール有無
      }
      
      // 郊外の場合、商業施設距離が欠損しやすい
      if (regionEncoded === 1 && Math.random() < 0.7) {
        missingIndices.push(14); // 商業施設距離
      }
      
      // 古い建物の場合、セキュリティ情報が欠損しやすい
      if (age > 20 && Math.random() < 0.5) {
        missingIndices.push(23); // セキュリティ
      }
      
      // 低価格帯の場合、管理費情報が欠損しやすい
      if (price < 3000 && Math.random() < 0.4) {
        missingIndices.push(34); // 管理費
      }
    }

    // 特徴量配列を作成（カテゴリカル変数は文字列、数値変数は数値、欠損値はNaN）
    const features = [
      landArea, buildingArea, age, renovation, rooms, bathrooms, toilets, floors,
      garage, pool, garden, stationDistance, schoolDistance, hospitalDistance,
      commercialDistance, crimeRate, populationDensity, averageIncome,
      transportAccess, environmentScore, sunlight, noiseLevel, viewScore, security,
      region, buildingStructure, ageCategory, renovationStatus,
      direction, totalFloors, cornerRoom, penthouse, mansionType,
      parkingFee, managementFee, repairReserve
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: Math.max(0, Math.round(price))
    });
  }
  return data;
}

function generateAdvancedCustomerData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 年齢: 整数で現実的な分布
    const age = Math.random() < 0.4 ? Math.floor(Math.random() * 30) + 20 : // 40%が20-49歳
                Math.random() < 0.8 ? Math.floor(Math.random() * 30) + 50 : // 40%が50-79歳
                Math.floor(Math.random() * 20) + 80; // 20%が80-99歳
    
    // 性別: カテゴリカル変数として適切に処理
    const genders = ['男性', '女性'];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const genderEncoded = genders.indexOf(gender);
    
    // 年収: 整数で現実的な分布（万円単位）
    const income = Math.random() < 0.6 ? 
      Math.floor(Math.random() * 500) + 300 : // 60%が300-799万円
      Math.floor(Math.random() * 1200) + 800; // 40%が800-1999万円
    
    // 家族構成: カテゴリカル変数として適切に処理
    const familySizes = ['1人', '2人', '3人', '4人', '5人以上'];
    const familySize = familySizes[Math.floor(Math.random() * familySizes.length)];
    const familySizeEncoded = familySizes.indexOf(familySize);
    
    // 居住地: カテゴリカル変数として適切に処理
    const residences = ['東京都', '大阪府', '神奈川県', '愛知県', '埼玉県', '千葉県', '兵庫県', '福岡県', '北海道', 'その他'];
    const residence = residences[Math.floor(Math.random() * residences.length)];
    const residenceEncoded = residences.indexOf(residence);
    
    // 職業: カテゴリカル変数として適切に処理
    const occupations = ['会社員', '自営業', '公務員', '学生', '主婦', 'フリーランス', 'その他'];
    const occupation = occupations[Math.floor(Math.random() * occupations.length)];
    const occupationEncoded = occupations.indexOf(occupation);
    
    // 教育レベル: カテゴリカル変数として適切に処理
    const educationLevels = ['高校卒', '専門学校卒', '大学卒', '大学院卒', 'その他'];
    const education = educationLevels[Math.floor(Math.random() * educationLevels.length)];
    const educationEncoded = educationLevels.indexOf(education);
    
    // 契約期間: 整数で現実的な分布（月単位）
    const contractPeriod = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 24) + 1 : // 70%が1-24ヶ月
      Math.floor(Math.random() * 36) + 24; // 30%が24-59ヶ月
    
    const monthlyFee = Math.floor(Math.random() * 30000) + 2000; // 2000-31999円
    const supportCount = Math.floor(Math.random() * 16); // 0-15回
    const satisfaction = Math.floor(Math.random() * 11); // 0-10
    const serviceCount = Math.floor(Math.random() * 8) + 1; // 1-8サービス
    const creditScore = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 200) + 600 : // 70%が600-799
      Math.floor(Math.random() * 400) + 200; // 30%が200-599
    const pastCancellations = Math.random() < 0.8 ? 
      Math.floor(Math.random() * 2) : // 80%が0-1回
      Math.floor(Math.random() * 3) + 2; // 20%が2-4回
    const referrals = Math.floor(Math.random() * 8); // 0-7回
    const socialActivity = Math.floor(Math.random() * 11); // 0-10
    const purchaseFrequency = Math.floor(Math.random() * 21); // 0-20回/月
    const averagePurchase = Math.floor(Math.random() * 50000) + 5000; // 5000-54999円
    const categoryDiversity = Math.floor(Math.random() * 11); // 0-10
    const seasonality = Math.floor(Math.random() * 11); // 0-10
    const timeBias = Math.floor(Math.random() * 11); // 0-10
    
    // デバイス種類: カテゴリカル変数として適切に処理
    const deviceTypes = ['PC', 'スマートフォン', 'タブレット', 'その他'];
    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    const deviceTypeEncoded = deviceTypes.indexOf(deviceType);
    
    // 支払い方法: カテゴリカル変数として適切に処理
    const paymentMethods = ['現金', 'クレジットカード', 'デビットカード', '電子マネー', 'その他'];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const paymentMethodEncoded = paymentMethods.indexOf(paymentMethod);
    
    const promotionResponse = Math.random() * 10; // 0-10
    
    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.12) { // 12%の確率で欠損値あり
      // 学生の場合、年収情報が欠損しやすい
      if (occupation === '学生' && Math.random() < 0.8) {
        missingIndices.push(2); // 年収
      }
      
      // 高齢者の場合、SNS活動度が欠損しやすい
      if (age > 65 && Math.random() < 0.7) {
        missingIndices.push(15); // SNS活動度
      }
      
      // 短期契約の場合、推奨回数が欠損しやすい
      if (contractPeriod < 6 && Math.random() < 0.6) {
        missingIndices.push(14); // 推奨回数
      }
      
      // 低満足度の場合、サポート回数が欠損しやすい
      if (satisfaction < 3 && Math.random() < 0.5) {
        missingIndices.push(9); // サポート回数
      }
      
      // 新規顧客の場合、過去の解約回数が欠損しやすい
      if (contractPeriod < 3 && Math.random() < 0.4) {
        missingIndices.push(13); // 過去の解約回数
      }
    }

    // 生涯価値計算（より現実的なロジック）
    let lifetimeValue = income * 0.05; // 基本価値（年収の5%）
    lifetimeValue += satisfaction * 500; // 満足度による加算
    lifetimeValue += serviceCount * 300; // サービス数による加算
    lifetimeValue += contractPeriod * 50; // 契約期間による加算
    lifetimeValue += referrals * 1000; // 推奨による加算
    lifetimeValue += purchaseFrequency * 50; // 購買頻度による加算
    lifetimeValue += averagePurchase * 0.05; // 平均購入額による加算
    lifetimeValue -= pastCancellations * 2000; // 解約による減価
    lifetimeValue += creditScore * 5; // クレジットスコアによる加算
    lifetimeValue += socialActivity * 200; // SNS活動による加算
    
    // 職業による調整
    if (occupation === '会社員') lifetimeValue *= 1.2;
    if (occupation === '自営業') lifetimeValue *= 1.1;
    if (occupation === '学生') lifetimeValue *= 0.5;
    
    // 年齢による調整
    if (age > 60) lifetimeValue *= 0.8;
    if (age < 30) lifetimeValue *= 1.1;

    // ノイズを追加
    lifetimeValue += (Math.random() - 0.5) * lifetimeValue * 0.2;

    // 特徴量配列を作成
    const features = [
      age, gender, income, familySize, residence, occupation, education,
      contractPeriod, monthlyFee, supportCount, satisfaction, serviceCount,
      creditScore, pastCancellations, referrals, socialActivity, purchaseFrequency,
      averagePurchase, categoryDiversity, seasonality, timeBias, deviceType,
      paymentMethod, promotionResponse
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: Math.max(0, Math.round(lifetimeValue))
    });
  }
  return data;
}

function generateAdvancedFraudData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 取引金額: 整数で現実的な分布（小額取引が多い）
    const amount = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 50000) + 1000 : // 70%が1-49999円
      Math.floor(Math.random() * 200000) + 50000; // 30%が5-249999円
    
    // 取引時間: 0-24時間の範囲で適切に（小数点あり）
    const time = Math.random() * 24; // 0-24時
    
    // 取引場所: 0-100のスコア（整数）
    const location = Math.floor(Math.random() * 101); // 0-100（場所スコア）
    
    // 前回取引からの時間: 整数で現実的な分布（分単位）
    const timeSinceLast = Math.random() < 0.6 ? 
      Math.floor(Math.random() * 60) + 1 : // 60%が1-60分
      Math.floor(Math.random() * 1440) + 60; // 40%が60-1499分
    
    // 前回取引金額: 現在の取引金額と相関（整数）
    const lastAmount = Math.floor(amount * (0.8 + Math.random() * 0.4)); // 現在の80-120%
    
    // 月間取引回数: 整数で現実的な分布
    const monthlyTransactions = Math.random() < 0.5 ? 
      Math.floor(Math.random() * 20) + 1 : // 50%が1-20回
      Math.floor(Math.random() * 30) + 20; // 50%が20-49回
    
    // 月間取引総額: 取引回数と相関（整数）
    const monthlyAmount = Math.floor(monthlyTransactions * (amount * (0.5 + Math.random() * 1.0)));
    
    // 時間帯: カテゴリカル変数として適切に処理
    const timePeriods = ['深夜', '早朝', '朝', '昼', '夕方', '夜'];
    const timePeriod = timePeriods[Math.floor(Math.random() * timePeriods.length)];
    const timePeriodEncoded = timePeriods.indexOf(timePeriod);
    
    // 曜日: カテゴリカル変数として適切に処理
    const daysOfWeek = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];
    const dayOfWeek = daysOfWeek[Math.floor(Math.random() * daysOfWeek.length)];
    const dayOfWeekEncoded = daysOfWeek.indexOf(dayOfWeek);
    
    // 季節: カテゴリカル変数として適切に処理
    const seasons = ['春', '夏', '秋', '冬'];
    const season = seasons[Math.floor(Math.random() * seasons.length)];
    const seasonEncoded = seasons.indexOf(season);
    
    // カード種類: カテゴリカル変数として適切に処理
    const cardTypes = ['クレジットカード', 'デビットカード', 'プリペイドカード', '電子マネー', 'その他'];
    const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    const cardTypeEncoded = cardTypes.indexOf(cardType);
    
    // 加盟店カテゴリ: カテゴリカル変数として適切に処理
    const merchantCategories = ['小売店', 'レストラン', 'ガソリンスタンド', 'オンライン', '交通機関', '医療', '娯楽', 'その他'];
    const merchantCategory = merchantCategories[Math.floor(Math.random() * merchantCategories.length)];
    const merchantCategoryEncoded = merchantCategories.indexOf(merchantCategory);
    
    // 地理的距離: より現実的な分布
    const geoDistance = Math.random() < 0.8 ? 
      Math.random() * 50 + 1 : // 80%が1-50km
      Math.random() * 950 + 50; // 20%が50-1000km
    
    // 異常度スコア: 0-10の範囲で適切に
    const anomalyScore = Math.random() * 10; // 0-10
    
    // リスクスコア: 0-10の範囲で適切に
    const riskScore = Math.random() * 10; // 0-10
    
    // 過去の拒否回数: より現実的な分布
    const pastRejections = Math.random() < 0.9 ? 
      Math.floor(Math.random() * 3) : // 90%が0-2回
      Math.floor(Math.random() * 7) + 3; // 10%が3-9回
    
    // 信用度: 整数で現実的な分布
    const creditScore = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 200) + 600 : // 70%が600-799
      Math.floor(Math.random() * 400) + 200; // 30%が200-599
    
    // 年収: 整数で現実的な分布（万円単位）
    const income = Math.random() < 0.6 ? 
      Math.floor(Math.random() * 500) + 300 : // 60%が300-799万円
      Math.floor(Math.random() * 1200) + 800; // 40%が800-1999万円
    
    // 職業: カテゴリカル変数として適切に処理
    const occupations = ['会社員', '自営業', '公務員', '学生', '主婦', 'フリーランス', 'その他'];
    const occupation = occupations[Math.floor(Math.random() * occupations.length)];
    const occupationEncoded = occupations.indexOf(occupation);
    
    // 居住期間: 整数で現実的な分布（年単位）
    const residencePeriod = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 10) + 1 : // 70%が1-10年
      Math.floor(Math.random() * 20) + 10; // 30%が10-29年
    
    // 家族構成: カテゴリカル変数として適切に処理
    const familySizes = ['1人', '2人', '3人', '4人', '5人以上'];
    const familySize = familySizes[Math.floor(Math.random() * familySizes.length)];
    const familySizeEncoded = familySizes.indexOf(familySize);
    
    // 過去の詐欺被害: カテゴリカル変数として適切に処理
    const pastFraudOptions = ['なし', 'あり'];
    const pastFraud = pastFraudOptions[Math.random() > 0.95 ? 1 : 0]; // 5%の確率
    const pastFraudEncoded = pastFraudOptions.indexOf(pastFraud);
    
    // 保険加入状況: カテゴリカル変数として適切に処理
    const insuranceOptions = ['未加入', '加入'];
    const insurance = insuranceOptions[Math.random() > 0.3 ? 1 : 0]; // 70%の確率
    const insuranceEncoded = insuranceOptions.indexOf(insurance);
    
    // 連絡先確認状況: カテゴリカル変数として適切に処理
    const contactOptions = ['未確認', '確認済み'];
    const contactVerified = contactOptions[Math.random() > 0.2 ? 1 : 0]; // 80%の確率
    const contactVerifiedEncoded = contactOptions.indexOf(contactVerified);
    
    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.08) { // 8%の確率で欠損値あり
      // 小額取引の場合、地理的距離が欠損しやすい
      if (amount < 10000 && Math.random() < 0.6) {
        missingIndices.push(12); // 地理的距離
      }
      
      // 深夜の取引の場合、加盟店カテゴリが欠損しやすい
      if (time < 6 || time > 22) {
        if (Math.random() < 0.5) {
          missingIndices.push(11); // 加盟店カテゴリ
        }
      }
      
      // 新規カードの場合、過去の拒否回数が欠損しやすい
      if (creditScore > 700 && Math.random() < 0.7) {
        missingIndices.push(15); // 過去の拒否回数
      }
      
      // 高齢者の場合、SNS活動度が欠損しやすい
      if (Math.random() < 0.3) {
        missingIndices.push(19); // デバイス種類
      }
    }

    // 詐欺判定ロジック（より現実的なロジック）
    let isFraud = 0;
    if (amount > 100000) isFraud += 0.2; // 高額取引（10万円以上）
    if (time < 6 || time > 22) isFraud += 0.3; // 深夜・早朝
    if (geoDistance > 200) isFraud += 0.4; // 遠距離（200km以上）
    if (anomalyScore > 7) isFraud += 0.5; // 異常度
    if (riskScore > 8) isFraud += 0.4; // リスクスコア
    if (pastRejections > 2) isFraud += 0.3; // 過去の拒否
    if (creditScore < 400) isFraud += 0.3; // 低クレジット
    if (pastFraud === 'あり') isFraud += 0.6; // 過去の詐欺
    if (contactVerified === '未確認') isFraud += 0.2; // 連絡先未確認
    if (timeSinceLast < 5) isFraud += 0.3; // 短時間での連続取引

    // ランダム要素を追加
    isFraud += (Math.random() - 0.5) * 0.2;

    // 特徴量配列を作成
    const features = [
      amount, time, location, timeSinceLast, lastAmount, monthlyTransactions,
      monthlyAmount, timePeriod, dayOfWeek, season, cardType, merchantCategory,
      geoDistance, anomalyScore, riskScore, pastRejections, creditScore,
      income, occupation, residencePeriod, familySize, pastFraud, insurance,
      contactVerified
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: isFraud > 0.5 ? 1 : 0
    });
  }
  return data;
}

function generateAdvancedMedicalData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // 年齢: 整数で現実的な分布（若年層が多い）
    const age = Math.random() < 0.3 ? Math.floor(Math.random() * 30) + 20 : // 30%が20-49歳
                Math.random() < 0.6 ? Math.floor(Math.random() * 30) + 50 : // 30%が50-79歳
                Math.floor(Math.random() * 20) + 80; // 40%が80-99歳
    
    // 性別: カテゴリカル変数として適切に処理
    const genders = ['男性', '女性'];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const genderEncoded = genders.indexOf(gender);
    
    // 身長・体重: 性別に応じた現実的な値（整数）
    const isMale = gender === '男性';
    const height = isMale ? 
      Math.floor(Math.random() * 20) + 160 : // 男性: 160-179cm
      Math.floor(Math.random() * 20) + 150;  // 女性: 150-169cm
    const weight = isMale ?
      Math.floor(Math.random() * 30) + 60 :  // 男性: 60-89kg
      Math.floor(Math.random() * 25) + 45;   // 女性: 45-69kg
    
    const bmi = Math.round((weight / ((height / 100) ** 2)) * 10) / 10; // 小数点第1位まで
    
    // 血圧: 整数で現実的な分布（異常値も含む）
    const systolicBP = Math.random() < 0.7 ? 
      Math.floor(Math.random() * 20) + 110 : // 70%が正常範囲
      Math.floor(Math.random() * 40) + 130;  // 30%が異常値
    const diastolicBP = Math.random() < 0.7 ?
      Math.floor(Math.random() * 15) + 70 :  // 70%が正常範囲
      Math.floor(Math.random() * 25) + 85;   // 30%が異常値
    
    const heartRate = Math.floor(Math.random() * 40) + 60; // 60-99bpm
    const temperature = Math.random() < 0.9 ?
      Math.round((Math.random() * 0.5 + 36.5) * 10) / 10 : // 90%が正常（小数点第1位）
      Math.round((Math.random() * 1.5 + 37.5) * 10) / 10;  // 10%が発熱（小数点第1位）
    
    // 検査値: 整数で現実的な分布
    const bloodSugar = Math.random() < 0.8 ?
      Math.floor(Math.random() * 40) + 80 :   // 80%が正常
      Math.floor(Math.random() * 100) + 120;  // 20%が異常
    const cholesterol = Math.random() < 0.6 ?
      Math.floor(Math.random() * 50) + 150 :  // 60%が正常
      Math.floor(Math.random() * 100) + 200;  // 40%が異常
    
    const hemoglobin = Math.round((Math.random() * 3 + 11) * 10) / 10; // 11-14g/dL（小数点第1位）
    const whiteBloodCells = Math.floor(Math.random() * 4000) + 5000; // 5000-8999/μL
    const redBloodCells = Math.round((Math.random() * 1 + 4.5) * 100) / 100; // 4.5-5.5M/μL（小数点第2位）
    const platelets = Math.floor(Math.random() * 100000) + 200000; // 200000-299999/μL
    const liverFunction = Math.floor(Math.random() * 50) + 30; // 30-79
    const kidneyFunction = Math.floor(Math.random() * 50) + 30; // 30-79
    
    // 症状: カテゴリカル変数として適切に処理
    const symptomOptions = ['なし', 'あり'];
    const symptoms = [
      symptomOptions[Math.random() > 0.8 ? 1 : 0], // 症状1: 20%の確率
      symptomOptions[Math.random() > 0.9 ? 1 : 0], // 症状2: 10%の確率
      symptomOptions[Math.random() > 0.7 ? 1 : 0], // 症状3: 30%の確率
      symptomOptions[Math.random() > 0.85 ? 1 : 0], // 症状4: 15%の確率
      symptomOptions[Math.random() > 0.75 ? 1 : 0], // 症状5: 25%の確率
      symptomOptions[Math.random() > 0.9 ? 1 : 0], // 症状6: 10%の確率
      symptomOptions[Math.random() > 0.8 ? 1 : 0], // 症状7: 20%の確率
      symptomOptions[Math.random() > 0.85 ? 1 : 0], // 症状8: 15%の確率
      symptomOptions[Math.random() > 0.7 ? 1 : 0], // 症状9: 30%の確率
      symptomOptions[Math.random() > 0.9 ? 1 : 0]  // 症状10: 10%の確率
    ];
    const symptomsEncoded = symptoms.map(s => symptomOptions.indexOf(s));
    
    // 生活習慣: カテゴリカル変数として適切に処理
    const historyLevels = ['なし', '軽度', '中程度', '重度', '非常に重度'];
    const medicalHistory = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const medicalHistoryEncoded = historyLevels.indexOf(medicalHistory);
    
    const familyHistory = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const familyHistoryEncoded = historyLevels.indexOf(familyHistory);
    
    const smoking = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const smokingEncoded = historyLevels.indexOf(smoking);
    
    const drinking = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const drinkingEncoded = historyLevels.indexOf(drinking);
    
    const exercise = historyLevels[Math.floor(Math.random() * historyLevels.length)];
    const exerciseEncoded = historyLevels.indexOf(exercise);
    
    const sleep = Math.floor(Math.random() * 4) + 6; // 6-9時間（整数）
    
    const stressLevels = ['なし', '軽度', '中程度', '重度', '非常に重度'];
    const stress = stressLevels[Math.floor(Math.random() * stressLevels.length)];
    const stressEncoded = stressLevels.indexOf(stress);
    
    // 欠損値を追加（より現実的なパターン）
    const missingIndices = [];
    
    // 特定の特徴量に集中的に欠損値を発生させる
    if (Math.random() < 0.18) { // 18%の確率で欠損値あり
      // 若年者の場合、既往歴が欠損しやすい
      if (age < 30 && Math.random() < 0.6) {
        missingIndices.push(27); // 既往歴
      }
      
      // 高齢者の場合、家族歴が欠損しやすい
      if (age > 70 && Math.random() < 0.5) {
        missingIndices.push(28); // 家族歴
      }
      
      // 健康な人の場合、症状情報が欠損しやすい
      if (bmi >= 18.5 && bmi <= 25 && systolicBP < 120 && diastolicBP < 80) {
        if (Math.random() < 0.7) {
          // 症状1-10のうちランダムに1-3個を欠損
          const symptomIndices = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
          const numMissing = Math.floor(Math.random() * 3) + 1;
          const shuffled = symptomIndices.sort(() => 0.5 - Math.random());
          missingIndices.push(...shuffled.slice(0, numMissing));
        }
      }
      
      // 緊急事態の場合、生活習慣情報が欠損しやすい
      if (temperature > 38 || systolicBP > 180 || diastolicBP > 110) {
        if (Math.random() < 0.8) {
          missingIndices.push(30); // 喫煙歴
          missingIndices.push(31); // 飲酒歴
          missingIndices.push(32); // 運動習慣
        }
      }
      
      // 低所得者の場合、詳細な検査値が欠損しやすい
      if (Math.random() < 0.4) {
        missingIndices.push(10); // 血糖値
        missingIndices.push(11); // コレステロール
      }
    }

    // 診断結果判定（より現実的なロジック）
    let diagnosis = 0; // 0: 健康, 1: 軽症, 2: 中症, 3: 重症, 4: 要入院
    
    // 年齢による基本リスク
    if (age > 70) diagnosis += 1;
    if (age > 85) diagnosis += 1;
    
    // 検査値による判定
    if (bmi > 30 || bmi < 18.5) diagnosis += 1; // BMI異常
    if (systolicBP > 140 || diastolicBP > 90) diagnosis += 1; // 高血圧
    if (bloodSugar > 126) diagnosis += 2; // 糖尿病
    if (cholesterol > 240) diagnosis += 1; // 高コレステロール
    if (temperature > 37.5) diagnosis += 1; // 発熱
    if (heartRate > 100 || heartRate < 50) diagnosis += 1; // 心拍数異常
    
    // 症状による判定
    const symptomCount = symptomsEncoded.filter(s => s === 1).length;
    if (symptomCount > 3) diagnosis += 1;
    if (symptomCount > 6) diagnosis += 1;
    
    // 生活習慣による判定
    if (medicalHistoryEncoded > 2) diagnosis += 1; // 既往歴（中程度以上）
    if (familyHistoryEncoded > 2) diagnosis += 1; // 家族歴（中程度以上）
    if (smokingEncoded > 2) diagnosis += 1; // 喫煙（中程度以上）
    if (stressEncoded > 3) diagnosis += 1; // 高ストレス（重度以上）
    if (sleep < 6 || sleep > 9) diagnosis += 1; // 睡眠異常

    // ランダム要素を追加
    diagnosis += Math.floor(Math.random() * 3) - 1;
    diagnosis = Math.max(0, Math.min(4, diagnosis));

    // 特徴量配列を作成
    const features = [
      age, gender, height, weight, bmi, systolicBP, diastolicBP, heartRate,
      temperature, bloodSugar, cholesterol, hemoglobin, whiteBloodCells,
      redBloodCells, platelets, liverFunction, kidneyFunction, ...symptoms,
      medicalHistory, familyHistory, smoking, drinking, exercise, sleep, stress
    ];
    
    // 欠損値を適用
    missingIndices.forEach(index => {
      features[index] = NaN;
    });

    data.push({
      features,
      label: diagnosis
    });
  }
  return data;
}

function generateAdvancedStockData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  let basePrice = 1000; // 基準価格

  for (let i = 0; i < count; i++) {
    // 価格変動をシミュレート
    const change = (Math.random() - 0.5) * 0.1; // -5% to +5%
    basePrice *= (1 + change);
    
    const prevClose = basePrice;
    const prevHigh = prevClose * (1 + Math.random() * 0.05);
    const prevLow = prevClose * (1 - Math.random() * 0.05);
    const volume = Math.random() * 1000000 + 100000;
    const ma5 = prevClose * (1 + (Math.random() - 0.5) * 0.02);
    const ma20 = prevClose * (1 + (Math.random() - 0.5) * 0.05);
    const ma50 = prevClose * (1 + (Math.random() - 0.5) * 0.1);
    const ma200 = prevClose * (1 + (Math.random() - 0.5) * 0.2);
    const rsi = Math.random() * 100;
    const macd = (Math.random() - 0.5) * 10;
    const bbUpper = prevClose * (1 + Math.random() * 0.1);
    const bbLower = prevClose * (1 - Math.random() * 0.1);
    const stoch = Math.random() * 100;
    const cci = (Math.random() - 0.5) * 200;
    const williams = (Math.random() - 0.5) * 100;
    const volumeMA = volume * (1 + (Math.random() - 0.5) * 0.2);
    const priceChange = (Math.random() - 0.5) * 0.1;
    const volatility = Math.random() * 0.5;
    const relativeStrength = Math.random() * 10;
    const momentum = (Math.random() - 0.5) * 20;
    const marketMovement = (Math.random() - 0.5) * 0.1;
    const sectorTrend = (Math.random() - 0.5) * 0.1;
    const interestRate = Math.random() * 5 + 1;
    const exchangeRate = Math.random() * 50 + 100;
    const vix = Math.random() * 50 + 10;
    const goldPrice = Math.random() * 1000 + 1500;
    const oilPrice = Math.random() * 50 + 50;

    // 翌日終値予測（簡略化）
    let nextClose = prevClose;
    nextClose += (ma5 - prevClose) * 0.1;
    nextClose += (ma20 - prevClose) * 0.05;
    nextClose += (rsi - 50) * 0.01;
    nextClose += macd * 0.1;
    nextClose += marketMovement * prevClose;
    nextClose += sectorTrend * prevClose;
    nextClose += (Math.random() - 0.5) * prevClose * 0.02; // ランダム要素

    data.push({
      features: [
        prevClose, prevHigh, prevLow, volume, ma5, ma20, ma50, ma200,
        rsi, macd, bbUpper, bbLower, stoch, cci, williams, volumeMA,
        priceChange, volatility, relativeStrength, momentum, marketMovement,
        sectorTrend, interestRate, exchangeRate, vix, goldPrice, oilPrice
      ],
      label: Math.max(0, nextClose)
    });
  }
  return data;
}

function generateAdvancedRecommendationData(count: number): { features: (number | string)[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    const userAge = Math.random() * 60 + 18; // 18-78歳
    const userGender = Math.random() > 0.5 ? 1 : 0; // 0: 女性, 1: 男性
    const userOccupation = Math.random() * 10; // 0-10
    const userIncome = Math.random() * 2000 + 200; // 200-2200万円
    const userLocation = Math.random() * 10; // 0-10
    const itemCategory = Math.random() * 20; // 0-20
    const itemPrice = Math.random() * 100000 + 1000; // 1000-101000円
    const itemRating = Math.random() * 5; // 0-5
    const itemPopularity = Math.random() * 10; // 0-10
    const purchaseHistory = Math.random() * 100; // 0-100回
    const ratingHistory = Math.random() * 50; // 0-50回
    const viewHistory = Math.random() * 200; // 0-200回
    const sessionTime = Math.random() * 3600; // 0-3600秒
    const deviceType = Math.random() * 3; // 0-3
    const timeOfDay = Math.random() * 24; // 0-24時
    const dayOfWeek = Math.random() * 7; // 0-7日
    const season = Math.random() * 4; // 0-4季節
    const hasPromotion = Math.random() > 0.5 ? 1 : 0; // 50%の確率
    const stockStatus = Math.random() * 10; // 0-10
    const deliveryTime = Math.random() * 7; // 0-7日
    const reviewCount = Math.floor(Math.random() * 1000); // 0-999回
    const reviewAverage = Math.random() * 5; // 0-5
    const similarUserRating = Math.random() * 5; // 0-5
    const itemSimilarity = Math.random() * 10; // 0-10
    const userSimilarity = Math.random() * 10; // 0-10
    const trendScore = Math.random() * 10; // 0-10
    const noveltyScore = Math.random() * 10; // 0-10

    // 推薦判定ロジック
    let recommendation = 0; // 0: 非推薦, 1: 推薦
    if (itemRating > 4) recommendation += 0.3; // 高評価
    if (itemPopularity > 7) recommendation += 0.2; // 人気
    if (purchaseHistory > 50) recommendation += 0.2; // 購買履歴
    if (ratingHistory > 20) recommendation += 0.1; // 評価履歴
    if (sessionTime > 1800) recommendation += 0.1; // 長時間セッション
    if (similarUserRating > 4) recommendation += 0.2; // 類似ユーザー評価
    if (itemSimilarity > 7) recommendation += 0.3; // アイテム類似度
    if (userSimilarity > 7) recommendation += 0.2; // ユーザー類似度
    if (trendScore > 7) recommendation += 0.1; // トレンド
    if (hasPromotion) recommendation += 0.1; // プロモーション

    // ランダム要素を追加
    recommendation += (Math.random() - 0.5) * 0.2;

    data.push({
      features: [
        userAge, userGender, userOccupation, userIncome, userLocation,
        itemCategory, itemPrice, itemRating, itemPopularity, purchaseHistory,
        ratingHistory, viewHistory, sessionTime, deviceType, timeOfDay,
        dayOfWeek, season, hasPromotion, stockStatus, deliveryTime,
        reviewCount, reviewAverage, similarUserRating, itemSimilarity,
        userSimilarity, trendScore, noveltyScore
      ],
      label: recommendation > 0.5 ? 1 : 0
    });
  }
  return data;
}

// ランダムにデータセットを取得
export function getRandomAdvancedProblemDataset(): AdvancedProblemDataset {
  const datasets = [
    advancedHousingDataset,
    customerLifetimeValueDataset,
    fraudDetectionDataset,
    medicalDiagnosisDataset,
    stockMarketDataset,
    recommendationDataset
  ];
  
  const randomIndex = Math.floor(Math.random() * datasets.length);
  return datasets[randomIndex];
}