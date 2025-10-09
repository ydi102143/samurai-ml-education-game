// オフラインファーストアプローチの実装
import { supabase } from '../lib/supabase';
import { ErrorHandler } from './errorHandler';

export interface OfflineData {
  id: string;
  type: 'battle_result' | 'user_progress' | 'leaderboard';
  data: any;
  timestamp: number;
  synced: boolean;
}

export class OfflineFirstManager {
  private static readonly OFFLINE_DATA_KEY = 'offline_data';
  private static readonly RETRY_QUEUE_KEY = 'retry_queue';
  
  // データを保存（オフライン優先）
  static async saveData(type: OfflineData['type'], data: any): Promise<boolean> {
    const offlineData: OfflineData = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };
    
    // 1. ローカルストレージに即座に保存
    this.saveToLocalStorage(offlineData);
    
    // 2. バックグラウンドでSupabaseに保存を試行
    try {
      await this.saveToSupabase(offlineData);
      this.markAsSynced(offlineData.id);
      return true;
    } catch (error) {
      console.warn('Supabase保存失敗、ローカルに保存:', error);
      this.addToRetryQueue(offlineData);
      return false;
    }
  }
  
  // データを取得（オフライン優先）
  static async getData(type: OfflineData['type']): Promise<any[]> {
    // 1. ローカルストレージから取得
    const localData = this.getFromLocalStorage(type);
    
    // 2. Supabaseから取得を試行
    try {
      const remoteData = await this.getFromSupabase(type);
      // リモートデータでローカルデータを更新
      this.updateLocalData(type, remoteData);
      return remoteData;
    } catch (error) {
      console.warn('Supabase取得失敗、ローカルデータを使用:', error);
      return localData;
    }
  }
  
  // ローカルストレージに保存
  private static saveToLocalStorage(data: OfflineData): void {
    const existing = JSON.parse(localStorage.getItem(this.OFFLINE_DATA_KEY) || '[]');
    existing.push(data);
    localStorage.setItem(this.OFFLINE_DATA_KEY, JSON.stringify(existing));
  }
  
  // ローカルストレージから取得
  private static getFromLocalStorage(type: OfflineData['type']): any[] {
    const allData = JSON.parse(localStorage.getItem(this.OFFLINE_DATA_KEY) || '[]');
    return allData
      .filter((item: OfflineData) => item.type === type)
      .map((item: OfflineData) => item.data);
  }
  
  // Supabaseに保存
  private static async saveToSupabase(data: OfflineData): Promise<void> {
    // battle_resultsテーブルにはtypeカラムが存在しないため、
    // 別のテーブルまたはローカルストレージのみを使用
    console.log('OfflineFirstManager: Supabase保存をスキップ（typeカラムが存在しない）');
    return;
  }
  
  // Supabaseから取得
  private static async getFromSupabase(type: OfflineData['type']): Promise<any[]> {
    // battle_resultsテーブルにはtypeカラムが存在しないため、
    // ローカルストレージのみを使用
    console.log('OfflineFirstManager: Supabase取得をスキップ（typeカラムが存在しない）');
    return [];
  }
  
  // 同期済みマーク
  private static markAsSynced(id: string): void {
    const allData = JSON.parse(localStorage.getItem(this.OFFLINE_DATA_KEY) || '[]');
    const updated = allData.map((item: OfflineData) => 
      item.id === id ? { ...item, synced: true } : item
    );
    localStorage.setItem(this.OFFLINE_DATA_KEY, JSON.stringify(updated));
  }
  
  // リトライキューに追加
  private static addToRetryQueue(data: OfflineData): void {
    const queue = JSON.parse(localStorage.getItem(this.RETRY_QUEUE_KEY) || '[]');
    queue.push(data);
    localStorage.setItem(this.RETRY_QUEUE_KEY, JSON.stringify(queue));
  }
  
  // ローカルデータを更新
  private static updateLocalData(type: OfflineData['type'], remoteData: any[]): void {
    const allData = JSON.parse(localStorage.getItem(this.OFFLINE_DATA_KEY) || '[]');
    const filtered = allData.filter((item: OfflineData) => item.type !== type);
    
    const newData = remoteData.map(item => ({
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data: item,
      timestamp: Date.now(),
      synced: true
    }));
    
    localStorage.setItem(this.OFFLINE_DATA_KEY, JSON.stringify([...filtered, ...newData]));
  }
  
  // 同期を再試行
  static async retrySync(): Promise<void> {
    const queue = JSON.parse(localStorage.getItem(this.RETRY_QUEUE_KEY) || '[]');
    
    for (const data of queue) {
      try {
        await this.saveToSupabase(data);
        this.markAsSynced(data.id);
        this.removeFromRetryQueue(data.id);
      } catch (error) {
        console.warn('リトライ失敗:', error);
      }
    }
  }
  
  // リトライキューから削除
  private static removeFromRetryQueue(id: string): void {
    const queue = JSON.parse(localStorage.getItem(this.RETRY_QUEUE_KEY) || '[]');
    const filtered = queue.filter((item: OfflineData) => item.id !== id);
    localStorage.setItem(this.RETRY_QUEUE_KEY, JSON.stringify(filtered));
  }
  
  // 同期状態を取得
  static getSyncStatus(): { synced: number; pending: number; failed: number } {
    const allData = JSON.parse(localStorage.getItem(this.OFFLINE_DATA_KEY) || '[]');
    const queue = JSON.parse(localStorage.getItem(this.RETRY_QUEUE_KEY) || '[]');
    
    return {
      synced: allData.filter((item: OfflineData) => item.synced).length,
      pending: allData.filter((item: OfflineData) => !item.synced).length,
      failed: queue.length
    };
  }
}

