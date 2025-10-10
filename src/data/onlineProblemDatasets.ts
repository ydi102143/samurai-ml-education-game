// オンライン問題用のデータセット

export interface OnlineProblemDataset {
  id: string;
  name: string;
  description: string;
  data: { features: number[]; label: number | string }[];
  featureNames: string[];
  problemType: 'classification' | 'regression';
  targetName: string;
  classes?: string[];
}

// 住宅価格予測データセット（回帰問題）
export const housePriceDataset: OnlineProblemDataset = {
  id: 'house_price',
  name: '住宅価格予測',
  description: '住宅の特徴から価格を予測する回帰問題です。',
  data: generateHousePriceData(1000),
  featureNames: ['面積', '築年数', '部屋数', 'バスルーム数', '階数', '駐車場'],
  problemType: 'regression',
  targetName: '価格（万円）'
};

// 顧客分類データセット（分類問題）
export const customerClassificationDataset: OnlineProblemDataset = {
  id: 'customer_classification',
  name: '顧客分類',
  description: '顧客の行動データから購入意向を予測する分類問題です。',
  data: generateCustomerData(800),
  featureNames: ['年齢', '年収', '購入回数', 'サイト滞在時間', 'メール開封率', '商品閲覧数'],
  problemType: 'classification',
  targetName: '購入意向',
  classes: ['購入しない', '購入する']
};

// 売上予測データセット（回帰問題）
export const salesPredictionDataset: OnlineProblemDataset = {
  id: 'sales_prediction',
  name: '売上予測',
  description: '店舗の特徴から月間売上を予測する回帰問題です。',
  data: generateSalesData(600),
  featureNames: ['立地スコア', '店舗面積', '従業員数', '営業時間', '競合店数', '人口密度'],
  problemType: 'regression',
  targetName: '月間売上（万円）'
};

// データ生成関数
function generateHousePriceData(count: number): { features: number[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    const area = Math.random() * 200 + 50; // 50-250平米
    const age = Math.random() * 30; // 0-30年
    const rooms = Math.floor(Math.random() * 5) + 2; // 2-6部屋
    const bathrooms = Math.floor(Math.random() * 3) + 1; // 1-3バスルーム
    const floors = Math.floor(Math.random() * 4) + 1; // 1-4階
    const parking = Math.random() > 0.3 ? 1 : 0; // 駐車場有無
    
    // 価格計算（簡易的な式）
    let price = area * 50 - age * 2 + rooms * 100 + bathrooms * 50 + floors * 20 + parking * 200;
    price = Math.max(price, 1000); // 最低価格
    price = Math.round(price);
    
    data.push({
      features: [area, age, rooms, bathrooms, floors, parking],
      label: price
    });
  }
  return data;
}

function generateCustomerData(count: number): { features: number[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    const age = Math.random() * 50 + 20; // 20-70歳
    const income = Math.random() * 1000 + 300; // 300-1300万円
    const purchaseCount = Math.floor(Math.random() * 20); // 0-19回
    const siteTime = Math.random() * 120 + 10; // 10-130分
    const emailOpenRate = Math.random(); // 0-1
    const productViews = Math.floor(Math.random() * 100); // 0-99回
    
    // 購入意向の計算（簡易的な式）
    const purchaseScore = (income / 1000) * 0.3 + (purchaseCount / 20) * 0.3 + 
                         (siteTime / 120) * 0.2 + emailOpenRate * 0.1 + (productViews / 100) * 0.1;
    const willPurchase = purchaseScore > 0.5 ? 1 : 0;
    
    data.push({
      features: [age, income, purchaseCount, siteTime, emailOpenRate, productViews],
      label: willPurchase
    });
  }
  return data;
}

function generateSalesData(count: number): { features: number[]; label: number }[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    const locationScore = Math.random() * 10; // 0-10
    const area = Math.random() * 200 + 50; // 50-250平米
    const employees = Math.floor(Math.random() * 20) + 5; // 5-24人
    const hours = Math.random() * 8 + 8; // 8-16時間
    const competitors = Math.floor(Math.random() * 10); // 0-9店
    const populationDensity = Math.random() * 5000 + 1000; // 1000-6000人/km²
    
    // 売上計算（簡易的な式）
    let sales = locationScore * 50 + area * 2 + employees * 10 + hours * 5 - competitors * 20 + populationDensity * 0.01;
    sales = Math.max(sales, 100); // 最低売上
    sales = Math.round(sales);
    
    data.push({
      features: [locationScore, area, employees, hours, competitors, populationDensity],
      label: sales
    });
  }
  return data;
}

// 全データセットのリスト
export const onlineProblemDatasets: OnlineProblemDataset[] = [
  housePriceDataset,
  customerClassificationDataset,
  salesPredictionDataset
];

// データセットをIDで取得する関数
export function getOnlineProblemDataset(id: string): OnlineProblemDataset | null {
  return onlineProblemDatasets.find(dataset => dataset.id === id) || null;
}

// ランダムなデータセットを取得する関数
export function getRandomOnlineProblemDataset(): OnlineProblemDataset {
  const randomIndex = Math.floor(Math.random() * onlineProblemDatasets.length);
  return onlineProblemDatasets[randomIndex];
}

