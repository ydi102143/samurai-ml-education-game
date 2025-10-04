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
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    const isReal = i < 150;
    
    // 戦国時代の特徴量分布（茶器の年代は戦国時代以前が本物）
    const age = isReal 
      ? Math.max(1300, normalRandom(1300, 50)) // 本物は戦国時代以前（1200-1400年頃）
      : Math.max(1400, normalRandom(1400, 50)); // 贋作は戦国時代以降（1500-1600年頃）
    
    const craftsmanship = isReal 
      ? Math.min(10, Math.max(1, normalRandom(8, 1.5))) // 本物は高い職人技（1-10点）
      : Math.min(10, Math.max(1, normalRandom(4, 1.5))); // 贋作は低い職人技（1-10点）
    
    const materialQuality = isReal 
      ? Math.min(10, Math.max(1, normalRandom(8, 1)))   // 本物は高品質材質（1-10点）
      : Math.min(10, Math.max(1, normalRandom(5, 1.5))); // 贋作は低品質材質（1-10点）
    
    const patina = isReal 
      ? Math.min(10, Math.max(1, normalRandom(8, 1.5))) // 本物は深い古色（1-10点）
      : Math.min(10, Math.max(1, normalRandom(3, 1)));  // 贋作は薄い古色（1-10点）
    
    // 現実的な真贋判定（重み付きスコア）
    const authenticityScore = 
      (craftsmanship / 10) * 0.4 +
      (materialQuality / 10) * 0.3 +
      (patina / 10) * 0.2 +
      (age < 1500 ? 0.1 : 0) + // 戦国時代以前ボーナス
      normalRandom(0, 0.05);   // ノイズ

    const isAuthentic = authenticityScore > 0.6;

    // 生データ（前処理前）を保持
    raw.push({
      features: [
        Math.round(age),              // 年代（年）
        Math.round(craftsmanship),    // 職人技（1-10点）
        Math.round(materialQuality),  // 材質（1-10点）
        Math.round(patina)            // 古色（1-10点）
      ],
      label: isAuthentic ? 1 : 0,
    });

    data.push({
      features: [
        Math.min(1, (age - 1200) / 400), // 年代（正規化：1200-1600年を0-1に）
        craftsmanship / 10,                // 職人技（正規化）
        materialQuality / 10,              // 材質（正規化）
        patina / 10                        // 古色（正規化）
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
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['年代', '職人技', '材質', '古色'],
      featureUnits: ['年', '点', '点', '点']
    }
  };
}

