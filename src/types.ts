export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  flatNumber: string;
  role: Role;
  badges: string[];
  imageUrl?: string;
  points: number;
}

export type ItemCategory = 'Tools' | 'Books' | 'Electronics' | 'Kitchenware' | 'Sports' | 'Other';
export type ItemType = 'lend' | 'donate' | 'rent';

export interface Item {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  type: ItemType;
  available: boolean;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  createdBy: string;
  creatorName: string;
  participants: string[]; // User IDs
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  totalItemsShared: number;
  totalEventsOrganized: number;
  totalCleanupReports: number;
  totalBorrowActions: number;
  co2Saved: number;
  wasteReduced: number;
}

export interface CleanupPlace {
  id: string;
  title: string;
  description: string;
  location: string;
  postedBy: string;
  posterName: string;
  status: 'pending' | 'cleaning' | 'completed';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
