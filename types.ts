
export enum UserRole {
  BRAND_MANAGER = 'BRAND_MANAGER',
  FREELANCER = 'FREELANCER'
}

export enum MissionStatus {
  AVAILABLE = 'AVAILABLE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  VERIFIED = 'VERIFIED'
}

export interface Product {
  id: string;
  name: string;
  expectedStock: number;
}

export interface Mission {
  id: string;
  storeName: string;
  address: string;
  brand: string;
  task: string;
  reward: number;
  status: MissionStatus;
  products: Product[];
  distance?: string;
  imageUrl?: string;
  aiReport?: string;
}

export interface StockMetric {
  date: string;
  stockLevel: number;
  outOfStockEvents: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: Date;
}