export function generateSakaiDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];
  const origins = ['中国', '南蛮', '朝鮮', '日本'];

  for (let i = 0; i < 300; i++) {
    const originIdx = Math.floor(Math.random() * 4);
    
    // 産地別の現実的な特徴パターン（1-10点スケール）
    let material, decoration, craftsmanship, price;
    
    switch (originIdx) {
      case 0: // 中国 - 高品質、高装飾、中価格
        material = Math.min(10, Math.max(1, normalRandom(8, 1.5)));
        decoration = Math.min(10, Math.max(1, normalRandom(8.5, 1)));
        craftsmanship = Math.min(10, Math.max(1, normalRandom(7, 1.5)));
        price = Math.min(500, Math.max(50, normalRandom(300, 100))); // 50-500文（戦国時代の価格）
        break;
      case 1: // 南蛮 - 中品質、低装飾、高価格（希少性）
        material = Math.min(10, Math.max(1, normalRandom(6, 1.5)));
        decoration = Math.min(10, Math.max(1, normalRandom(3, 2)));
        craftsmanship = Math.min(10, Math.max(1, normalRandom(5, 2)));
        price = Math.min(500, Math.max(50, normalRandom(400, 80))); // 50-500文（戦国時代の価格）
        break;
      case 2: // 朝鮮 - 高品質、中装飾、低価格
        material = Math.min(10, Math.max(1, normalRandom(7.5, 1)));
        decoration = Math.min(10, Math.max(1, normalRandom(6, 1.5)));
        craftsmanship = Math.min(10, Math.max(1, normalRandom(8, 1)));
        price = Math.min(500, Math.max(50, normalRandom(200, 80))); // 50-500文（戦国時代の価格）
        break;
      case 3: // 日本 - 中品質、高装飾、中価格
      default:
        material = Math.min(10, Math.max(1, normalRandom(6, 1.5)));
        decoration = Math.min(10, Math.max(1, normalRandom(7, 1.5)));
        craftsmanship = Math.min(10, Math.max(1, normalRandom(6.5, 1.5)));
        price = Math.min(500, Math.max(50, normalRandom(250, 80))); // 50-500文（戦国時代の価格）
        break;
    }

    // 生データ
    raw.push({
      features: [
        Math.round(material),      // 材質（1-10点）
        Math.round(decoration),    // 装飾（1-10点）
        Math.round(craftsmanship), // 職人技（1-10点）
        Math.round(price)          // 価格（100-1000文）
      ],
      label: origins[originIdx], // 文字列で保存
    });

      data.push({
      features: [
        material / 10,      // 材質（正規化）
        decoration / 10,    // 装飾（正規化）
        craftsmanship / 10, // 職人技（正規化）
        price / 500         // 価格（正規化）
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
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['材質', '装飾', '職人技', '価格'],
      featureUnits: ['点', '点', '点', '文']
    }
  };
}

export function generateKaiDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 戦国時代の鉱山の特徴量
    const workers = Math.max(5, Math.min(100, normalRandom(40, 20))); // 労働者数（5-100人、戦国時代の規模）
    const experience = Math.max(1, Math.min(15, normalRandom(6, 3))); // 経験値（1-15年）
    const temp = Math.max(-5, Math.min(30, normalRandom(15, 8))); // 気温（-5〜30℃）
    const rainfall = Math.max(0, Math.min(300, normalRandom(100, 40))); // 降水量（0-300mm）
    const equipment = Math.max(1, Math.min(8, normalRandom(4, 2))); // 機具の質（1-8点、戦国時代の技術）
    const oreQuality = Math.max(1, Math.min(8, normalRandom(4, 2))); // 鉱石の品質（1-8点）
    
    // 戦国時代の産出量計算（非線形関係を含む）
    const workerEffect = Math.log(workers) * experience / 15; // 対数効果
    const weatherEffect = Math.max(0.1, 1 - Math.abs(temp - 15) / 25) * (1 - rainfall / 300);
    const techEffect = Math.pow(equipment / 8, 1.5); // 非線形効果
    const geologicalEffect = Math.pow(oreQuality / 8, 2); // 非線形効果
    
    const baseOutput = workerEffect * weatherEffect * techEffect * geologicalEffect;
    const output = Math.max(0, baseOutput * 50 * (0.7 + Math.random() * 0.6)); // 産出量（両、戦国時代の規模）

    // 生データ（単位付き）
    raw.push({
      features: [
        Math.round(workers),      // 労働者数（人）
        Math.round(experience),   // 経験値（年）
        Math.round(temp),         // 気温（℃）
        Math.round(rainfall),     // 降水量（mm）
        Math.round(equipment),    // 機具の質（1-10点）
        Math.round(oreQuality)    // 鉱石の品質（1-10点）
      ],
      label: Math.round(output * 10) / 10, // 産出量（両）
    });

    data.push({
      features: [
        workers / 100,        // 労働者数（正規化）
        experience / 15,      // 経験値（正規化）
        (temp + 5) / 35,      // 気温（正規化）
        rainfall / 300,       // 降水量（正規化）
        equipment / 8,        // 機具の質（正規化）
        oreQuality / 8        // 鉱石の品質（正規化）
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
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['労働者数', '経験値', '気温', '降水量', '機具の質', '鉱石の品質'],
      featureUnits: ['人', '年', '℃', 'mm', '点', '点']
    }
  };
}

export function generateEchigoDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 戦国時代の農業の特徴量
    const temperature = Math.max(-5, Math.min(30, normalRandom(18, 6))); // 気温（-5〜30℃）
    const rainfall = Math.max(0, Math.min(300, normalRandom(120, 40))); // 降水量（0-300mm）
    const sunshine = Math.max(80, Math.min(250, normalRandom(160, 40))); // 日照時間（80-250時間）
    const soilQuality = Math.max(1, Math.min(8, normalRandom(5, 1.5))); // 土壌の質（1-8点、戦国時代の技術）
    const seedQuality = Math.max(1, Math.min(8, normalRandom(5, 1.5))); // 種子の質（1-8点）
    const fertilizer = Math.max(0, Math.min(50, normalRandom(25, 15))); // 肥料の量（0-50kg、戦国時代の施肥）
    
    // 戦国時代の収穫量計算（最適条件からの偏差）
    const tempOptimal = 18;
    const rainOptimal = 120;
    const sunOptimal = 160;
    
    const tempEffect = Math.exp(-Math.pow(temperature - tempOptimal, 2) / 80);
    const rainEffect = Math.exp(-Math.pow(rainfall - rainOptimal, 2) / 3000);
    const sunEffect = Math.min(1, sunshine / sunOptimal);
    const soilEffect = Math.pow((soilQuality / 8) * (seedQuality / 8) * (fertilizer / 50), 0.8);
    
    const harvestYield = tempEffect * rainEffect * sunEffect * soilEffect * 500 * (0.6 + Math.random() * 0.8); // 収穫量（石、戦国時代の規模）

    // 生データ（単位付き）
    raw.push({
      features: [
        Math.round(temperature),  // 気温（℃）
        Math.round(rainfall),     // 降水量（mm）
        Math.round(sunshine),     // 日照時間（時間）
        Math.round(soilQuality),  // 土壌の質（1-10点）
        Math.round(seedQuality),  // 種子の質（1-10点）
        Math.round(fertilizer)    // 肥料の量（kg）
      ],
      label: Math.round(harvestYield * 10) / 10, // 収穫量（石）
    });

    data.push({
      features: [
        (temperature + 5) / 35,  // 気温（正規化）
        rainfall / 300,          // 降水量（正規化）
        sunshine / 250,          // 日照時間（正規化）
        soilQuality / 8,         // 土壌の質（正規化）
        seedQuality / 8,         // 種子の質（正規化）
        fertilizer / 50          // 肥料の量（正規化）
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
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['気温', '降水量', '日照時間', '土壌の質', '種子の質', '肥料の量'],
      featureUnits: ['℃', 'mm', '時間', '点', '点', 'kg']
    }
  };
}

export function generateOwariDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 戦国時代の兵士の特徴量
    const age = Math.max(16, Math.min(50, normalRandom(25, 8))); // 年齢（16-50歳、戦国時代の兵士年齢）
    const strength = Math.max(1, Math.min(10, normalRandom(6, 2))); // 筋力（1-10点）
    const agility = Math.max(1, Math.min(10, normalRandom(5, 2))); // 敏捷性（1-10点）
    const intelligence = Math.max(1, Math.min(10, normalRandom(5, 2))); // 知力（1-10点）
    const experience = Math.max(0, Math.min(20, normalRandom(3, 4))); // 戦闘経験（0-20年）
    const socialClass = Math.max(1, Math.min(5, normalRandom(3, 1))); // 社会階級（1-5段階：農民1、足軽2、武士3、侍大将4、家老5）
    
    // 年齢による能力の調整（戦国時代の兵士）
    const ageEffect = age < 20 ? 1.1 : age > 40 ? 0.9 : 1.0;
    const adjustedStrength = Math.min(10, Math.max(1, strength * ageEffect));
    const adjustedAgility = Math.min(10, Math.max(1, agility * ageEffect));
    
    // 戦国時代の役職判定（重み付きスコア）
    const physicalScore = (adjustedStrength + adjustedAgility) / 20; // 正規化
    const mentalScore = intelligence / 10; // 正規化
    const experienceScore = experience / 20; // 正規化
    const socialScore = socialClass / 5; // 正規化
    
    const totalScore = physicalScore * 0.35 + mentalScore * 0.25 + experienceScore * 0.25 + socialScore * 0.15;
    
    let role = 0; // 槍兵（デフォルト）
    if (totalScore > 0.75) role = 3; // 騎馬隊（最高）
    else if (totalScore > 0.55) role = 2; // 鉄砲隊（高）
    else if (totalScore > 0.35) role = 1; // 弓兵（中）

    // 生データ（単位付き）
    const roles = ['槍兵', '弓兵', '鉄砲隊', '騎馬隊'];
    raw.push({
      features: [
        Math.round(age),           // 年齢（歳）
        Math.round(adjustedStrength), // 筋力（1-10点）
        Math.round(adjustedAgility),  // 敏捷性（1-10点）
        Math.round(intelligence),     // 知力（1-10点）
        Math.round(experience),       // 戦闘経験（年）
        Math.round(socialClass)       // 社会階級（1-5段階）
      ],
      label: roles[role], // 文字列で保存
    });

      data.push({
      features: [
        age / 50,              // 年齢（正規化）
        adjustedStrength / 10, // 筋力（正規化）
        adjustedAgility / 10,  // 敏捷性（正規化）
        intelligence / 10,     // 知力（正規化）
        experience / 20,       // 戦闘経験（正規化）
        socialClass / 5        // 社会階級（正規化）
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
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['年齢', '筋力', '敏捷性', '知力', '戦闘経験', '社会階級'],
      featureUnits: ['歳', '点', '点', '点', '年', '段階']
    }
  };
}

export function generateSatsumaDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 戦国時代の海戦の特徴量
    const windSpeed = Math.max(0, Math.min(20, normalRandom(8, 4))); // 風速（0-20m/s）
    const waveHeight = Math.max(0, Math.min(5, normalRandom(2, 1))); // 波高（0-5m）
    const shipCount = Math.max(5, Math.min(50, normalRandom(20, 10))); // 船数（5-50隻）
    const crewExperience = Math.max(1, Math.min(10, normalRandom(6, 2))); // 乗組員経験（1-10点）
    const weaponQuality = Math.max(1, Math.min(8, normalRandom(5, 2))); // 武器の質（1-8点、戦国時代の技術）
    const weather = Math.max(1, Math.min(5, normalRandom(3, 1))); // 天候（1-5段階：晴れ1、曇り2、雨3、嵐4、大嵐5）
    
    // 戦国時代の海戦勝敗判定（複合条件）
    const windEffect = windSpeed > 15 ? 0.7 : windSpeed < 3 ? 0.8 : 1.0; // 強風・無風は不利
    const waveEffect = waveHeight > 3 ? 0.6 : waveHeight < 1 ? 0.9 : 1.0; // 高波は不利
    const shipEffect = Math.log(shipCount) / Math.log(50); // 船数は対数効果
    const crewEffect = crewExperience / 10; // 経験値効果
    const weaponEffect = weaponQuality / 8; // 武器効果
    const weatherEffect = weather <= 2 ? 1.0 : weather === 3 ? 0.8 : weather === 4 ? 0.6 : 0.4; // 天候効果
    
    const battleScore = windEffect * waveEffect * shipEffect * crewEffect * weaponEffect * weatherEffect;
    const isVictory = battleScore > 0.5;

    // 生データ
    raw.push({
      features: [
        Math.round(windSpeed * 10) / 10,  // 風速（m/s）
        Math.round(waveHeight * 10) / 10, // 波高（m）
        Math.round(shipCount),            // 船数（隻）
        Math.round(crewExperience),       // 乗組員経験（1-10点）
        Math.round(weaponQuality),        // 武器の質（1-8点）
        Math.round(weather)               // 天候（1-5段階）
      ],
      label: isVictory ? 1 : 0,
    });

    data.push({
      features: [
        windSpeed / 20,        // 風速（正規化）
        waveHeight / 5,        // 波高（正規化）
        shipCount / 50,        // 船数（正規化）
        crewExperience / 10,   // 乗組員経験（正規化）
        weaponQuality / 8,     // 武器の質（正規化）
        weather / 5            // 天候（正規化）
      ],
      label: isVictory ? 1 : 0,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['風速', '波高', '船数', '乗組員経験', '武器の質', '天候'],
    classes: ['敗北', '勝利'],
    labelName: '戦果',
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['風速', '波高', '船数', '乗組員経験', '武器の質', '天候'],
      featureUnits: ['m/s', 'm', '隻', '点', '点', '段階']
    }
  };
}

