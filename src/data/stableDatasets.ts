/**
 * 安定化されたデータセット生成関数
 * すべての問題で学習しやすい線形関係を使用
 */

export interface Dataset {
  data: { features: number[]; label: number | string }[];
  raw: { features: number[]; label: number | string }[];
}

// 正規分布の乱数生成
function normalRandom(mean: number, std: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * std + mean;
}

/**
 * 京都問題：茶器の真贋判定（二値分類）
 */
export function generateStableKyotoDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 学習しやすい線形関係でデータを生成
    const age = Math.max(1200, Math.min(1600, normalRandom(1400, 100))); // 年代（1200-1600年）
    const craftsmanship = Math.max(1, Math.min(10, normalRandom(6, 2))); // 職人技（1-10点）
    const materialQuality = Math.max(1, Math.min(10, normalRandom(6, 2))); // 材質（1-10点）
    const patina = Math.max(1, Math.min(10, normalRandom(6, 2))); // 古色（1-10点）
    
    // シンプルな線形関係で真贋を判定
    const authenticityScore = 
      (craftsmanship / 10) * 0.4 +
      (materialQuality / 10) * 0.3 +
      (patina / 10) * 0.2 +
      ((1600 - age) / 400) * 0.1 + // 古いほど本物
      normalRandom(0, 0.1); // ノイズ

    const isAuthentic = authenticityScore > 0.5;

    // 生データ（前処理前）を保持
    raw.push({
      features: [
        Math.round(age),              // 年代（年）
        Math.round(craftsmanship),    // 職人技（1-10点）
        Math.round(materialQuality),  // 材質（1-10点）
        Math.round(patina)            // 古色（1-10点）
      ],
      label: isAuthentic ? '本物' : '贋作',
    });

    // 正規化されたデータ（学習用）
    data.push({
      features: [
        (age - 1200) / 400,           // 年代（正規化 0-1）
        (craftsmanship - 1) / 9,      // 職人技（正規化 0-1）
        (materialQuality - 1) / 9,    // 材質（正規化 0-1）
        (patina - 1) / 9              // 古色（正規化 0-1）
      ],
      label: isAuthentic ? 1 : 0,     // 二値分類（1: 本物, 0: 贋作）
    });
  }

  return { data, raw };
}

/**
 * 堺問題：貿易記録の真贋判定（二値分類）
 */
export function generateStableSakaiDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 学習しやすい線形関係でデータを生成
    const tradeVolume = Math.max(50, Math.min(800, normalRandom(400, 150))); // 貿易量（50-800石）
    const merchantReputation = Math.max(1, Math.min(10, normalRandom(6, 2))); // 商人の評判（1-10点）
    const portAccess = Math.max(1, Math.min(10, normalRandom(6, 2))); // 港のアクセス（1-10点）
    const politicalStability = Math.max(1, Math.min(10, normalRandom(6, 2))); // 政治の安定（1-10点）
    
    // シンプルな線形関係で真贋を判定
    const authenticityScore = 
      (tradeVolume / 800) * 0.3 +
      (merchantReputation / 10) * 0.3 +
      (portAccess / 10) * 0.2 +
      (politicalStability / 10) * 0.2 +
      normalRandom(0, 0.1); // ノイズ

    const isAuthentic = authenticityScore > 0.5;

    // 生データ（前処理前）を保持
    raw.push({
      features: [
        Math.round(tradeVolume),       // 貿易量（石）
        Math.round(merchantReputation), // 商人の評判（1-10点）
        Math.round(portAccess),        // 港のアクセス（1-10点）
        Math.round(politicalStability) // 政治の安定（1-10点）
      ],
      label: isAuthentic ? '本物' : '贋作',
    });

    // 正規化されたデータ（学習用）
    data.push({
      features: [
        (tradeVolume - 50) / 750,      // 貿易量（正規化 0-1）
        (merchantReputation - 1) / 9,  // 商人の評判（正規化 0-1）
        (portAccess - 1) / 9,          // 港のアクセス（正規化 0-1）
        (politicalStability - 1) / 9   // 政治の安定（正規化 0-1）
      ],
      label: isAuthentic ? 1 : 0,      // 二値分類（1: 本物, 0: 贋作）
    });
  }

  return { data, raw };
}

/**
 * 甲斐問題：軍事情報の真贋判定（二値分類）
 */
