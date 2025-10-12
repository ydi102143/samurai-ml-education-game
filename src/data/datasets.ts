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

  for (let i = 0; i < 200; i++) {
    const isReal = i < 100;

    const colorHue = isReal ? 30 + Math.random() * 20 : 10 + Math.random() * 40;
    const texture = isReal ? 0.7 + Math.random() * 0.3 : 0.3 + Math.random() * 0.5;
    const shape = isReal ? 0.8 + Math.random() * 0.2 : 0.4 + Math.random() * 0.4;
    const weight = isReal ? 0.7 + Math.random() * 0.3 : 0.3 + Math.random() * 0.6;

    data.push({
      features: [colorHue, texture, shape, weight],
      label: isReal ? 1 : 0,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['色合い', '質感', '形状', '重さ'],
    labelName: '真贋',
    classes: ['贋作', '本物'],
  };
}

export function generateSakaiDataset(): Dataset {
  const data = [];
  const origins = ['中国', '南蛮', '朝鮮', '日本'];

  for (let originIdx = 0; originIdx < 4; originIdx++) {
    for (let i = 0; i < 75; i++) {
      const material = originIdx * 0.25 + Math.random() * 0.2;
      const decoration = originIdx * 0.25 + Math.random() * 0.2;
      const weight = originIdx * 0.25 + Math.random() * 0.2;
      const size = originIdx * 0.25 + Math.random() * 0.2;

      data.push({
        features: [material, decoration, weight, size],
        label: originIdx,
      });
    }
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['素材', '装飾様式', '重量', '寸法'],
    labelName: '産地',
    classes: origins,
  };
}

export function generateKaiDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 250; i++) {
    const workers = 50 + Math.random() * 100;
    const temp = 10 + Math.random() * 20;
    const rainfall = Math.random() * 200;
    const workDays = 20 + Math.random() * 10;

    const output = workers * 0.8 + temp * 2 - rainfall * 0.1 + workDays * 3 + (Math.random() - 0.5) * 50;

    data.push({
      features: [workers, temp, rainfall, workDays],
      label: Math.max(0, output),
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['労働者数', '気温', '降水量', '採掘日数'],
    labelName: '産出量(kg)',
  };
}

export function generateEchigoDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 300; i++) {
    const springTemp = 10 + Math.random() * 10;
    const summerRain = 200 + Math.random() * 200;
    const sunshine = 1500 + Math.random() * 500;
    const typhoons = Math.floor(Math.random() * 5);

    const harvest = springTemp * 50 + summerRain * 0.3 + sunshine * 0.05 - typhoons * 100 + (Math.random() - 0.5) * 500;

    data.push({
      features: [springTemp, summerRain, sunshine, typhoons],
      label: Math.max(0, harvest),
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['春の気温', '夏の降水量', '日照時間', '台風回数'],
    labelName: '収穫量(石)',
  };
}

export function generateOwariDataset(): Dataset {
  const data = [];
  const roles = ['槍兵', '弓兵', '鉄砲隊', '騎馬隊'];

  for (let roleIdx = 0; roleIdx < 4; roleIdx++) {
    for (let i = 0; i < 100; i++) {
      let strength, dexterity, intelligence, accuracy;

      switch (roleIdx) {
        case 0:
          strength = 0.7 + Math.random() * 0.3;
          dexterity = 0.3 + Math.random() * 0.4;
          intelligence = 0.2 + Math.random() * 0.3;
          accuracy = 0.2 + Math.random() * 0.3;
          break;
        case 1:
          strength = 0.4 + Math.random() * 0.3;
          dexterity = 0.7 + Math.random() * 0.3;
          intelligence = 0.3 + Math.random() * 0.3;
          accuracy = 0.7 + Math.random() * 0.3;
          break;
        case 2:
          strength = 0.3 + Math.random() * 0.3;
          dexterity = 0.8 + Math.random() * 0.2;
          intelligence = 0.6 + Math.random() * 0.4;
          accuracy = 0.8 + Math.random() * 0.2;
          break;
        case 3:
        default:
          strength = 0.8 + Math.random() * 0.2;
          dexterity = 0.6 + Math.random() * 0.3;
          intelligence = 0.4 + Math.random() * 0.3;
          accuracy = 0.5 + Math.random() * 0.3;
          break;
      }

      data.push({
        features: [strength, dexterity, intelligence, accuracy],
        label: roleIdx,
      });
    }
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['体力', '器用さ', '知力', '射撃精度'],
    labelName: '適性',
    classes: roles,
  };
}

export function generateSatsumaDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 350; i++) {
    const isGood = i < 175;

    const straightness = isGood ? 0.8 + Math.random() * 0.2 : 0.3 + Math.random() * 0.5;
    const sealing = isGood ? 0.7 + Math.random() * 0.3 : 0.2 + Math.random() * 0.5;
    const triggerSpeed = isGood ? 0.75 + Math.random() * 0.25 : 0.3 + Math.random() * 0.5;
    const balance = isGood ? 0.8 + Math.random() * 0.2 : 0.3 + Math.random() * 0.6;

    data.push({
      features: [straightness, sealing, triggerSpeed, balance],
      label: isGood ? 1 : 0,
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['銃身の直線性', '火薬室の密閉度', '引き金の反応速度', '重量バランス'],
    labelName: '品質',
    classes: ['不良品', '良品'],
  };
}

export function generateHizenDataset(): Dataset {
  const data = [];
  const grades = ['下級品', '中級品', '上級品'];

  for (let gradeIdx = 0; gradeIdx < 3; gradeIdx++) {
    for (let i = 0; i < 100; i++) {
      const uniformity = gradeIdx * 0.3 + 0.3 + Math.random() * 0.25;
      const temperature = 1000 + gradeIdx * 200 + Math.random() * 100;
      const decoration = gradeIdx * 0.3 + 0.2 + Math.random() * 0.3;
      const thickness = 2 + gradeIdx * 1 + Math.random() * 0.5;

      data.push({
        features: [uniformity, temperature / 1500, decoration, thickness / 5],
        label: gradeIdx,
      });
    }
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['釉薬の均一性', '焼成温度', '装飾の精密度', '厚み'],
    labelName: '等級',
    classes: grades,
  };
}

export function generateSagamiDataset(): Dataset {
  const data = [];

  for (let i = 0; i < 200; i++) {
    const currentPop = 5000 + Math.random() * 10000;
    const commerce = Math.random();
    const security = Math.random();
    const taxRate = 0.1 + Math.random() * 0.3;

    const futurePop = currentPop * (1 + commerce * 0.5 - taxRate * 0.3 + security * 0.2) + (Math.random() - 0.5) * 2000;

    data.push({
      features: [currentPop / 15000, commerce, security, taxRate],
      label: Math.max(0, futurePop),
    });
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['現在人口', '商業発展度', '治安指数', '税率'],
    labelName: '5年後の人口',
  };
}

export function generateDewaDataset(): Dataset {
  const data = [];
  const routes = ['近距離', '中距離', '遠距離'];

  for (let routeIdx = 0; routeIdx < 3; routeIdx++) {
    for (let i = 0; i < 83; i++) {
      const distance = routeIdx * 500 + 300 + Math.random() * 400;
      const days = routeIdx * 10 + 5 + Math.random() * 8;
      const profit = (3 - routeIdx) * 0.2 + 0.2 + Math.random() * 0.3;
      const risk = routeIdx * 0.2 + 0.1 + Math.random() * 0.2;

      data.push({
        features: [distance / 1500, days / 30, profit, risk],
        label: routeIdx,
      });
    }
  }

  const shuffled = shuffle(data);
  const splitIdx = Math.floor(data.length * 0.7);

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    featureNames: ['距離', '所要日数', '利益率', 'リスク度'],
    labelName: '航路タイプ',
    classes: routes,
  };
}export function getDatasetForRegion(regionId: string): Dataset {
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


