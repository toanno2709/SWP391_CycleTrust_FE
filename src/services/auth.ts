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
    const response = await apiClient.post<ApiResponse<{ userId: number; fullName: string; role: string; token: string }>>('/auth/login', data);
    if (response.success && response.data) {
      const user: User = {
        id: response.data.userId,
        fullName: response.data.fullName,
        role: response.data.role as any,
        email: data.emailOrPhone?.includes('@') ? data.emailOrPhone : undefined,
        phone: data.emailOrPhone?.includes('@') ? undefined : data.emailOrPhone,
        isActive: true,
        ratingAvg: 0,
        ratingCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return { token: response.data.token, user };
    }
    throw new Error(response.message || 'Login failed');
  },

  async register(data: RegisterRequest): Promise<{ token: string; user: User }> {
    const response = await apiClient.post<ApiResponse<{ userId: number; fullName: string; role: string; token: string }>>('/auth/register', data);
    if (response.success && response.data) {
      const user: User = {
        id: response.data.userId,
        fullName: response.data.fullName,
        role: response.data.role as any,
        email: data.email,
        phone: data.phone,
        isActive: true,
        ratingAvg: 0,
        ratingCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return { token: response.data.token, user };
    }
    throw new Error(response.message || 'Registration failed');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<{ userId: number; userName: string; role: string }>>('/auth/me');
    if (response.success && response.data) {
      const user: User = {
        id: response.data.userId,
        fullName: response.data.userName,
        role: response.data.role as any,
        isActive: true,
        ratingAvg: 0,
        ratingCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
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
