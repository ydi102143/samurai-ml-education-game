import type { Dataset } from '../types/ml';

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 正規分布を生成する関数
function normalRandom(mean: number, std: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * std + mean;
}


export function generateKyotoDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    const isReal = i < 150;
    
    // 現実的な特徴量分布
    const age = isReal 
      ? Math.max(50, normalRandom(150, 50)) // 本物は古い年代に集中
      : Math.max(5, normalRandom(30, 20));  // 贋作は新しい年代に集中
    
    const craftsmanship = isReal 
      ? Math.min(1, Math.max(0, normalRandom(0.75, 0.15))) // 本物は高い職人技
      : Math.min(1, Math.max(0, normalRandom(0.4, 0.2)));  // 贋作は低い職人技
    
    const materialQuality = isReal 
      ? Math.min(1, Math.max(0, normalRandom(0.8, 0.1)))   // 本物は高品質材質
      : Math.min(1, Math.max(0, normalRandom(0.5, 0.2)));  // 贋作は低品質材質
    
    const patina = isReal 
      ? Math.min(1, Math.max(0, age / 300 + normalRandom(0, 0.1))) // 年代に応じた古色
      : Math.min(1, Math.max(0, normalRandom(0.2, 0.15)));         // 贋作は薄い古色
    
    // 現実的な真贋判定（重み付きスコア）
    const authenticityScore = 
      craftsmanship * 0.4 +
      materialQuality * 0.3 +
      patina * 0.2 +
      (age > 100 ? 0.1 : 0) + // 年代ボーナス
      normalRandom(0, 0.1);   // ノイズ

    const isAuthentic = authenticityScore > 0.6;

    data.push({
      features: [
        Math.min(1, age / 300), // 年代（正規化）
        craftsmanship,          // 職人技
        materialQuality,        // 材質
        patina                  // 古色
      ],
      label: isAuthentic ? 1 : 0,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['年代', '職人技', '材質', '古色'],
    classes: ['贋作', '本物'],
    labelName: '真贋',
  };
}