export function generateHizenDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

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

    // 生データ（温度は摂氏、他は0-1を見やすく）
    const grades = ['下級', '中級', '上級'];
    raw.push({
      features: [
        Math.round(clayQuality * 10) / 10,
        Math.round(glazeQuality * 10) / 10,
        Math.round(firingTemp),
        Math.round(potterSkill * 10) / 10,
        Math.round(decoration * 10) / 10,
        Math.round(thickness * 10) / 10
      ],
      label: grades[grade], // 文字列で保存
    });

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
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['粘土の品質', '釉薬の品質', '焼成温度', '陶工の技能', '装飾の美しさ', '厚さの均一性'],
      featureUnits: ['', '', '℃', '', '', '']
    }
  };
}

export function generateSagamiDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

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

    // 生データ（単位付き）
    const levels = ['低い', '中程度', '高い'];
    raw.push({
      features: [
        Math.round(population),
        Math.round(commerce * 10) / 10,
        Math.round(agriculture * 10) / 10,
        Math.round(governance * 10) / 10,
        Math.round(stability * 10) / 10,
        Math.round(location * 10) / 10
      ],
      label: levels[level], // 文字列で保存
    });

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
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['人口', '商業の発達度', '農業の発達度', '統治の質', '政治安定性', '立地の良さ'],
      featureUnits: ['人', '', '', '', '', '']
    }
  };
}