export function generateStableKaiDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 学習しやすい線形関係でデータを生成
    const terrainAdvantage = Math.max(1, Math.min(10, normalRandom(6, 2))); // 地形優位性（1-10点）
    const troopMorale = Math.max(1, Math.min(10, normalRandom(6, 2))); // 兵士の士気（1-10点）
    const supplyLine = Math.max(1, Math.min(10, normalRandom(6, 2))); // 補給線（1-10点）
    const weatherCondition = Math.max(1, Math.min(10, normalRandom(6, 2))); // 天候（1-10点）
    
    // シンプルな線形関係で真贋を判定
    const authenticityScore = 
      (terrainAdvantage / 10) * 0.3 +
      (troopMorale / 10) * 0.3 +
      (supplyLine / 10) * 0.2 +
      (weatherCondition / 10) * 0.2 +
      normalRandom(0, 0.1); // ノイズ

    const isAuthentic = authenticityScore > 0.5;

    // 生データ（前処理前）を保持
    raw.push({
      features: [
        Math.round(terrainAdvantage),  // 地形優位性（1-10点）
        Math.round(troopMorale),       // 兵士の士気（1-10点）
        Math.round(supplyLine),        // 補給線（1-10点）
        Math.round(weatherCondition)   // 天候（1-10点）
      ],
      label: isAuthentic ? '本物' : '贋作',
    });

    // 正規化されたデータ（学習用）
    data.push({
      features: [
        (terrainAdvantage - 1) / 9,    // 地形優位性（正規化 0-1）
        (troopMorale - 1) / 9,         // 兵士の士気（正規化 0-1）
        (supplyLine - 1) / 9,          // 補給線（正規化 0-1）
        (weatherCondition - 1) / 9     // 天候（正規化 0-1）
      ],
      label: isAuthentic ? 1 : 0,      // 二値分類（1: 本物, 0: 贋作）
    });
  }

  return { data, raw };
}

/**
 * 上杉謙信問題：農業収穫量予測（回帰）
 */
export function generateStableEchigoDataset(): Dataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 300; i++) {
    // 戦国時代の農業の特徴量（学習しやすい範囲）
    const temperature = Math.max(10, Math.min(30, normalRandom(20, 5))); // 気温（10〜30℃）
    const rainfall = Math.max(50, Math.min(300, normalRandom(150, 50))); // 降水量（50-300mm）
    const sunshine = Math.max(100, Math.min(300, normalRandom(200, 50))); // 日照時間（100-300時間）
    const soilQuality = Math.max(1, Math.min(10, normalRandom(5, 2))); // 土壌の質（1-10点）
    const seedQuality = Math.max(1, Math.min(10, normalRandom(5, 2))); // 種子の質（1-10点）
    const fertilizer = Math.max(0, Math.min(50, normalRandom(25, 15))); // 肥料の量（0-50kg）
    
    // シンプルな線形関係で収穫量を計算
    const baseYield = 100; // 基本収穫量
    const tempEffect = (temperature - 10) / 20; // 気温効果（0-1）
    const rainEffect = (rainfall - 50) / 250; // 降水量効果（0-1）
    const sunEffect = (sunshine - 100) / 200; // 日照効果（0-1）
    const soilEffect = (soilQuality - 1) / 9; // 土壌効果（0-1）
    const seedEffect = (seedQuality - 1) / 9; // 種子効果（0-1）
    const fertilizerEffect = fertilizer / 50; // 肥料効果（0-1）
    
    // 線形結合で収穫量を計算（重み付き）
    const harvestYield = baseYield + 
      (tempEffect * 30) + 
      (rainEffect * 40) + 
      (sunEffect * 35) + 
      (soilEffect * 25) + 
      (seedEffect * 20) + 
      (fertilizerEffect * 15) + 
      (Math.random() - 0.5) * 20; // ノイズ

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
        (temperature - 10) / 20,  // 気温（正規化 0-1）
        (rainfall - 50) / 250,    // 降水量（正規化 0-1）
        (sunshine - 100) / 200,   // 日照時間（正規化 0-1）
        (soilQuality - 1) / 9,    // 土壌の質（正規化 0-1）
        (seedQuality - 1) / 9,    // 種子の質（正規化 0-1）
        fertilizer / 50           // 肥料の量（正規化 0-1）
      ],
      label: harvestYield / 200,  // 収穫量（正規化 0-1）
    });
  }

  return { data, raw };
}

/**
 * 安定化されたデータセット取得関数
 */
export function getStableDatasetForRegion(regionId: string): Dataset {
  switch (regionId) {
    case 'kyoto':
      return generateStableKyotoDataset();
    case 'sakai':
      return generateStableSakaiDataset();
    case 'kai':
      return generateStableKaiDataset();
    case 'echigo':
      return generateStableEchigoDataset();
    default:
      return generateStableKyotoDataset();
  }
}


