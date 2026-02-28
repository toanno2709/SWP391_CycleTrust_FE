import { apiClient } from './api';
import { TOKEN_KEY, USER_KEY } from '../config/constants';
import type { 
  ApiResponse, 
  LoginRequest, 
  RegisterRequest, 
  User 
} from '../types';

export const authService = {
  async login(data: LoginRequest): Promise<{ token: string; user: User }> {
    const response = await apiClient.post<ApiResponse<{ token: string; user: User }>>('/auth/login', data);
    if (response.success && response.data) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      return response.data;
    }
    throw new Error(response.message || 'Login failed');
  },

  async register(data: RegisterRequest): Promise<{ token: string; user: User }> {
    const response = await apiClient.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data);
    if (response.success && response.data) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      return response.data;
    }
    throw new Error(response.message || 'Registration failed');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    if (response.success && response.data) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      return response.data;
    }
    throw new Error('Failed to get current user');
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};