export function generateDewaDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

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

    // 生データ（単位付き）
    raw.push({
      features: [
        Math.round(distance),
        Math.round(elevation),
        Math.round(weather * 10) / 10,
        Math.round(roadQuality * 10) / 10,
        Math.round(cargoValue * 10) / 10,
        Math.round(season * 100) / 100
      ],
      label: Math.round(efficiency * 1000) / 1000,
    });

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
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['距離', '標高', '天候の良さ', '道路の質', '荷物の価値', '季節'],
      featureUnits: ['km', 'm', '', '', '', '']
    }
  };
}

export function generateMoriokaDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 現実的な馬の繁殖の特徴量
    const bloodline = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 血統スコア
    const age = Math.max(3, Math.min(15, normalRandom(8, 3))); // 年齢
    const health = Math.min(1, Math.max(0, normalRandom(0.7, 0.15))); // 健康状態
    const environment = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 飼育環境
    const season = Math.random(); // 季節（0-1の範囲）
    const breedingCount = Math.max(0, Math.min(5, normalRandom(2, 1))); // 交配回数
    
    // 現実的な繁殖成功率計算
    const bloodlineEffect = Math.pow(bloodline, 1.2); // 血統の非線形効果
    const ageEffect = Math.exp(-Math.pow(age - 8, 2) / 20); // 年齢の最適化効果
    const healthEffect = health;
    const environmentEffect = Math.pow(environment, 0.8); // 環境の非線形効果
    const seasonEffect = 1 - Math.abs(season - 0.5) * 0.4; // 季節効果（春・秋が最適）
    const breedingEffect = Math.exp(-breedingCount / 3); // 交配回数の疲労効果
    
    const successRate = bloodlineEffect * ageEffect * healthEffect * environmentEffect * seasonEffect * breedingEffect * (0.7 + Math.random() * 0.6);

    // 生データ（単位付き）
    raw.push({
      features: [
        Math.round(bloodline * 10) / 10,
        Math.round(age),
        Math.round(health * 10) / 10,
        Math.round(environment * 10) / 10,
        Math.round(season * 100) / 100,
        Math.round(breedingCount)
      ],
      label: Math.round(successRate * 1000) / 1000,
    });

    data.push({
      features: [
        bloodline,             // 血統スコア
        age / 15,              // 年齢（正規化）
        health,                // 健康状態
        environment,           // 飼育環境
        season,                // 季節
        breedingCount / 5      // 交配回数（正規化）
      ],
      label: successRate,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['血統スコア', '年齢', '健康状態', '飼育環境', '季節', '交配回数'],
    classes: [],
    labelName: '繁殖成功率',
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['血統スコア', '年齢', '健康状態', '飼育環境', '季節', '交配回数'],
      featureUnits: ['', '年', '', '', '', '回']
    }
  };
}

