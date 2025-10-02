import type { Dataset } from '../types/ml';

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateKyotoDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 500; i++) {
    const isReal = i < 250;
    
    // 基本特徴量（より現実的な分布）
    const age = isReal ? 50 + Math.random() * 200 : 5 + Math.random() * 50;
    const craftsmanship = isReal ? 0.6 + Math.random() * 0.4 : 0.2 + Math.random() * 0.6;
    const materialQuality = isReal ? 0.7 + Math.random() * 0.3 : 0.3 + Math.random() * 0.5;
    const patina = isReal ? Math.min(1, age / 300) + Math.random() * 0.2 : Math.random() * 0.3;
    
    // 複雑な関係性を追加
    const provenance = isReal ? 0.6 + Math.random() * 0.4 : Math.random() * 0.5;
    const artisticStyle = isReal ? 0.5 + Math.random() * 0.4 : 0.2 + Math.random() * 0.6;
    const condition = isReal ? 0.4 + Math.random() * 0.5 : 0.1 + Math.random() * 0.7;
    const rarity = isReal ? 0.3 + Math.random() * 0.6 : 0.1 + Math.random() * 0.4;
    
    // 非線形関係を追加（年齢とパティナの関係など）
    const ageEffect = Math.sin(age / 50) * 0.1;
    const craftsmanshipEffect = craftsmanship * craftsmanship * 0.3;
    
    // 複合的な真贋判定（より現実的）
    const authenticityScore = 
      craftsmanship * 0.25 +
      materialQuality * 0.2 +
      patina * 0.15 +
      provenance * 0.15 +
      artisticStyle * 0.1 +
      condition * 0.05 +
      rarity * 0.05 +
      ageEffect +
      craftsmanshipEffect +
      (Math.random() - 0.5) * 0.2;

    const isAuthentic = authenticityScore > 0.5;

    data.push({
      features: [
        age / 300, // 正規化
        craftsmanship,
        materialQuality,
        patina,
        provenance,
        artisticStyle,
        condition,
        rarity
      ],
      label: isAuthentic ? 1 : 0,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['年代', '職人技', '材質', '古色', '来歴', '芸術様式', '保存状態', '希少性'],
    labelName: '真贋',
    classes: ['贋作', '本物'],
  };
}

export function generateSakaiDataset(): Dataset {
  const data = [];
  const origins = ['中国', '南蛮', '朝鮮', '日本'];

  for (let i = 0; i < 600; i++) {
    const originIdx = Math.floor(Math.random() * 4);
    
    // 季節性を考慮（貿易の季節パターン）
    const season = Math.random();
    const seasonalMultiplier = 1 + 0.3 * Math.sin(season * 2 * Math.PI);
    
    // 産地別の特徴的なパターン
    let material, decoration, craftsmanship, price, durability, rarity, tradeRoute, culturalInfluence;
    
    switch (originIdx) {
      case 0: // 中国
        material = 0.7 + Math.random() * 0.3;
        decoration = 0.8 + Math.random() * 0.2;
        craftsmanship = 0.6 + Math.random() * 0.3;
        price = (0.4 + Math.random() * 0.4) * seasonalMultiplier;
        durability = 0.7 + Math.random() * 0.3;
        rarity = 0.3 + Math.random() * 0.4;
        tradeRoute = 0.8 + Math.random() * 0.2;
        culturalInfluence = 0.9 + Math.random() * 0.1;
        break;
      case 1: // 南蛮
        material = 0.5 + Math.random() * 0.4;
        decoration = 0.3 + Math.random() * 0.5;
        craftsmanship = 0.4 + Math.random() * 0.4;
        price = (0.6 + Math.random() * 0.3) * seasonalMultiplier;
        durability = 0.5 + Math.random() * 0.4;
        rarity = 0.7 + Math.random() * 0.3;
        tradeRoute = 0.3 + Math.random() * 0.4;
        culturalInfluence = 0.2 + Math.random() * 0.3;
        break;
      case 2: // 朝鮮
        material = 0.6 + Math.random() * 0.3;
        decoration = 0.5 + Math.random() * 0.4;
        craftsmanship = 0.7 + Math.random() * 0.3;
        price = (0.3 + Math.random() * 0.4) * seasonalMultiplier;
        durability = 0.8 + Math.random() * 0.2;
        rarity = 0.4 + Math.random() * 0.4;
        tradeRoute = 0.6 + Math.random() * 0.3;
        culturalInfluence = 0.6 + Math.random() * 0.3;
        break;
      case 3: // 日本
      default:
        material = 0.4 + Math.random() * 0.4;
        decoration = 0.6 + Math.random() * 0.3;
        craftsmanship = 0.5 + Math.random() * 0.4;
        price = (0.2 + Math.random() * 0.3) * seasonalMultiplier;
        durability = 0.6 + Math.random() * 0.3;
        rarity = 0.2 + Math.random() * 0.4;
        tradeRoute = 0.9 + Math.random() * 0.1;
        culturalInfluence = 0.9 + Math.random() * 0.1;
        break;
    }
    
    // 複雑な関係性を追加
    const qualityScore = (material + craftsmanship + durability) / 3;
    const marketValue = price * (1 + rarity * 0.5) * (1 + culturalInfluence * 0.3);
    const tradeEfficiency = tradeRoute * (1 - Math.abs(season - 0.5) * 0.2);
    
    // ノイズと非線形関係を追加
    // const noise = (Math.random() - 0.5) * 0.1;
    // const nonLinearEffect = Math.sin(qualityScore * Math.PI) * 0.05;

    data.push({
      features: [
        material,
        decoration,
        craftsmanship,
        price,
        durability,
        rarity,
        tradeRoute,
        culturalInfluence,
        qualityScore,
        marketValue,
        tradeEfficiency
      ],
      label: originIdx,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['材質', '装飾', '職人技', '価格', '耐久性', '希少性', '交易ルート', '文化的影響', '品質スコア', '市場価値', '交易効率'],
    labelName: '産地',
    classes: origins,
  };
}

export function generateKaiDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 800; i++) {
    // 基本労働条件
    const workers = 30 + Math.random() * 120;
    const experience = Math.random(); // 労働者の経験値
    const skillLevel = 0.3 + Math.random() * 0.7; // 技術レベル
    
    // 天候条件（より複雑な季節パターン）
    const season = Math.random();
    const temp = 5 + 20 * Math.sin(season * 2 * Math.PI) + (Math.random() - 0.5) * 10;
    const rainfall = 50 + 100 * Math.sin(season * 2 * Math.PI + Math.PI) + Math.random() * 100;
    const humidity = 0.3 + 0.4 * Math.sin(season * 2 * Math.PI) + Math.random() * 0.3;
    
    // 技術的要因
    const equipment = 0.2 + Math.random() * 0.8; // 採掘機具の質
    const technique = 0.3 + Math.random() * 0.7; // 採掘技術
    const safety = 0.4 + Math.random() * 0.6; // 安全対策
    
    // 地質条件
    const oreQuality = 0.2 + Math.random() * 0.8; // 鉱石の品質
    const depth = 10 + Math.random() * 40; // 採掘深度
    const accessibility = 0.3 + Math.random() * 0.7; // 採掘の容易さ
    
    // 経済・政治要因
    const marketPrice = 0.5 + Math.random() * 0.5; // 金の市場価格
    const investment = 0.2 + Math.random() * 0.8; // 投資額
    const stability = 0.4 + Math.random() * 0.6; // 政治安定性
    
    // 複雑な産出量計算（非線形関係を含む）
    const workerEfficiency = workers * experience * skillLevel;
    const weatherEffect = Math.max(0, 1 - Math.abs(temp - 15) / 30) * (1 - rainfall / 300);
    const techEffect = equipment * technique * safety;
    const geologicalEffect = oreQuality * (1 - depth / 100) * accessibility;
    const economicEffect = marketPrice * investment * stability;
    
    // 季節性と天候の相互作用
    const seasonalBonus = 1 + 0.2 * Math.sin(season * 2 * Math.PI);
    const weatherPenalty = Math.max(0.1, 1 - humidity * 0.3 - Math.abs(temp - 15) / 50);
    
    // 複合的な産出量計算
    const baseOutput = workerEfficiency * techEffect * geologicalEffect * economicEffect;
    const weatherAdjustedOutput = baseOutput * weatherEffect * weatherPenalty * seasonalBonus;
    
    // ノイズとランダム要因
    const randomFactor = 0.8 + Math.random() * 0.4;
    const output = Math.max(0, weatherAdjustedOutput * randomFactor / 1000);

    data.push({
      features: [
        workers / 150, // 正規化
        experience,
        skillLevel,
        temp / 40,
        rainfall / 300,
        humidity,
        equipment,
        technique,
        safety,
        oreQuality,
        depth / 50,
        accessibility,
        marketPrice,
        investment,
        stability,
        season,
        workerEfficiency / 150,
        weatherEffect,
        techEffect,
        geologicalEffect
      ],
      label: output,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['労働者数', '経験値', '技術レベル', '気温', '降水量', '湿度', '機具品質', '採掘技術', '安全対策', '鉱石品質', '採掘深度', '採掘容易さ', '市場価格', '投資額', '政治安定性', '季節', '労働効率', '天候効果', '技術効果', '地質効果'],
    labelName: '産出量(kg)',
  };
}

export function generateEchigoDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 1000; i++) {
    // 天候条件（より詳細な季節パターン）
    const springTemp = 8 + Math.random() * 12;
    const summerTemp = 20 + Math.random() * 15;
    const autumnTemp = 10 + Math.random() * 10;
    const winterTemp = -5 + Math.random() * 10;
    
    const springRain = 50 + Math.random() * 100;
    const summerRain = 150 + Math.random() * 200;
    const autumnRain = 80 + Math.random() * 120;
    const winterSnow = 20 + Math.random() * 80;
    
    const sunshine = 1200 + Math.random() * 800;
    const humidity = 0.4 + Math.random() * 0.4;
    
    // 自然災害
    const typhoons = Math.floor(Math.random() * 6);
    const floods = Math.random() < 0.2 ? Math.random() * 0.5 : 0;
    const droughts = Math.random() < 0.15 ? Math.random() * 0.4 : 0;
    const frost = Math.random() < 0.1 ? Math.random() * 0.3 : 0;
    
    // 土壌条件
    const soilQuality = 0.3 + Math.random() * 0.7;
    const soilMoisture = 0.4 + Math.random() * 0.6;
    const soilPh = 5.5 + Math.random() * 2;
    const soilNutrients = 0.3 + Math.random() * 0.7;
    
    // 農業技術・管理
    const seedQuality = 0.4 + Math.random() * 0.6;
    const fertilizer = 0.2 + Math.random() * 0.8;
    const irrigation = 0.3 + Math.random() * 0.7;
    const pestControl = 0.4 + Math.random() * 0.6;
    const farmingTechnique = 0.3 + Math.random() * 0.7;
    
    // 経済・社会要因
    const laborForce = 0.4 + Math.random() * 0.6;
    const marketPrice = 0.3 + Math.random() * 0.7;
    const investment = 0.2 + Math.random() * 0.8;
    const technology = 0.3 + Math.random() * 0.7;
    
    // 複雑な収穫量計算
    const temperatureScore = (springTemp + summerTemp + autumnTemp) / 3;
    const rainfallScore = (springRain + summerRain + autumnRain) / 3;
    
    // 天候の最適化（米作に適した条件）
    const tempOptimal = Math.max(0, 1 - Math.abs(temperatureScore - 22) / 15);
    const rainOptimal = Math.max(0, 1 - Math.abs(rainfallScore - 200) / 100);
    const sunshineOptimal = Math.min(1, sunshine / 2000);
    
    // 災害の影響
    const disasterImpact = 1 - (typhoons * 0.1 + floods * 0.3 + droughts * 0.4 + frost * 0.2);
    
    // 土壌の影響
    const soilEffect = soilQuality * soilMoisture * (1 - Math.abs(soilPh - 6.5) / 3) * soilNutrients;
    
    // 農業技術の影響
    const techEffect = seedQuality * fertilizer * irrigation * pestControl * farmingTechnique;
    
    // 経済要因の影響
    const economicEffect = laborForce * marketPrice * investment * technology;
    
    // 複合的な収穫量計算（非線形関係を含む）
    const baseHarvest = tempOptimal * rainOptimal * sunshineOptimal * disasterImpact;
    const soilContribution = soilEffect * 0.3;
    const techContribution = techEffect * 0.4;
    const economicContribution = economicEffect * 0.3;
    
    const totalHarvest = baseHarvest * (soilContribution + techContribution + economicContribution);
    
    // ノイズとランダム要因
    const randomFactor = 0.7 + Math.random() * 0.6;
    const harvest = Math.max(0, totalHarvest * randomFactor * 1000);

    data.push({
      features: [
        springTemp / 30,
        summerTemp / 40,
        autumnTemp / 25,
        winterTemp / 20,
        springRain / 200,
        summerRain / 400,
        autumnRain / 250,
        winterSnow / 100,
        sunshine / 2500,
        humidity,
        typhoons / 6,
        floods,
        droughts,
        frost,
        soilQuality,
        soilMoisture,
        (soilPh - 4) / 6,
        soilNutrients,
        seedQuality,
        fertilizer,
        irrigation,
        pestControl,
        farmingTechnique,
        laborForce,
        marketPrice,
        investment,
        technology,
        tempOptimal,
        rainOptimal,
        sunshineOptimal,
        disasterImpact,
        soilEffect,
        techEffect,
        economicEffect
      ],
      label: harvest,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['春気温', '夏気温', '秋気温', '冬気温', '春雨量', '夏雨量', '秋雨量', '冬雪量', '日照時間', '湿度', '台風数', '洪水', '干ばつ', '霜害', '土質', '土壌水分', '土壌pH', '土壌養分', '種子品質', '肥料', '灌漑', '害虫対策', '栽培技術', '労働力', '市場価格', '投資', '技術', '気温最適度', '雨量最適度', '日照最適度', '災害影響', '土壌効果', '技術効果', '経済効果'],
    labelName: '収穫量(石)',
  };
}

export function generateOwariDataset(): Dataset {
  const data = [];
  const roles = ['槍兵', '弓兵', '鉄砲隊', '騎馬隊'];

  for (let i = 0; i < 800; i++) {
    const roleIdx = Math.floor(Math.random() * 4);
    
    // 基本身体能力
    const age = 16 + Math.random() * 30; // 16-46歳
    const height = 150 + Math.random() * 30; // 身長
    const weight = 50 + Math.random() * 30; // 体重
    const strength = Math.random(); // 筋力
    const endurance = Math.random(); // 持久力
    const agility = Math.random(); // 敏捷性
    const dexterity = Math.random(); // 器用さ
    
    // 認知能力
    const intelligence = Math.random(); // 知力
    const memory = Math.random(); // 記憶力
    const reaction = Math.random(); // 反応速度
    const concentration = Math.random(); // 集中力
    
    // 戦闘技能
    const meleeSkill = Math.random(); // 近接戦闘技能
    const rangedSkill = Math.random(); // 遠距離戦闘技能
    const accuracy = Math.random(); // 命中精度
    const tactics = Math.random(); // 戦術理解力
    
    // 経験・背景
    const experience = Math.random(); // 戦闘経験
    const training = Math.random(); // 訓練度
    const leadership = Math.random(); // リーダーシップ
    const discipline = Math.random(); // 規律性
    
    // 出身・社会背景
    const socialClass = Math.random(); // 社会階級
    const education = Math.random(); // 教育レベル
    const familyMilitary = Math.random() < 0.3 ? 1 : 0; // 軍人家系
    const region = Math.random(); // 出身地域（0-1で正規化）
    
    // 心理的特性
    const courage = Math.random(); // 勇気
    const loyalty = Math.random(); // 忠誠心
    const adaptability = Math.random(); // 適応力
    const stressResistance = Math.random(); // ストレス耐性
    
    // 健康状態
    const health = Math.random(); // 健康状態
    const injuries = Math.random() < 0.2 ? Math.random() * 0.5 : 0; // 負傷歴
    const vision = Math.random(); // 視力
    const hearing = Math.random(); // 聴力
    
    // 複合的な適性スコア計算
    let roleScore = 0;
    
    switch (roleIdx) {
      case 0: // 槍兵
        roleScore = 
          strength * 0.25 +
          endurance * 0.2 +
          meleeSkill * 0.2 +
          courage * 0.15 +
          discipline * 0.1 +
          experience * 0.1;
        break;
      case 1: // 弓兵
        roleScore = 
          dexterity * 0.25 +
          accuracy * 0.25 +
          rangedSkill * 0.2 +
          concentration * 0.15 +
          vision * 0.1 +
          training * 0.05;
        break;
      case 2: // 鉄砲隊
        roleScore = 
          intelligence * 0.2 +
          accuracy * 0.2 +
          rangedSkill * 0.2 +
          concentration * 0.15 +
          training * 0.1 +
          discipline * 0.1 +
          vision * 0.05;
        break;
      case 3: // 騎馬隊
      default:
        roleScore = 
          strength * 0.2 +
          agility * 0.2 +
          meleeSkill * 0.15 +
          courage * 0.15 +
          leadership * 0.1 +
          experience * 0.1 +
          socialClass * 0.1;
        break;
    }
    
    // 年齢による調整
    const ageEffect = age < 20 ? 0.8 + (age - 16) * 0.05 : 
                     age < 35 ? 1.0 : 
                     1.0 - (age - 35) * 0.02;
    
    // 健康状態の影響
    const healthEffect = health * (1 - injuries * 0.3);
    
    // 社会背景の影響
    const backgroundEffect = 1 + (socialClass * 0.2 + education * 0.1 + familyMilitary * 0.3);
    
    // 最終適性スコア
    const finalScore = roleScore * ageEffect * healthEffect * backgroundEffect;
    
    // ノイズとランダム要因
    const randomFactor = 0.8 + Math.random() * 0.4;
    const finalRoleScore = finalScore * randomFactor;
    
    // 最も適した役職を決定
    const allScores = [
      // 槍兵スコア
      strength * 0.25 + endurance * 0.2 + meleeSkill * 0.2 + courage * 0.15 + discipline * 0.1 + experience * 0.1,
      // 弓兵スコア
      dexterity * 0.25 + accuracy * 0.25 + rangedSkill * 0.2 + concentration * 0.15 + vision * 0.1 + training * 0.05,
      // 鉄砲隊スコア
      intelligence * 0.2 + accuracy * 0.2 + rangedSkill * 0.2 + concentration * 0.15 + training * 0.1 + discipline * 0.1 + vision * 0.05,
      // 騎馬隊スコア
      strength * 0.2 + agility * 0.2 + meleeSkill * 0.15 + courage * 0.15 + leadership * 0.1 + experience * 0.1 + socialClass * 0.1
    ];
    
    const bestRole = allScores.indexOf(Math.max(...allScores));

    data.push({
      features: [
        age / 50,
        height / 200,
        weight / 100,
        strength,
        endurance,
        agility,
        dexterity,
        intelligence,
        memory,
        reaction,
        concentration,
        meleeSkill,
        rangedSkill,
        accuracy,
        tactics,
        experience,
        training,
        leadership,
        discipline,
        socialClass,
        education,
        familyMilitary,
        region,
        courage,
        loyalty,
        adaptability,
        stressResistance,
        health,
        injuries,
        vision,
        hearing,
        ageEffect,
        healthEffect,
        backgroundEffect,
        finalRoleScore
      ],
      label: bestRole,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['年齢', '身長', '体重', '筋力', '持久力', '敏捷性', '器用さ', '知力', '記憶力', '反応速度', '集中力', '近接技能', '遠距離技能', '命中精度', '戦術理解', '戦闘経験', '訓練度', 'リーダーシップ', '規律性', '社会階級', '教育レベル', '軍人家系', '出身地域', '勇気', '忠誠心', '適応力', 'ストレス耐性', '健康状態', '負傷歴', '視力', '聴力', '年齢効果', '健康効果', '背景効果', '総合適性'],
    labelName: '適性',
    classes: roles,
  };
}

export function generateSatsumaDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 1000; i++) {
    // 材料品質
    const ironQuality = Math.random(); // 鉄の品質
    const steelQuality = Math.random(); // 鋼の品質
    const woodQuality = Math.random(); // 木材の品質
    const gunpowderQuality = Math.random(); // 火薬の品質
    
    // 製造工程の精度
    const forging = Math.random(); // 鍛造技術
    const drilling = Math.random(); // 穴あけ精度
    const threading = Math.random(); // ねじ切り精度
    const polishing = Math.random(); // 研磨技術
    const assembly = Math.random(); // 組み立て精度
    
    // 職人の技能
    const masterSkill = Math.random(); // 親方の技能
    const apprenticeSkill = Math.random(); // 弟子の技能
    const experience = Math.random(); // 経験年数
    const attention = Math.random(); // 注意力
    
    // 物理的特性
    const straightness = Math.random(); // 銃身の直線性
    const sealing = Math.random(); // 火薬室の密閉度
    const triggerSpeed = Math.random(); // 引き金の反応速度
    const balance = Math.random(); // 重量バランス
    const durability = Math.random(); // 耐久性
    const accuracy = Math.random(); // 射撃精度
    
    // 製造環境
    const temperature = Math.random(); // 製造時の温度
    const humidity = Math.random(); // 製造時の湿度
    const tools = Math.random(); // 工具の品質
    const workspace = Math.random(); // 作業環境
    
    // 品質管理
    const inspection = Math.random(); // 検査の厳密さ
    const testing = Math.random(); // テストの充実度
    const standards = Math.random(); // 規格の遵守度
    
    // 複合的な品質スコア計算
    const materialScore = (ironQuality + steelQuality + woodQuality + gunpowderQuality) / 4;
    const processScore = (forging + drilling + threading + polishing + assembly) / 5;
    const skillScore = (masterSkill + apprenticeSkill + experience + attention) / 4;
    const physicalScore = (straightness + sealing + triggerSpeed + balance + durability + accuracy) / 6;
    const environmentScore = (temperature + humidity + tools + workspace) / 4;
    const qualityControlScore = (inspection + testing + standards) / 3;
    
    // 非線形関係を追加
    const materialEffect = Math.pow(materialScore, 1.2);
    const skillEffect = Math.pow(skillScore, 1.1);
    const processEffect = processScore * (1 + Math.sin(processScore * Math.PI) * 0.1);
    
    // 相互作用効果
    const materialSkillInteraction = materialScore * skillScore * 0.3;
    const processEnvironmentInteraction = processScore * environmentScore * 0.2;
    const qualityControlEffect = qualityControlScore * (materialScore + skillScore + processScore) / 3;
    
    // 総合品質スコア
    const totalQuality = 
      materialEffect * 0.25 +
      skillEffect * 0.25 +
      processEffect * 0.2 +
      physicalScore * 0.15 +
      environmentScore * 0.05 +
      qualityControlEffect * 0.1 +
      materialSkillInteraction +
      processEnvironmentInteraction +
      (Math.random() - 0.5) * 0.1; // ノイズ
    
    // 品質判定（閾値は動的に調整）
    const qualityThreshold = 0.6 + Math.random() * 0.2;
    const isGood = totalQuality > qualityThreshold;
    
    // 追加の品質指標
    const reliability = totalQuality * (1 - Math.random() * 0.2);
    const consistency = totalQuality * (1 - Math.random() * 0.15);
    const marketValue = totalQuality * (1 + Math.random() * 0.3);

    data.push({
      features: [
        ironQuality,
        steelQuality,
        woodQuality,
        gunpowderQuality,
        forging,
        drilling,
        threading,
        polishing,
        assembly,
        masterSkill,
        apprenticeSkill,
        experience,
        attention,
        straightness,
        sealing,
        triggerSpeed,
        balance,
        durability,
        accuracy,
        temperature,
        humidity,
        tools,
        workspace,
        inspection,
        testing,
        standards,
        materialScore,
        processScore,
        skillScore,
        physicalScore,
        environmentScore,
        qualityControlScore,
        materialEffect,
        skillEffect,
        processEffect,
        materialSkillInteraction,
        processEnvironmentInteraction,
        qualityControlEffect,
        totalQuality,
        reliability,
        consistency,
        marketValue
      ],
      label: isGood ? 1 : 0,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['鉄品質', '鋼品質', '木材品質', '火薬品質', '鍛造技術', '穴あけ精度', 'ねじ切り精度', '研磨技術', '組み立て精度', '親方技能', '弟子技能', '経験年数', '注意力', '直線性', '密閉度', '引き金速度', '重量バランス', '耐久性', '射撃精度', '製造温度', '製造湿度', '工具品質', '作業環境', '検査厳密さ', 'テスト充実度', '規格遵守度', '材料スコア', '工程スコア', '技能スコア', '物理スコア', '環境スコア', '品質管理スコア', '材料効果', '技能効果', '工程効果', '材料技能相互作用', '工程環境相互作用', '品質管理効果', '総合品質', '信頼性', '一貫性', '市場価値'],
    labelName: '品質',
    classes: ['不良品', '良品'],
  };
}

export function generateHizenDataset(): Dataset {
  const data = [];
  const grades = ['下級品', '中級品', '上級品'];

  for (let i = 0; i < 900; i++) {
    // const gradeIdx = Math.floor(Math.random() * 3);
    
    // 粘土の品質
    const clayQuality = Math.random(); // 粘土の品質
    const clayPurity = Math.random(); // 粘土の純度
    const clayConsistency = Math.random(); // 粘土の一貫性
    const clayPreparation = Math.random(); // 粘土の準備工程
    
    // 釉薬の特性
    const glazeUniformity = Math.random(); // 釉薬の均一性
    const glazeComposition = Math.random(); // 釉薬の組成
    const glazeThickness = Math.random(); // 釉薬の厚さ
    const glazeColor = Math.random(); // 釉薬の色合い
    const glazeTransparency = Math.random(); // 釉薬の透明度
    
    // 焼成条件
    const temperature = 800 + Math.random() * 600; // 焼成温度
    const firingTime = 6 + Math.random() * 18; // 焼成時間
    const atmosphere = Math.random(); // 焼成雰囲気
    const coolingRate = Math.random(); // 冷却速度
    const kilnType = Math.random(); // 窯の種類
    
    // 装飾技術
    const decoration = Math.random(); // 装飾の精密度
    const pattern = Math.random(); // 模様の複雑さ
    const colorWork = Math.random(); // 彩色技術
    const carving = Math.random(); // 彫刻技術
    const glazing = Math.random(); // 上絵付け技術
    
    // 職人の技能
    const potterSkill = Math.random(); // 陶工の技能
    const experience = Math.random(); // 経験年数
    const attention = Math.random(); // 注意力
    const creativity = Math.random(); // 創造性
    
    // 物理的特性
    const thickness = 1 + Math.random() * 4; // 厚み
    const weight = 100 + Math.random() * 500; // 重量
    const density = Math.random(); // 密度
    const porosity = Math.random(); // 気孔率
    const hardness = Math.random(); // 硬度
    
    // 品質管理
    const inspection = Math.random(); // 検査の厳密さ
    const testing = Math.random(); // テストの充実度
    const standards = Math.random(); // 規格の遵守度
    
    // 複合的な等級スコア計算
    const clayScore = (clayQuality + clayPurity + clayConsistency + clayPreparation) / 4;
    const glazeScore = (glazeUniformity + glazeComposition + glazeThickness + glazeColor + glazeTransparency) / 5;
    const firingScore = (temperature / 1400) * (firingTime / 24) * atmosphere * (1 - coolingRate * 0.5) * kilnType;
    const decorationScore = (decoration + pattern + colorWork + carving + glazing) / 5;
    const skillScore = (potterSkill + experience + attention + creativity) / 4;
    const physicalScore = (thickness / 5) * (weight / 600) * density * (1 - porosity) * hardness;
    const qualityControlScore = (inspection + testing + standards) / 3;
    
    // 非線形関係を追加
    const clayEffect = Math.pow(clayScore, 1.3);
    const glazeEffect = Math.pow(glazeScore, 1.2);
    const firingEffect = Math.pow(firingScore, 1.1);
    const decorationEffect = Math.pow(decorationScore, 1.4);
    
    // 相互作用効果
    const clayGlazeInteraction = clayScore * glazeScore * 0.4;
    const firingDecorationInteraction = firingScore * decorationScore * 0.3;
    const skillQualityInteraction = skillScore * qualityControlScore * 0.5;
    
    // 総合等級スコア
    const totalScore = 
      clayEffect * 0.2 +
      glazeEffect * 0.25 +
      firingEffect * 0.2 +
      decorationEffect * 0.15 +
      skillScore * 0.1 +
      physicalScore * 0.05 +
      qualityControlScore * 0.05 +
      clayGlazeInteraction +
      firingDecorationInteraction +
      skillQualityInteraction +
      (Math.random() - 0.5) * 0.1; // ノイズ
    
    // 等級判定（動的閾値）
    let finalGrade;
    if (totalScore < 0.4) {
      finalGrade = 0; // 下級品
    } else if (totalScore < 0.7) {
      finalGrade = 1; // 中級品
    } else {
      finalGrade = 2; // 上級品
    }
    
    // 追加の品質指標
    const durability = totalScore * (1 - Math.random() * 0.2);
    const aesthetic = totalScore * (1 + Math.random() * 0.3);
    const marketValue = totalScore * (1 + Math.random() * 0.4);

    data.push({
      features: [
        clayQuality,
        clayPurity,
        clayConsistency,
        clayPreparation,
        glazeUniformity,
        glazeComposition,
        glazeThickness,
        glazeColor,
        glazeTransparency,
        temperature / 1400,
        firingTime / 24,
        atmosphere,
        coolingRate,
        kilnType,
        decoration,
        pattern,
        colorWork,
        carving,
        glazing,
        potterSkill,
        experience,
        attention,
        creativity,
        thickness / 5,
        weight / 600,
        density,
        porosity,
        hardness,
        inspection,
        testing,
        standards,
        clayScore,
        glazeScore,
        firingScore,
        decorationScore,
        skillScore,
        physicalScore,
        qualityControlScore,
        clayEffect,
        glazeEffect,
        firingEffect,
        decorationEffect,
        clayGlazeInteraction,
        firingDecorationInteraction,
        skillQualityInteraction,
        totalScore,
        durability,
        aesthetic,
        marketValue
      ],
      label: finalGrade,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['粘土品質', '粘土純度', '粘土一貫性', '粘土準備', '釉薬均一性', '釉薬組成', '釉薬厚さ', '釉薬色合い', '釉薬透明度', '焼成温度', '焼成時間', '焼成雰囲気', '冷却速度', '窯種類', '装飾精度', '模様複雑さ', '彩色技術', '彫刻技術', '上絵付け技術', '陶工技能', '経験年数', '注意力', '創造性', '厚み', '重量', '密度', '気孔率', '硬度', '検査厳密さ', 'テスト充実度', '規格遵守度', '粘土スコア', '釉薬スコア', '焼成スコア', '装飾スコア', '技能スコア', '物理スコア', '品質管理スコア', '粘土効果', '釉薬効果', '焼成効果', '装飾効果', '粘土釉薬相互作用', '焼成装飾相互作用', '技能品質相互作用', '総合スコア', '耐久性', '美的価値', '市場価値'],
    labelName: '等級',
    classes: grades,
  };
}

export function generateSagamiDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 1200; i++) {
    // 基本人口・経済指標
    const currentPop = 3000 + Math.random() * 12000;
    const populationDensity = currentPop / (50 + Math.random() * 100); // 人口密度
    const ageDistribution = Math.random(); // 年齢分布（0=若年、1=高齢）
    
    // 経済指標
    const commerce = Math.random(); // 商業発展度
    const agriculture = Math.random(); // 農業生産性
    const industry = Math.random(); // 工業発展度
    const trade = Math.random(); // 交易活動
    const wealth = Math.random(); // 富の集中度
    
    // 政治・行政
    const governance = Math.random(); // 統治能力
    const stability = Math.random(); // 政治安定性
    const lawEnforcement = Math.random(); // 法執行力
    const publicServices = Math.random(); // 公共サービス
    const taxRate = 0.05 + Math.random() * 0.4; // 税率
    
    // 社会・文化
    const education = Math.random(); // 教育レベル
    const culture = Math.random(); // 文化的発展
    const socialCohesion = Math.random(); // 社会結束力
    const innovation = Math.random(); // 革新性
    const tradition = Math.random(); // 伝統の保持
    
    // 地理・環境
    const location = Math.random(); // 立地条件
    const climate = Math.random(); // 気候条件
    const resources = Math.random(); // 天然資源
    const accessibility = Math.random(); // 交通の便
    const defense = Math.random(); // 防衛力
    
    // 災害・リスク
    const naturalDisasters = Math.random() < 0.3 ? Math.random() * 0.8 : 0; // 自然災害
    const conflicts = Math.random() < 0.2 ? Math.random() * 0.6 : 0; // 紛争・戦争
    const diseases = Math.random() < 0.25 ? Math.random() * 0.5 : 0; // 疫病
    const famines = Math.random() < 0.15 ? Math.random() * 0.4 : 0; // 飢饉
    
    // 技術・インフラ
    const technology = Math.random(); // 技術レベル
    const infrastructure = Math.random(); // インフラ整備
    const transportation = Math.random(); // 交通網
    const communication = Math.random(); // 通信網
    const sanitation = Math.random(); // 衛生環境
    
    // 外部要因
    const regionalInfluence = Math.random(); // 地域影響力
    const externalTrade = Math.random(); // 外部交易
    const migration = (Math.random() - 0.5) * 0.4; // 人口移動（-0.2 to 0.2）
    const externalThreats = Math.random(); // 外部脅威
    
    // 複合的な発展予測計算
    const economicScore = (commerce + agriculture + industry + trade + wealth) / 5;
    const politicalScore = (governance + stability + lawEnforcement + publicServices) / 4;
    const socialScore = (education + culture + socialCohesion + innovation + tradition) / 5;
    const geographicScore = (location + climate + resources + accessibility + defense) / 5;
    const riskScore = 1 - (naturalDisasters + conflicts + diseases + famines) / 4;
    const techScore = (technology + infrastructure + transportation + communication + sanitation) / 5;
    const externalScore = (regionalInfluence + externalTrade + (1 + migration) + (1 - externalThreats)) / 4;
    
    // 非線形関係を追加
    const economicEffect = Math.pow(economicScore, 1.2);
    const politicalEffect = Math.pow(politicalScore, 1.1);
    const socialEffect = Math.pow(socialScore, 1.3);
    const geographicEffect = Math.pow(geographicScore, 1.1);
    const techEffect = Math.pow(techScore, 1.4);
    
    // 相互作用効果
    const economicPoliticalInteraction = economicScore * politicalScore * 0.3;
    const socialTechInteraction = socialScore * techScore * 0.4;
    const geographicEconomicInteraction = geographicScore * economicScore * 0.2;
    
    // 税率の影響（非線形）
    const taxEffect = Math.max(0.1, 1 - Math.pow(taxRate, 1.5) * 0.8);
    
    // 人口密度の影響
    const densityEffect = populationDensity > 100 ? 
      Math.max(0.5, 1 - (populationDensity - 100) / 200) : 
      Math.min(1.2, 1 + (100 - populationDensity) / 200);
    
    // 年齢分布の影響
    const ageEffect = ageDistribution < 0.3 ? 1.2 : // 若年層が多い
                     ageDistribution > 0.7 ? 0.8 : // 高齢層が多い
                     1.0; // バランス型
    
    // 総合発展スコア
    const totalScore = 
      economicEffect * 0.25 +
      politicalEffect * 0.2 +
      socialEffect * 0.2 +
      geographicEffect * 0.15 +
      techEffect * 0.1 +
      riskScore * 0.05 +
      externalScore * 0.05 +
      economicPoliticalInteraction +
      socialTechInteraction +
      geographicEconomicInteraction;
    
    // 人口増加率の計算
    const growthRate = totalScore * taxEffect * densityEffect * ageEffect;
    const randomFactor = 0.8 + Math.random() * 0.4;
    const finalGrowthRate = growthRate * randomFactor;
    
    // 5年後の人口予測
    const futurePop = currentPop * (1 + finalGrowthRate * 0.1); // 年率成長率を10%に調整

    data.push({
      features: [
        currentPop / 15000,
        populationDensity / 200,
        ageDistribution,
        commerce,
        agriculture,
        industry,
        trade,
        wealth,
        governance,
        stability,
        lawEnforcement,
        publicServices,
        taxRate,
        education,
        culture,
        socialCohesion,
        innovation,
        tradition,
        location,
        climate,
        resources,
        accessibility,
        defense,
        naturalDisasters,
        conflicts,
        diseases,
        famines,
        technology,
        infrastructure,
        transportation,
        communication,
        sanitation,
        regionalInfluence,
        externalTrade,
        migration + 0.5, // 0-1に正規化
        externalThreats,
        economicScore,
        politicalScore,
        socialScore,
        geographicScore,
        riskScore,
        techScore,
        externalScore,
        economicEffect,
        politicalEffect,
        socialEffect,
        geographicEffect,
        techEffect,
        economicPoliticalInteraction,
        socialTechInteraction,
        geographicEconomicInteraction,
        taxEffect,
        densityEffect,
        ageEffect,
        totalScore,
        growthRate,
        finalGrowthRate
      ],
      label: Math.max(0, futurePop),
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['現在人口', '人口密度', '年齢分布', '商業発展度', '農業生産性', '工業発展度', '交易活動', '富の集中度', '統治能力', '政治安定性', '法執行力', '公共サービス', '税率', '教育レベル', '文化的発展', '社会結束力', '革新性', '伝統保持', '立地条件', '気候条件', '天然資源', '交通の便', '防衛力', '自然災害', '紛争', '疫病', '飢饉', '技術レベル', 'インフラ整備', '交通網', '通信網', '衛生環境', '地域影響力', '外部交易', '人口移動', '外部脅威', '経済スコア', '政治スコア', '社会スコア', '地理スコア', 'リスクスコア', '技術スコア', '外部スコア', '経済効果', '政治効果', '社会効果', '地理効果', '技術効果', '経済政治相互作用', '社会技術相互作用', '地理経済相互作用', '税率効果', '密度効果', '年齢効果', '総合スコア', '成長率', '最終成長率'],
    labelName: '5年後の人口',
  };
}

export function generateDewaDataset(): Dataset {
  const data = [];
  const routes = ['近距離', '中距離', '遠距離'];

  for (let i = 0; i < 900; i++) {
    // const routeIdx = Math.floor(Math.random() * 3);
    
    // 基本地理情報
    const distance = 200 + Math.random() * 1200; // 距離（km）
    const elevation = Math.random() * 2000; // 標高（m）
    const terrain = Math.random(); // 地形の困難さ
    const waterAvailability = Math.random(); // 水の利用可能性
    
    // 季節・天候要因
    const season = Math.random(); // 季節（0-1で正規化）
    const temperature = -10 + Math.random() * 40; // 気温（℃）
    const precipitation = Math.random() * 200; // 降水量（mm）
    const wind = Math.random() * 20; // 風速（m/s）
    const visibility = Math.random(); // 視界の良さ
    
    // 所要時間・効率
    const days = 3 + Math.random() * 25; // 所要日数
    const speed = Math.random(); // 移動速度
    const efficiency = Math.random(); // 効率性
    const reliability = Math.random(); // 信頼性
    
    // 経済要因
    const profit = Math.random(); // 利益率
    const cost = Math.random(); // コスト
    const demand = Math.random(); // 需要
    const supply = Math.random(); // 供給
    const marketPrice = Math.random(); // 市場価格
    
    // リスク要因
    const bandits = Math.random(); // 盗賊の脅威
    const weatherRisk = Math.random(); // 天候リスク
    const politicalRisk = Math.random(); // 政治リスク
    const accidentRisk = Math.random(); // 事故リスク
    const diseaseRisk = Math.random(); // 疫病リスク
    
    // 技術・インフラ
    const roadQuality = Math.random(); // 道路の質
    const bridgeCondition = Math.random(); // 橋の状態
    const restStops = Math.random(); // 休憩所の充実度
    const navigation = Math.random(); // 航法技術
    const communication = Math.random(); // 通信手段
    
    // 社会・文化要因
    const localRelations = Math.random(); // 現地との関係
    const culturalBarriers = Math.random(); // 文化的障壁
    const language = Math.random(); // 言語の通じやすさ
    const customs = Math.random(); // 慣習の理解度
    const diplomacy = Math.random(); // 外交関係
    
    // 貨物・商品要因
    const cargoType = Math.random(); // 貨物の種類
    const cargoValue = Math.random(); // 貨物の価値
    const cargoWeight = Math.random(); // 貨物の重量
    const cargoFragility = Math.random(); // 貨物の壊れやすさ
    const cargoPerishability = Math.random(); // 貨物の腐りやすさ
    
    // 複合的なルート最適化計算
    const geographicScore = (1 - terrain) * (1 + waterAvailability) * (1 - elevation / 2000);
    const weatherScore = (1 - Math.abs(temperature - 15) / 30) * (1 - precipitation / 200) * visibility;
    const efficiencyScore = speed * efficiency * reliability * (1 - days / 30);
    const economicScore = profit * demand * marketPrice * (1 - cost);
    const riskScore = 1 - (bandits + weatherRisk + politicalRisk + accidentRisk + diseaseRisk) / 5;
    const infrastructureScore = (roadQuality + bridgeCondition + restStops + navigation + communication) / 5;
    const socialScore = localRelations * (1 - culturalBarriers) * language * customs * diplomacy;
    const cargoScore = cargoValue * (1 - cargoFragility) * (1 - cargoPerishability) * (1 - cargoWeight);
    
    // 非線形関係を追加
    const distanceEffect = Math.pow(1 - distance / 1500, 1.5);
    const weatherEffect = Math.pow(weatherScore, 1.2);
    const economicEffect = Math.pow(economicScore, 1.3);
    const riskEffect = Math.pow(riskScore, 1.4);
    
    // 相互作用効果
    const weatherRiskInteraction = weatherScore * (1 - weatherRisk) * 0.3;
    const economicRiskInteraction = economicScore * riskScore * 0.4;
    const infrastructureSocialInteraction = infrastructureScore * socialScore * 0.2;
    const cargoEconomicInteraction = cargoScore * economicScore * 0.3;
    
    // 季節性の影響
    const seasonalEffect = 1 + 0.3 * Math.sin(season * 2 * Math.PI);
    const temperatureEffect = Math.max(0.1, 1 - Math.abs(temperature - 15) / 40);
    
    // 総合ルートスコア
    const totalScore = 
      distanceEffect * 0.2 +
      weatherEffect * 0.15 +
      economicEffect * 0.25 +
      riskEffect * 0.2 +
      infrastructureScore * 0.1 +
      socialScore * 0.05 +
      cargoScore * 0.05 +
      weatherRiskInteraction +
      economicRiskInteraction +
      infrastructureSocialInteraction +
      cargoEconomicInteraction +
      seasonalEffect * 0.1 +
      temperatureEffect * 0.1;
    
    // ルートタイプの決定
    let routeType;
    if (distance < 400) {
      routeType = 0; // 近距離
    } else if (distance < 800) {
      routeType = 1; // 中距離
    } else {
      routeType = 2; // 遠距離
    }
    
    // 最適性スコア
    const optimalityScore = totalScore * (1 + Math.random() * 0.2 - 0.1);
    
    // 追加の指標
    const safety = riskScore * (1 - accidentRisk * 0.5);
    const profitability = economicScore * (1 - cost * 0.3);
    const sustainability = (infrastructureScore + socialScore) / 2 * (1 - riskScore * 0.2);

    data.push({
      features: [
        distance / 1500,
        elevation / 2000,
        terrain,
        waterAvailability,
        season,
        temperature / 50,
        precipitation / 200,
        wind / 20,
        visibility,
        days / 30,
        speed,
        efficiency,
        reliability,
        profit,
        cost,
        demand,
        supply,
        marketPrice,
        bandits,
        weatherRisk,
        politicalRisk,
        accidentRisk,
        diseaseRisk,
        roadQuality,
        bridgeCondition,
        restStops,
        navigation,
        communication,
        localRelations,
        culturalBarriers,
        language,
        customs,
        diplomacy,
        cargoType,
        cargoValue,
        cargoWeight,
        cargoFragility,
        cargoPerishability,
        geographicScore,
        weatherScore,
        efficiencyScore,
        economicScore,
        riskScore,
        infrastructureScore,
        socialScore,
        cargoScore,
        distanceEffect,
        weatherEffect,
        economicEffect,
        riskEffect,
        weatherRiskInteraction,
        economicRiskInteraction,
        infrastructureSocialInteraction,
        cargoEconomicInteraction,
        seasonalEffect,
        temperatureEffect,
        totalScore,
        optimalityScore,
        safety,
        profitability,
        sustainability
      ],
      label: routeType,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['距離', '標高', '地形困難さ', '水利用可能性', '季節', '気温', '降水量', '風速', '視界', '所要日数', '移動速度', '効率性', '信頼性', '利益率', 'コスト', '需要', '供給', '市場価格', '盗賊脅威', '天候リスク', '政治リスク', '事故リスク', '疫病リスク', '道路品質', '橋状態', '休憩所充実度', '航法技術', '通信手段', '現地関係', '文化的障壁', '言語通じやすさ', '慣習理解度', '外交関係', '貨物種類', '貨物価値', '貨物重量', '貨物壊れやすさ', '貨物腐りやすさ', '地理スコア', '天候スコア', '効率スコア', '経済スコア', 'リスクスコア', 'インフラスコア', '社会スコア', '貨物スコア', '距離効果', '天候効果', '経済効果', 'リスク効果', '天候リスク相互作用', '経済リスク相互作用', 'インフラ社会相互作用', '貨物経済相互作用', '季節効果', '気温効果', '総合スコア', '最適性スコア', '安全性', '収益性', '持続可能性'],
    labelName: '航路タイプ',
    classes: routes,
  };
}

export function getDatasetForRegion(regionId: string): Dataset {
  switch (regionId) {
    case 'kyoto':
      return generateKyotoDataset();
    case 'sakai':
      return generateSakaiDataset();
    case 'kai':
      return generateKaiDataset();
    case 'echigo':
      return generateEchigoDataset();
    case 'owari':
      return generateOwariDataset();
    case 'satsuma':
      return generateSatsumaDataset();
    case 'hizen':
      return generateHizenDataset();
    case 'sagami':
      return generateSagamiDataset();
    case 'dewa':
      return generateDewaDataset();
    default:
      return generateKyotoDataset();
  }
}
