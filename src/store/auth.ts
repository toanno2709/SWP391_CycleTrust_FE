import { create } from 'zustand';
import type { User } from '../types';
import { UserRole } from '../types';
import { authService } from '../services/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  setUser: (user: User | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: authService.getStoredUser(),
  isLoading: false,
  isAuthenticated: authService.isAuthenticated(),
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user 
  }),
  
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },
  
  checkAuth: async () => {
    if (!authService.isAuthenticated()) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
  
  hasRole: (role) => {
    const { user } = get();
    return user?.role === role;
  },
}));
