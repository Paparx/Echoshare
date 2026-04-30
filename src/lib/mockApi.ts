import axios from 'axios';
import { User, Item, CommunityEvent, Stats, CleanupPlace } from '../types';

const API_URL = '/api';

// Set up axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecoshare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const mockApi = {
  // --- AUTH ---
  register: async (userData: any): Promise<User> => {
    const { data } = await api.post('/register', userData);
    localStorage.setItem('ecoshare_token', data.token);
    localStorage.setItem('ecoshare_current_user', JSON.stringify(data.user));
    return data.user;
  },

  login: async (email: string, password: any): Promise<{ user: User; token: string }> => {
    const { data } = await api.post('/login', { email, password });
    localStorage.setItem('ecoshare_token', data.token);
    localStorage.setItem('ecoshare_current_user', JSON.stringify(data.user));
    return data;
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('ecoshare_current_user');
    return user ? JSON.parse(user) : null;
  },

  logout: () => {
    localStorage.removeItem('ecoshare_token');
    localStorage.removeItem('ecoshare_current_user');
  },

  updateProfile: async (_userId: string, updates: Partial<User>): Promise<User> => {
    // Map camelCase to snake_case for backend
    const mappedUpdates = {
      name: updates.name,
      email: updates.email,
      flat_number: updates.flatNumber,
      image_url: updates.imageUrl
    };
    const { data } = await api.put('/profile', mappedUpdates);
    
    // Map snake_case back to camelCase for frontend
    const result: User = {
      ...data,
      flatNumber: data.flat_number,
      imageUrl: data.image_url
    };
    
    localStorage.setItem('ecoshare_current_user', JSON.stringify(result));
    return result;
  },

  // --- ITEMS ---
  getItems: async (): Promise<Item[]> => {
    const { data } = await api.get('/items');
    return data;
  },

  addItem: async (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> => {
    const { data } = await api.post('/items', itemData);
    return data;
  },

  updateItem: async (itemId: string, updates: Partial<Item>, _userId: string, _role: string): Promise<Item> => {
    const { data } = await api.put(`/items/${itemId}`, updates);
    return data;
  },

  deleteItem: async (itemId: string, _userId: string, _role: string): Promise<void> => {
    await api.delete(`/items/${itemId}`);
  },

  // --- EVENTS ---
  getEvents: async (): Promise<CommunityEvent[]> => {
    const { data } = await api.get('/events');
    return data;
  },

  createEvent: async (eventData: Omit<CommunityEvent, 'id' | 'participants' | 'createdAt' | 'updatedAt'>): Promise<CommunityEvent> => {
    const { data } = await api.post('/events', eventData);
    return data;
  },

  joinEvent: async (eventId: string, _userId: string): Promise<void> => {
    await api.post(`/events/${eventId}/join`);
  },

  deleteEvent: async (eventId: string, _userId: string, _role: string): Promise<void> => {
    await api.delete(`/events/${eventId}`);
  },

  updateEvent: async (eventId: string, updates: Partial<CommunityEvent>, _userId: string, _role: string): Promise<CommunityEvent> => {
    // Note: You might need to add a backend route for updating events
    // For now, I'll simulate or you can add app.put('/api/events/:id', ...) to server.js
    const { data } = await api.put(`/events/${eventId}`, updates);
    return data;
  },

  // --- CLEANUP ---
  getCleanupPlaces: async (): Promise<CleanupPlace[]> => {
    const { data } = await api.get('/cleanup');
    return data;
  },

  addCleanupPlace: async (data: Omit<CleanupPlace, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<CleanupPlace> => {
    const { data: result } = await api.post('/cleanup', data);
    return result;
  },

  updateCleanupStatus: async (id: string, status: CleanupPlace['status'], _userId: string, _role: string): Promise<void> => {
    await api.put(`/cleanup/${id}/status`, { status });
  },

  deleteCleanupPlace: async (id: string, _userId: string, _role: string): Promise<void> => {
    await api.delete(`/cleanup/${id}`);
  },

  // --- STATS & BADGES ---
  getStats: async (): Promise<Stats> => {
    const { data } = await api.get('/stats');
    return data;
  },

  getLeaderboard: async (): Promise<{ name: string; points: number }[]> => {
    const { data } = await api.get('/leaderboard');
    return data;
  },

  // Badge logic is now more appropriate for backend, but we'll keep the signature
  checkBadges: (_userId: string) => {
    // Backend should handle badge assignments
  }
};