export function generateSendaiDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 現実的な米作りの特徴量
    const temperature = Math.max(5, Math.min(35, normalRandom(20, 8))); // 気温
    const rainfall = Math.max(0, Math.min(400, normalRandom(150, 50))); // 降水量
    const sunshine = Math.max(50, Math.min(300, normalRandom(200, 40))); // 日照時間
    const soilMoisture = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 土壌水分
    const fertilizer = Math.min(1, Math.max(0, normalRandom(0.5, 0.25))); // 肥料量
    const plantingTime = Math.random(); // 植え付け時期（0-1の範囲）
    
    // 現実的な収穫量計算
    const tempEffect = Math.exp(-Math.pow(temperature - 22, 2) / 100); // 気温の最適化効果
    const rainEffect = Math.exp(-Math.pow(rainfall - 150, 2) / 5000); // 降水量の最適化効果
    const sunEffect = Math.min(1, sunshine / 200); // 日照時間の効果
    const soilEffect = Math.pow(soilMoisture * fertilizer, 0.7); // 土壌と肥料の相互作用
    const timeEffect = 1 - Math.abs(plantingTime - 0.3) * 0.5; // 植え付け時期の効果
    
    const harvestYield = tempEffect * rainEffect * sunEffect * soilEffect * timeEffect * (0.6 + Math.random() * 0.8);

    // 生データ（単位付き）
    raw.push({
      features: [
        Math.round(temperature),
        Math.round(rainfall),
        Math.round(sunshine),
        Math.round(soilMoisture * 10) / 10,
        Math.round(fertilizer * 10) / 10,
        Math.round(plantingTime * 100) / 100
      ],
      label: Math.round(harvestYield * 1000) / 1000,
    });

    data.push({
      features: [
        temperature / 35,      // 気温（正規化）
        rainfall / 400,        // 降水量（正規化）
        sunshine / 300,        // 日照時間（正規化）
        soilMoisture,          // 土壌水分
        fertilizer,            // 肥料量
        plantingTime           // 植え付け時期
      ],
      label: harvestYield,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['気温', '降水量', '日照時間', '土壌水分', '肥料量', '植え付け時期'],
    classes: [],
    labelName: '収穫量',
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['気温', '降水量', '日照時間', '土壌水分', '肥料量', '植え付け時期'],
      featureUnits: ['℃', 'mm', '時間', '', '', '']
    }
  };
}

export function generateKanazawaDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 現実的な金箔製造の特徴量
    const purity = Math.min(1, Math.max(0.8, normalRandom(0.95, 0.05))); // 金の純度
    const temperature = Math.max(800, Math.min(1200, normalRandom(1000, 100))); // 温度
    const humidity = Math.min(1, Math.max(0, normalRandom(0.4, 0.2))); // 湿度
    const rollingCount = Math.max(50, Math.min(200, normalRandom(120, 30))); // 圧延回数
    const craftsmanExp = Math.min(1, Math.max(0, normalRandom(0.7, 0.2))); // 職人経験
    const workTime = Math.max(2, Math.min(12, normalRandom(6, 2))); // 作業時間
    
    // 現実的な品質等級判定
    const purityEffect = Math.pow(purity, 2); // 純度の非線形効果
    const tempEffect = Math.exp(-Math.pow(temperature - 1000, 2) / 20000); // 温度の最適化効果
    const humidityEffect = Math.exp(-Math.pow(humidity - 0.4, 2) / 0.2); // 湿度の最適化効果
    const rollingEffect = Math.exp(-Math.pow(rollingCount - 120, 2) / 2000); // 圧延回数の最適化効果
    const craftsmanEffect = Math.pow(craftsmanExp, 1.5); // 職人経験の非線形効果
    const timeEffect = Math.exp(-Math.pow(workTime - 6, 2) / 8); // 作業時間の最適化効果
    
    const qualityScore = purityEffect * tempEffect * humidityEffect * rollingEffect * craftsmanEffect * timeEffect;
    
    let grade = 0; // 下級
    if (qualityScore > 0.8) grade = 3; // 最高級
    else if (qualityScore > 0.6) grade = 2; // 上級
    else if (qualityScore > 0.4) grade = 1; // 中級

    // 生データ（単位付き）
    const grades = ['下級', '中級', '上級', '最高級'];
    raw.push({
      features: [
        Math.round(purity * 1000) / 1000,
        Math.round(temperature),
        Math.round(humidity * 10) / 10,
        Math.round(rollingCount),
        Math.round(craftsmanExp * 10) / 10,
        Math.round(workTime)
      ],
      label: grades[grade], // 文字列で保存
    });

    data.push({
      features: [
        purity,                // 金の純度
        temperature / 1200,    // 温度（正規化）
        humidity,              // 湿度
        rollingCount / 200,    // 圧延回数（正規化）
        craftsmanExp,          // 職人経験
        workTime / 12          // 作業時間（正規化）
      ],
      label: grade,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['金の純度', '温度', '湿度', '圧延回数', '職人経験', '作業時間'],
    classes: ['下級', '中級', '上級', '最高級'],
    labelName: '品質等級',
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['金の純度', '温度', '湿度', '圧延回数', '職人経験', '作業時間'],
      featureUnits: ['', '℃', '', '回', '', '時間']
    }
  };
}

