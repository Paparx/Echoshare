import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Item, CommunityEvent, Stats, CleanupPlace } from '../types';
import { mockApi } from '../lib/mockApi';
import { useAuth } from './AuthContext';

interface DataContextType {
  items: Item[];
  events: CommunityEvent[];
  cleanupPlaces: CleanupPlace[];
  stats: Stats;
  leaderboard: { name: string; points: number }[];
  loading: boolean;
  refreshData: () => Promise<void>;
  addItem: (data: any) => Promise<void>;
  updateItem: (id: string, updates: any) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  createEvent: (data: any) => Promise<void>;
  updateEvent: (id: string, updates: any) => Promise<void>;
  joinEvent: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addCleanupPlace: (data: any) => Promise<void>;
  updateCleanupStatus: (id: string, status: CleanupPlace['status']) => Promise<void>;
  deleteCleanupPlace: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [cleanupPlaces, setCleanupPlaces] = useState<CleanupPlace[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalItemsShared: 0,
    totalEventsOrganized: 0,
    totalCleanupReports: 0,
    totalBorrowActions: 0,
    co2Saved: 0,
    wasteReduced: 0
  });
  const [leaderboard, setLeaderboard] = useState<{ name: string; points: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, updateUserBadge } = useAuth();

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedItems, fetchedEvents, fetchedCleanup, fetchedStats, fetchedLeaderboard] = await Promise.all([
        mockApi.getItems(),
        mockApi.getEvents(),
        mockApi.getCleanupPlaces(),
        mockApi.getStats(),
        mockApi.getLeaderboard(),
      ]);
      setItems(fetchedItems);
      setEvents(fetchedEvents);
      setCleanupPlaces(fetchedCleanup);
      setStats(fetchedStats);
      setLeaderboard(fetchedLeaderboard);
    } catch (err) {
      console.error('Refresh data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addItem = async (data: any) => {
    if (!user) return;
    await mockApi.addItem(data);
    await refreshData();
    updateUserBadge();
  };

  const updateItem = async (id: string, updates: any) => {
    if (!user) return;
    await mockApi.updateItem(id, updates, user.id, user.role);
    await refreshData();
    updateUserBadge();
  };

  const deleteItem = async (id: string) => {
    if (!user) return;
    await mockApi.deleteItem(id, user.id, user.role);
    await refreshData();
    updateUserBadge();
  };

  const createEvent = async (data: any) => {
    if (!user) return;
    await mockApi.createEvent(data);
    await refreshData();
    updateUserBadge();
  };

  const updateEvent = async (id: string, updates: any) => {
    if (!user) return;
    await mockApi.updateEvent(id, updates, user.id, user.role);
    await refreshData();
  };

  const joinEvent = async (id: string) => {
    if (!user) return;
    await mockApi.joinEvent(id, user.id);
    await refreshData();
    updateUserBadge();
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;
    await mockApi.deleteEvent(id, user.id, user.role);
    await refreshData();
    updateUserBadge();
  };

  const addCleanupPlace = async (data: any) => {
    if (!user) return;
    await mockApi.addCleanupPlace(data);
    await refreshData();
  };

  const updateCleanupStatus = async (id: string, status: CleanupPlace['status']) => {
    if (!user) return;
    await mockApi.updateCleanupStatus(id, status, user.id, user.role);
    await refreshData();
  };

  const deleteCleanupPlace = async (id: string) => {
    if (!user) return;
    await mockApi.deleteCleanupPlace(id, user.id, user.role);
    await refreshData();
  };

  return (
    <DataContext.Provider
      value={{
        items,
        events,
        cleanupPlaces,
        stats,
        leaderboard,
        loading,
        refreshData,
        addItem,
        updateItem,
        deleteItem,
        createEvent,
        updateEvent,
        joinEvent,
        deleteEvent,
        addCleanupPlace,
        updateCleanupStatus,
        deleteCleanupPlace,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
