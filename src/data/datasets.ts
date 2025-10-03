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

  for (let i = 0; i < 300; i++) {
    const isReal = i < 150;
    
    // シンプルな特徴量（中学生にも分かりやすい）
    const age = isReal ? 50 + Math.random() * 200 : 5 + Math.random() * 50;
    const craftsmanship = isReal ? 0.6 + Math.random() * 0.4 : 0.2 + Math.random() * 0.6;
    const materialQuality = isReal ? 0.7 + Math.random() * 0.3 : 0.3 + Math.random() * 0.5;
    const patina = isReal ? Math.min(1, age / 300) + Math.random() * 0.2 : Math.random() * 0.3;
    
    // シンプルな真贋判定
    const authenticityScore = 
      craftsmanship * 0.4 +
      materialQuality * 0.3 +
      patina * 0.3 +
      (Math.random() - 0.5) * 0.2;

    const isAuthentic = authenticityScore > 0.5;

    data.push({
      features: [
        age / 300, // 年代（正規化）
        craftsmanship, // 職人技
        materialQuality, // 材質
        patina // 古色
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
  };
}

export function generateSakaiDataset(): Dataset {
  const data = [];
  const origins = ['中国', '南蛮', '朝鮮', '日本'];

  for (let i = 0; i < 300; i++) {
    const originIdx = Math.floor(Math.random() * 4);
    
    // シンプルな産地別の特徴
    let material, decoration, craftsmanship, price;
    
    switch (originIdx) {
      case 0: // 中国
        material = 0.7 + Math.random() * 0.3;
        decoration = 0.8 + Math.random() * 0.2;
        craftsmanship = 0.6 + Math.random() * 0.3;
        price = 0.4 + Math.random() * 0.4;
        break;
      case 1: // 南蛮
        material = 0.5 + Math.random() * 0.4;
        decoration = 0.3 + Math.random() * 0.5;
        craftsmanship = 0.4 + Math.random() * 0.4;
        price = 0.6 + Math.random() * 0.3;
        break;
      case 2: // 朝鮮
        material = 0.6 + Math.random() * 0.3;
        decoration = 0.5 + Math.random() * 0.4;
        craftsmanship = 0.7 + Math.random() * 0.3;
        price = 0.3 + Math.random() * 0.4;
        break;
      case 3: // 日本
      default:
        material = 0.4 + Math.random() * 0.4;
        decoration = 0.6 + Math.random() * 0.3;
        craftsmanship = 0.5 + Math.random() * 0.4;
        price = 0.2 + Math.random() * 0.3;
        break;
    }

      data.push({
      features: [
        material, // 材質
        decoration, // 装飾
        craftsmanship, // 職人技
        price // 価格
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
  };
}

export function generateKaiDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    // シンプルな特徴量
    const workers = 30 + Math.random() * 120;
    const experience = Math.random(); // 労働者の経験値
    const temp = 5 + Math.random() * 25; // 気温
    const rainfall = 50 + Math.random() * 200; // 降水量
    const equipment = 0.2 + Math.random() * 0.8; // 採掘機具の質
    const oreQuality = 0.2 + Math.random() * 0.8; // 鉱石の品質
    
    // シンプルな産出量計算
    const workerEffect = workers * experience / 100;
    const weatherEffect = Math.max(0.1, 1 - Math.abs(temp - 15) / 30) * (1 - rainfall / 300);
    const techEffect = equipment;
    const geologicalEffect = oreQuality;
    
    const output = workerEffect * weatherEffect * techEffect * geologicalEffect * (0.8 + Math.random() * 0.4);

    data.push({
      features: [
        workers / 150, // 労働者数（正規化）
        experience, // 経験値
        temp / 40, // 気温（正規化）
        rainfall / 300, // 降水量（正規化）
        equipment, // 機具の質
        oreQuality // 鉱石の品質
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
  };
}

export function generateEchigoDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    // シンプルな特徴量
    const temperature = 5 + Math.random() * 25; // 気温
    const rainfall = 50 + Math.random() * 200; // 降水量
    const sunshine = 100 + Math.random() * 200; // 日照時間
    const soilQuality = 0.2 + Math.random() * 0.8; // 土壌の質
    const seedQuality = 0.3 + Math.random() * 0.7; // 種子の質
    const fertilizer = 0.2 + Math.random() * 0.8; // 肥料の量
    
    // シンプルな収穫量計算
    const weatherEffect = Math.max(0.1, 1 - Math.abs(temperature - 20) / 30) * (1 - rainfall / 400) * (sunshine / 300);
    const soilEffect = soilQuality * seedQuality * fertilizer;
    
    const harvestYield = weatherEffect * soilEffect * (0.8 + Math.random() * 0.4);

    data.push({
      features: [
        temperature / 40, // 気温（正規化）
        rainfall / 300, // 降水量（正規化）
        sunshine / 300, // 日照時間（正規化）
        soilQuality, // 土壌の質
        seedQuality, // 種子の質
        fertilizer // 肥料の量
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
  };
}

export function generateOwariDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    // シンプルな特徴量
    const age = 18 + Math.random() * 40; // 年齢
    const strength = Math.random(); // 筋力
    const agility = Math.random(); // 敏捷性
    const intelligence = Math.random(); // 知力
    const experience = Math.random(); // 戦闘経験
    const socialClass = Math.random(); // 社会階級
    
    // シンプルな役職判定
    const physicalScore = (strength + agility) / 2;
    const mentalScore = intelligence;
    const experienceScore = experience;
    const socialScore = socialClass;
    
    const totalScore = physicalScore * 0.4 + mentalScore * 0.3 + experienceScore * 0.2 + socialScore * 0.1;
    
    let role = 0; // 槍兵
    if (totalScore > 0.7) role = 3; // 騎馬隊
    else if (totalScore > 0.5) role = 2; // 鉄砲隊
    else if (totalScore > 0.3) role = 1; // 弓兵

      data.push({
      features: [
        age / 60, // 年齢（正規化）
        strength, // 筋力
        agility, // 敏捷性
        intelligence, // 知力
        experience, // 戦闘経験
        socialClass // 社会階級
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
  };
}

export function generateSatsumaDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    // シンプルな特徴量
    const ironQuality = 0.2 + Math.random() * 0.8; // 鉄の品質
    const steelQuality = 0.2 + Math.random() * 0.8; // 鋼の品質
    const forging = 0.3 + Math.random() * 0.7; // 鍛造技術
    const assembly = 0.3 + Math.random() * 0.7; // 組み立て精度
    const testing = 0.4 + Math.random() * 0.6; // 検査の厳密さ
    const temperature = 800 + Math.random() * 400; // 製造温度
    
    // シンプルな品質判定
    const materialScore = (ironQuality + steelQuality) / 2;
    const processScore = (forging + assembly) / 2;
    const qualityScore = materialScore * 0.4 + processScore * 0.4 + testing * 0.2;
    
    const isGood = qualityScore > 0.6 && temperature > 1000;

    data.push({
      features: [
        ironQuality, // 鉄の品質
        steelQuality, // 鋼の品質
        forging, // 鍛造技術
        assembly, // 組み立て精度
        testing, // 検査の厳密さ
        temperature / 1500 // 製造温度（正規化）
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
  };
}

export function generateHizenDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    // シンプルな特徴量
    const clayQuality = 0.2 + Math.random() * 0.8; // 粘土の品質
    const glazeQuality = 0.3 + Math.random() * 0.7; // 釉薬の品質
    const firingTemp = 800 + Math.random() * 400; // 焼成温度
    const potterSkill = 0.3 + Math.random() * 0.7; // 陶工の技能
    const decoration = 0.2 + Math.random() * 0.8; // 装飾の美しさ
    const thickness = 0.1 + Math.random() * 0.9; // 厚さの均一性
    
    // シンプルな品質判定
    const materialScore = (clayQuality + glazeQuality) / 2;
    const processScore = (potterSkill + decoration) / 2;
    const qualityScore = materialScore * 0.3 + processScore * 0.3 + (firingTemp / 1500) * 0.2 + thickness * 0.2;
    
    let grade = 0; // 下級
    if (qualityScore > 0.8) grade = 2; // 上級
    else if (qualityScore > 0.6) grade = 1; // 中級

      data.push({
      features: [
        clayQuality, // 粘土の品質
        glazeQuality, // 釉薬の品質
        firingTemp / 1500, // 焼成温度（正規化）
        potterSkill, // 陶工の技能
        decoration, // 装飾の美しさ
        thickness // 厚さの均一性
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
  };
}

export function generateSagamiDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    // シンプルな特徴量
    const population = 1000 + Math.random() * 9000; // 人口
    const commerce = 0.2 + Math.random() * 0.8; // 商業の発達度
    const agriculture = 0.3 + Math.random() * 0.7; // 農業の発達度
    const governance = 0.2 + Math.random() * 0.8; // 統治の質
    const stability = 0.3 + Math.random() * 0.7; // 政治安定性
    const location = 0.2 + Math.random() * 0.8; // 立地の良さ
    
    // シンプルな繁栄度計算
    const prosperity = (commerce + agriculture + governance + stability + location) / 5;
    
    let level = 0; // 低い
    if (prosperity > 0.7) level = 2; // 高い
    else if (prosperity > 0.5) level = 1; // 中程度

    data.push({
      features: [
        population / 10000, // 人口（正規化）
        commerce, // 商業の発達度
        agriculture, // 農業の発達度
        governance, // 統治の質
        stability, // 政治安定性
        location // 立地の良さ
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
  };
}

export function generateDewaDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    // シンプルな特徴量
    const distance = 10 + Math.random() * 90; // 距離
    const elevation = 100 + Math.random() * 400; // 標高
    const weather = 0.2 + Math.random() * 0.8; // 天候の良さ
    const roadQuality = 0.3 + Math.random() * 0.7; // 道路の質
    const cargoValue = 0.2 + Math.random() * 0.8; // 荷物の価値
    const season = Math.random(); // 季節
    
    // シンプルな輸送効率計算
    const distanceEffect = 1 - distance / 100;
    const elevationEffect = 1 - elevation / 1000;
    const weatherEffect = weather;
    const roadEffect = roadQuality;
    const seasonEffect = 1 - Math.abs(season - 0.5) * 0.3;
    
    const efficiency = distanceEffect * elevationEffect * weatherEffect * roadEffect * seasonEffect * cargoValue;

      data.push({
      features: [
        distance / 100, // 距離（正規化）
        elevation / 1000, // 標高（正規化）
        weather, // 天候の良さ
        roadQuality, // 道路の質
        cargoValue, // 荷物の価値
        season // 季節
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