export function generateTakamatsuDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 現実的な海運の特徴量
    const windSpeed = Math.max(0, Math.min(30, normalRandom(10, 5))); // 風速
    const waveHeight = Math.max(0, Math.min(5, normalRandom(1.5, 0.8))); // 波高
    const currentSpeed = Math.max(0, Math.min(5, normalRandom(2, 1))); // 海流速度
    const cloudCover = Math.min(1, Math.max(0, normalRandom(0.5, 0.3))); // 雲量
    const pressure = Math.max(980, Math.min(1030, normalRandom(1013, 15))); // 気圧
    const tide = Math.random(); // 潮汐（0-1の範囲）
    
    // 現実的な安全性判定
    const windEffect = Math.exp(-windSpeed / 15); // 風速の危険度効果
    const waveEffect = Math.exp(-waveHeight / 2); // 波高の危険度効果
    const currentEffect = Math.exp(-currentSpeed / 3); // 海流の危険度効果
    const cloudEffect = 1 - cloudCover * 0.3; // 雲量の視界効果
    const pressureEffect = Math.exp(-Math.pow(pressure - 1013, 2) / 200); // 気圧の安定性効果
    const tideEffect = 1 - Math.abs(tide - 0.5) * 0.4; // 潮汐の安定性効果
    
    const safetyScore = windEffect * waveEffect * currentEffect * cloudEffect * pressureEffect * tideEffect;
    
    let safety = 0; // 危険
    if (safetyScore > 0.7) safety = 2; // 安全
    else if (safetyScore > 0.4) safety = 1; // 注意

    // 生データ（単位付き）
    const safetyLevels = ['危険', '注意', '安全'];
    raw.push({
      features: [
        Math.round(windSpeed),
        Math.round(waveHeight * 10) / 10,
        Math.round(currentSpeed * 10) / 10,
        Math.round(cloudCover * 10) / 10,
        Math.round(pressure),
        Math.round(tide * 100) / 100
      ],
      label: safetyLevels[safety], // 文字列で保存
    });

    data.push({
      features: [
        windSpeed / 30,        // 風速（正規化）
        waveHeight / 5,        // 波高（正規化）
        currentSpeed / 5,      // 海流速度（正規化）
        cloudCover,            // 雲量
        pressure / 1030,       // 気圧（正規化）
        tide                   // 潮汐
      ],
      label: safety,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['風速', '波高', '海流速度', '雲量', '気圧', '潮汐'],
    classes: ['危険', '注意', '安全'],
    labelName: '安全性',
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['風速', '波高', '海流速度', '雲量', '気圧', '潮汐'],
      featureUnits: ['m/s', 'm', 'm/s', '', 'hPa', '']
    }
  };
}