export function generateSakaiDataset(): Dataset {
  const data = [];
  const origins = ['中国', '南蛮', '朝鮮', '日本'];

  for (let i = 0; i < 300; i++) {
    const originIdx = Math.floor(Math.random() * 4);
    
    // 産地別の現実的な特徴パターン
    let material, decoration, craftsmanship, price;
    
    switch (originIdx) {
      case 0: // 中国 - 高品質、高装飾、中価格
        material = Math.min(1, Math.max(0, normalRandom(0.8, 0.1)));
        decoration = Math.min(1, Math.max(0, normalRandom(0.85, 0.1)));
        craftsmanship = Math.min(1, Math.max(0, normalRandom(0.7, 0.15)));
        price = Math.min(1, Math.max(0, normalRandom(0.6, 0.2)));
        break;
      case 1: // 南蛮 - 中品質、低装飾、高価格（希少性）
        material = Math.min(1, Math.max(0, normalRandom(0.6, 0.15)));
        decoration = Math.min(1, Math.max(0, normalRandom(0.3, 0.2)));
        craftsmanship = Math.min(1, Math.max(0, normalRandom(0.5, 0.2)));
        price = Math.min(1, Math.max(0, normalRandom(0.8, 0.15)));
        break;
      case 2: // 朝鮮 - 高品質、中装飾、低価格
        material = Math.min(1, Math.max(0, normalRandom(0.75, 0.1)));
        decoration = Math.min(1, Math.max(0, normalRandom(0.6, 0.15)));
        craftsmanship = Math.min(1, Math.max(0, normalRandom(0.8, 0.1)));
        price = Math.min(1, Math.max(0, normalRandom(0.4, 0.15)));
        break;
      case 3: // 日本 - 中品質、高装飾、中価格
      default:
        material = Math.min(1, Math.max(0, normalRandom(0.6, 0.15)));
        decoration = Math.min(1, Math.max(0, normalRandom(0.7, 0.15)));
        craftsmanship = Math.min(1, Math.max(0, normalRandom(0.65, 0.15)));
        price = Math.min(1, Math.max(0, normalRandom(0.5, 0.15)));
        break;
    }

    data.push({
      features: [
        material,      // 材質
        decoration,    // 装飾
        craftsmanship, // 職人技
        price          // 価格
      ],
      label: originIdx,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['材質', '装飾', '職人技', '価格'],
    classes: origins,
    labelName: '産地',
  };
}

export function generateKaiDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    // 現実的な鉱山の特徴量
    const workers = Math.max(20, Math.min(150, normalRandom(80, 25))); // 労働者数
    const experience = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 経験値
    const temp = Math.max(-5, Math.min(35, normalRandom(15, 8))); // 気温（現実的な範囲）
    const rainfall = Math.max(0, Math.min(300, normalRandom(100, 40))); // 降水量
    const equipment = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 機具の質
    const oreQuality = Math.min(1, Math.max(0, normalRandom(0.5, 0.25))); // 鉱石の品質
    
    // 現実的な産出量計算（非線形関係を含む）
    const workerEffect = Math.log(workers) * experience / 10; // 対数効果
    const weatherEffect = Math.max(0.1, 1 - Math.abs(temp - 15) / 30) * (1 - rainfall / 400);
    const techEffect = Math.pow(equipment, 1.5); // 非線形効果
    const geologicalEffect = Math.pow(oreQuality, 2); // 非線形効果
    
    const baseOutput = workerEffect * weatherEffect * techEffect * geologicalEffect;
    const output = Math.max(0, baseOutput * (0.8 + Math.random() * 0.4));

    data.push({
      features: [
        workers / 150,        // 労働者数（正規化）
        experience,           // 経験値
        (temp + 5) / 40,      // 気温（正規化）
        rainfall / 300,       // 降水量（正規化）
        equipment,            // 機具の質
        oreQuality            // 鉱石の品質
      ],
      label: output,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['労働者数', '経験値', '気温', '降水量', '機具の質', '鉱石の品質'],
    classes: [],
    labelName: '産出量',
  };
}

export function generateEchigoDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    // 現実的な農業の特徴量
    const temperature = Math.max(-10, Math.min(35, normalRandom(20, 8))); // 気温
    const rainfall = Math.max(0, Math.min(400, normalRandom(150, 50))); // 降水量
    const sunshine = Math.max(50, Math.min(300, normalRandom(200, 40))); // 日照時間
    const soilQuality = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 土壌の質
    const seedQuality = Math.min(1, Math.max(0, normalRandom(0.7, 0.15))); // 種子の質
    const fertilizer = Math.min(1, Math.max(0, normalRandom(0.5, 0.25))); // 肥料の量
    
    // 現実的な収穫量計算（最適条件からの偏差）
    const tempOptimal = 20;
    const rainOptimal = 150;
    const sunOptimal = 200;
    
    const tempEffect = Math.exp(-Math.pow(temperature - tempOptimal, 2) / 100);
    const rainEffect = Math.exp(-Math.pow(rainfall - rainOptimal, 2) / 5000);
    const sunEffect = Math.min(1, sunshine / sunOptimal);
    const soilEffect = Math.pow(soilQuality * seedQuality * fertilizer, 0.8);
    
    const harvestYield = tempEffect * rainEffect * sunEffect * soilEffect * (0.7 + Math.random() * 0.6);

    data.push({
      features: [
        (temperature + 10) / 45, // 気温（正規化）
        rainfall / 400,          // 降水量（正規化）
        sunshine / 300,          // 日照時間（正規化）
        soilQuality,             // 土壌の質
        seedQuality,             // 種子の質
        fertilizer               // 肥料の量
      ],
      label: harvestYield,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['気温', '降水量', '日照時間', '土壌の質', '種子の質', '肥料の量'],
    classes: [],
    labelName: '収穫量',
  };
}

export function generateOwariDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    // 現実的な兵士の特徴量
    const age = Math.max(18, Math.min(60, normalRandom(30, 10))); // 年齢
    const strength = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 筋力
    const agility = Math.min(1, Math.max(0, normalRandom(0.5, 0.2))); // 敏捷性
    const intelligence = Math.min(1, Math.max(0, normalRandom(0.5, 0.2))); // 知力
    const experience = Math.min(1, Math.max(0, normalRandom(0.4, 0.25))); // 戦闘経験
    const socialClass = Math.min(1, Math.max(0, normalRandom(0.5, 0.3))); // 社会階級
    
    // 年齢による能力の調整
    const ageEffect = age < 25 ? 1.1 : age > 45 ? 0.9 : 1.0;
    const adjustedStrength = Math.min(1, strength * ageEffect);
    const adjustedAgility = Math.min(1, agility * ageEffect);
    
    // 現実的な役職判定（重み付きスコア）
    const physicalScore = (adjustedStrength + adjustedAgility) / 2;
    const mentalScore = intelligence;
    const experienceScore = experience;
    const socialScore = socialClass;
    
    const totalScore = physicalScore * 0.35 + mentalScore * 0.25 + experienceScore * 0.25 + socialScore * 0.15;
    
    let role = 0; // 槍兵（デフォルト）
    if (totalScore > 0.75) role = 3; // 騎馬隊（最高）
    else if (totalScore > 0.55) role = 2; // 鉄砲隊（高）
    else if (totalScore > 0.35) role = 1; // 弓兵（中）

    data.push({
      features: [
        age / 60,              // 年齢（正規化）
        adjustedStrength,      // 筋力
        adjustedAgility,       // 敏捷性
        intelligence,          // 知力
        experience,            // 戦闘経験
        socialClass            // 社会階級
      ],
      label: role,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['年齢', '筋力', '敏捷性', '知力', '戦闘経験', '社会階級'],
    classes: ['槍兵', '弓兵', '鉄砲隊', '騎馬隊'],
    labelName: '役職',
  };
}

export function generateSatsumaDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    // 現実的な鉄砲製造の特徴量
    const ironQuality = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 鉄の品質
    const steelQuality = Math.min(1, Math.max(0, normalRandom(0.7, 0.15))); // 鋼の品質
    const forging = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 鍛造技術
    const assembly = Math.min(1, Math.max(0, normalRandom(0.65, 0.18))); // 組み立て精度
    const testing = Math.min(1, Math.max(0, normalRandom(0.7, 0.15))); // 検査の厳密さ
    const temperature = Math.max(800, Math.min(1400, normalRandom(1100, 150))); // 製造温度
    
    // 現実的な品質判定（複合条件）
    const materialScore = (ironQuality + steelQuality) / 2;
    const processScore = (forging + assembly) / 2;
    const qualityScore = materialScore * 0.4 + processScore * 0.4 + testing * 0.2;
    
    // 温度条件と品質スコアの両方を満たす必要
    const isGood = qualityScore > 0.65 && temperature > 1000 && temperature < 1300;

    data.push({
      features: [
        ironQuality,           // 鉄の品質
        steelQuality,          // 鋼の品質
        forging,               // 鍛造技術
        assembly,              // 組み立て精度
        testing,               // 検査の厳密さ
        temperature / 1500     // 製造温度（正規化）
      ],
      label: isGood ? 1 : 0,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['鉄の品質', '鋼の品質', '鍛造技術', '組み立て精度', '検査の厳密さ', '製造温度'],
    classes: ['不良品', '良品'],
    labelName: '品質',
  };
}

export function generateHizenDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    // 現実的な陶器製造の特徴量
    const clayQuality = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 粘土の品質
    const glazeQuality = Math.min(1, Math.max(0, normalRandom(0.7, 0.15))); // 釉薬の品質
    const firingTemp = Math.max(800, Math.min(1400, normalRandom(1200, 100))); // 焼成温度
    const potterSkill = Math.min(1, Math.max(0, normalRandom(0.65, 0.2))); // 陶工の技能
    const decoration = Math.min(1, Math.max(0, normalRandom(0.5, 0.25))); // 装飾の美しさ
    const thickness = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 厚さの均一性
    
    // 現実的な等級判定（複合スコア）
    const materialScore = (clayQuality + glazeQuality) / 2;
    const processScore = (potterSkill + decoration) / 2;
    const tempScore = Math.exp(-Math.pow(firingTemp - 1200, 2) / 20000); // 最適温度からの偏差
    const qualityScore = materialScore * 0.3 + processScore * 0.3 + tempScore * 0.2 + thickness * 0.2;
    
    let grade = 0; // 下級
    if (qualityScore > 0.8) grade = 2; // 上級
    else if (qualityScore > 0.6) grade = 1; // 中級

    data.push({
      features: [
        clayQuality,           // 粘土の品質
        glazeQuality,          // 釉薬の品質
        firingTemp / 1500,     // 焼成温度（正規化）
        potterSkill,           // 陶工の技能
        decoration,            // 装飾の美しさ
        thickness              // 厚さの均一性
      ],
      label: grade,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['粘土の品質', '釉薬の品質', '焼成温度', '陶工の技能', '装飾の美しさ', '厚さの均一性'],
    classes: ['下級', '中級', '上級'],
    labelName: '等級',
  };
}

export function generateSagamiDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    // 現実的な地域繁栄の特徴量
    const population = Math.max(1000, Math.min(10000, normalRandom(5000, 2000))); // 人口
    const commerce = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 商業の発達度
    const agriculture = Math.min(1, Math.max(0, normalRandom(0.7, 0.15))); // 農業の発達度
    const governance = Math.min(1, Math.max(0, normalRandom(0.5, 0.25))); // 統治の質
    const stability = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 政治安定性
    const location = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 立地の良さ
    
    // 現実的な繁栄度計算（相互依存関係を含む）
    const baseProsperity = (commerce + agriculture + governance + stability + location) / 5;
    const populationEffect = Math.log(population / 1000) / 10; // 人口の対数効果
    const interactionEffect = commerce * agriculture * 0.1; // 商業と農業の相互作用
    
    const prosperity = Math.min(1, Math.max(0, baseProsperity + populationEffect + interactionEffect));
    
    let level = 0; // 低い
    if (prosperity > 0.75) level = 2; // 高い
    else if (prosperity > 0.5) level = 1; // 中程度

    data.push({
      features: [
        population / 10000,    // 人口（正規化）
        commerce,              // 商業の発達度
        agriculture,           // 農業の発達度
        governance,            // 統治の質
        stability,             // 政治安定性
        location               // 立地の良さ
      ],
      label: level,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['人口', '商業の発達度', '農業の発達度', '統治の質', '政治安定性', '立地の良さ'],
    classes: ['低い', '中程度', '高い'],
    labelName: '繁栄度',
  };
}

export function generateDewaDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    // 現実的な輸送の特徴量
    const distance = Math.max(10, Math.min(100, normalRandom(50, 20))); // 距離
    const elevation = Math.max(100, Math.min(500, normalRandom(300, 100))); // 標高
    const weather = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 天候の良さ
    const roadQuality = Math.min(1, Math.max(0, normalRandom(0.5, 0.25))); // 道路の質
    const cargoValue = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 荷物の価値
    const season = Math.random(); // 季節（0-1の範囲）
    
    // 現実的な輸送効率計算（非線形関係を含む）
    const distanceEffect = Math.exp(-distance / 50); // 距離の指数効果
    const elevationEffect = Math.exp(-elevation / 1000); // 標高の指数効果
    const weatherEffect = weather;
    const roadEffect = Math.pow(roadQuality, 1.5); // 道路品質の非線形効果
    const seasonEffect = 1 - Math.abs(season - 0.5) * 0.3; // 季節効果（春・秋が最適）
    
    const efficiency = distanceEffect * elevationEffect * weatherEffect * roadEffect * seasonEffect * cargoValue;

    data.push({
      features: [
        distance / 100,        // 距離（正規化）
        elevation / 1000,      // 標高（正規化）
        weather,               // 天候の良さ
        roadQuality,           // 道路の質
        cargoValue,            // 荷物の価値
        season                 // 季節
      ],
      label: efficiency,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['距離', '標高', '天候の良さ', '道路の質', '荷物の価値', '季節'],
    classes: [],
    labelName: '輸送効率',
  };
}

// 地域IDに基づいてデータセットを取得する関数
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