export function generateKumamotoDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 現実的な石垣の特徴量
    const hardness = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 石の硬さ
    const size = Math.max(0.1, Math.min(2, normalRandom(0.8, 0.3))); // 石の大きさ
    const stacking = Math.min(1, Math.max(0, normalRandom(0.7, 0.15))); // 積み方の技術
    const mortar = Math.min(1, Math.max(0, normalRandom(0.4, 0.2))); // モルタル量
    const angle = Math.max(60, Math.min(90, normalRandom(75, 8))); // 角度
    const foundation = Math.max(0.5, Math.min(3, normalRandom(1.5, 0.5))); // 基礎の深さ
    
    // 現実的な強度計算
    const hardnessEffect = Math.pow(hardness, 1.5); // 硬さの非線形効果
    const sizeEffect = Math.exp(-Math.pow(size - 0.8, 2) / 0.2); // 大きさの最適化効果
    const stackingEffect = Math.pow(stacking, 1.2); // 積み方の非線形効果
    const mortarEffect = Math.exp(-Math.pow(mortar - 0.4, 2) / 0.1); // モルタル量の最適化効果
    const angleEffect = Math.exp(-Math.pow(angle - 75, 2) / 50); // 角度の最適化効果
    const foundationEffect = Math.pow(foundation, 0.8); // 基礎の深さの非線形効果
    
    const strength = hardnessEffect * sizeEffect * stackingEffect * mortarEffect * angleEffect * foundationEffect * (0.6 + Math.random() * 0.8);

    // 生データ（単位付き）
    raw.push({
      features: [
        Math.round(hardness * 10) / 10,
        Math.round(size * 10) / 10,
        Math.round(stacking * 10) / 10,
        Math.round(mortar * 10) / 10,
        Math.round(angle),
        Math.round(foundation * 10) / 10
      ],
      label: Math.round(strength * 1000) / 1000,
    });

    data.push({
      features: [
        hardness,              // 石の硬さ
        size / 2,              // 石の大きさ（正規化）
        stacking,              // 積み方
        mortar,                // モルタル量
        angle / 90,            // 角度（正規化）
        foundation / 3         // 基礎の深さ（正規化）
      ],
      label: strength,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['石の硬さ', '石の大きさ', '積み方', 'モルタル量', '角度', '基礎の深さ'],
    classes: [],
    labelName: '強度',
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['石の硬さ', '石の大きさ', '積み方', 'モルタル量', '角度', '基礎の深さ'],
      featureUnits: ['', 'm', '', '', '度', 'm']
    }
  };
}

export function generateYamaguchiDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 現実的な海戦の特徴量
    const windSpeed = Math.max(0, Math.min(30, normalRandom(10, 5))); // 風速
    const waveHeight = Math.max(0, Math.min(5, normalRandom(1.5, 0.8))); // 波高
    const shipCount = Math.max(5, Math.min(50, normalRandom(20, 10))); // 船数
    const soldierCount = Math.max(50, Math.min(500, normalRandom(200, 100))); // 兵数
    const distance = Math.max(1, Math.min(20, normalRandom(8, 4))); // 距離
    const timeOfDay = Math.random(); // 時間（0-1の範囲）
    
    // 現実的な勝利確率計算
    const windEffect = Math.exp(-windSpeed / 15); // 風速の危険度効果
    const waveEffect = Math.exp(-waveHeight / 2); // 波高の危険度効果
    const shipEffect = Math.log(shipCount) / 10; // 船数の対数効果
    const soldierEffect = Math.log(soldierCount) / 20; // 兵数の対数効果
    const distanceEffect = Math.exp(-distance / 10); // 距離の効果
    const timeEffect = 1 - Math.abs(timeOfDay - 0.5) * 0.3; // 時間効果（昼が最適）
    
    const victoryScore = windEffect * waveEffect * shipEffect * soldierEffect * distanceEffect * timeEffect * (0.5 + Math.random() * 0.5);
    
    let result = 0; // 敗北
    if (victoryScore > 0.7) result = 2; // 勝利
    else if (victoryScore > 0.4) result = 1; // 引き分け

    // 生データ（単位付き）
    const results = ['敗北', '引き分け', '勝利'];
    raw.push({
      features: [
        Math.round(windSpeed),
        Math.round(waveHeight * 10) / 10,
        Math.round(shipCount),
        Math.round(soldierCount),
        Math.round(distance),
        Math.round(timeOfDay * 24)
      ],
      label: results[result], // 文字列で保存
    });

    data.push({
      features: [
        windSpeed / 30,        // 風速（正規化）
        waveHeight / 5,        // 波高（正規化）
        shipCount / 50,        // 船数（正規化）
        soldierCount / 500,    // 兵数（正規化）
        distance / 20,         // 距離（正規化）
        timeOfDay              // 時間
      ],
      label: result,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['風速', '波高', '船数', '兵数', '距離', '時間'],
    classes: ['敗北', '引き分け', '勝利'],
    labelName: '戦果',
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['風速', '波高', '船数', '兵数', '距離', '時間'],
      featureUnits: ['m/s', 'm', '隻', '人', 'km', '時']
    }
  };
}

export function generateKagaDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 現実的な布教の特徴量
    const populationDensity = Math.max(10, Math.min(200, normalRandom(80, 30))); // 人口密度
    const economicStatus = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 経済状況
    const educationLevel = Math.min(1, Math.max(0, normalRandom(0.4, 0.25))); // 教育レベル
    const existingReligion = Math.min(1, Math.max(0, normalRandom(0.3, 0.2))); // 既存宗教の影響
    const transportation = Math.min(1, Math.max(0, normalRandom(0.5, 0.25))); // 交通便
    const season = Math.random(); // 季節（0-1の範囲）
    
    // 現実的な信者獲得数計算
    const populationEffect = Math.log(populationDensity) / 10; // 人口密度の対数効果
    const economicEffect = Math.pow(economicStatus, 0.8); // 経済状況の非線形効果
    const educationEffect = Math.exp(-educationLevel / 2); // 教育レベルの効果（低い方が布教しやすい）
    const religionEffect = Math.exp(-existingReligion / 3); // 既存宗教の競合効果
    const transportEffect = Math.pow(transportation, 1.2); // 交通便の非線形効果
    const seasonEffect = 1 - Math.abs(season - 0.5) * 0.4; // 季節効果（春・秋が最適）
    
    const conversionRate = populationEffect * economicEffect * educationEffect * religionEffect * transportEffect * seasonEffect * (0.3 + Math.random() * 0.7);
    const newBelievers = Math.max(0, Math.round(conversionRate * 100));

    // 生データ（単位付き）
    raw.push({
      features: [
        Math.round(populationDensity),
        Math.round(economicStatus * 10) / 10,
        Math.round(educationLevel * 10) / 10,
        Math.round(existingReligion * 10) / 10,
        Math.round(transportation * 10) / 10,
        Math.round(season * 100) / 100
      ],
      label: newBelievers,
    });

    data.push({
      features: [
        populationDensity / 200, // 人口密度（正規化）
        economicStatus,          // 経済状況
        educationLevel,          // 教育レベル
        existingReligion,        // 既存宗教
        transportation,          // 交通便
        season                   // 季節
      ],
      label: conversionRate,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['人口密度', '経済状況', '教育レベル', '既存宗教', '交通便', '季節'],
    classes: [],
    labelName: '信者獲得数',
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['人口密度', '経済状況', '教育レベル', '既存宗教', '交通便', '季節'],
      featureUnits: ['人/km²', '', '', '', '', '']
    }
  };
}

export function generateTosaDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 現実的な戦略の特徴量
    const troopCount = Math.max(100, Math.min(2000, normalRandom(800, 300))); // 兵力
    const equipment = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 装備の質
    const terrain = Math.min(1, Math.max(0, normalRandom(0.5, 0.25))); // 地形の有利さ
    const weather = Math.min(1, Math.max(0, normalRandom(0.6, 0.2))); // 天候の良さ
    const enemyTroops = Math.max(50, Math.min(1500, normalRandom(600, 250))); // 敵兵力
    const supply = Math.min(1, Math.max(0, normalRandom(0.7, 0.15))); // 補給の充実度
    
    // 現実的な成功確率計算
    const troopEffect = Math.log(troopCount) / 15; // 兵力の対数効果
    const equipmentEffect = Math.pow(equipment, 1.3); // 装備の非線形効果
    const terrainEffect = Math.pow(terrain, 0.9); // 地形の非線形効果
    const weatherEffect = weather; // 天候の効果
    const enemyEffect = Math.exp(-enemyTroops / 1000); // 敵兵力の効果
    const supplyEffect = Math.pow(supply, 1.1); // 補給の非線形効果
    
    const successScore = troopEffect * equipmentEffect * terrainEffect * weatherEffect * enemyEffect * supplyEffect * (0.4 + Math.random() * 0.6);
    
    let result = 0; // 失敗
    if (successScore > 0.8) result = 2; // 完全成功
    else if (successScore > 0.5) result = 1; // 部分成功

    // 生データ（単位付き）
    const results = ['失敗', '部分成功', '完全成功'];
    raw.push({
      features: [
        Math.round(troopCount),
        Math.round(equipment * 10) / 10,
        Math.round(terrain * 10) / 10,
        Math.round(weather * 10) / 10,
        Math.round(enemyTroops),
        Math.round(supply * 10) / 10
      ],
      label: results[result], // 文字列で保存
    });

    data.push({
      features: [
        troopCount / 2000,     // 兵力（正規化）
        equipment,             // 装備
        terrain,               // 地形
        weather,               // 天候
        enemyTroops / 1500,    // 敵兵力（正規化）
        supply                 // 補給
      ],
      label: result,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['兵力', '装備', '地形', '天候', '敵兵力', '補給'],
    classes: ['失敗', '部分成功', '完全成功'],
    labelName: '戦略結果',
    raw: {
      train: raw.slice(0, Math.floor(raw.length * 0.7)),
      test: raw.slice(Math.floor(raw.length * 0.7)),
      featureNames: ['兵力', '装備', '地形', '天候', '敵兵力', '補給'],
      featureUnits: ['人', '', '', '', '人', '']
    }
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
    case 'morioka':
      return generateMoriokaDataset();
    case 'sendai':
      return generateSendaiDataset();
    case 'kanazawa':
      return generateKanazawaDataset();
    case 'takamatsu':
      return generateTakamatsuDataset();
    case 'kumamoto':
      return generateKumamotoDataset();
    case 'yamaguchi':
      return generateYamaguchiDataset();
    case 'kaga':
      return generateKagaDataset();
    case 'tosa':
      return generateTosaDataset();
    default:
      return generateKyotoDataset();
  }
}