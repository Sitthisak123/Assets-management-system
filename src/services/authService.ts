import apiClient from './apiClient';
import { jwtDecode } from 'jwt-decode';

// --- Interfaces (Updated to match your new Schema) ---

export interface User {
  id: number;
  username: string;
  title: string;
  fullname: string; // Moved from personnel
  position: string; // Moved from personnel
  email: string;
  role: number;
  status: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Register data must now include fullname and position
export interface RegisterData {
  username: string;
  password: string;
  email: string;
  title: string;
  fullname: string; 
  position: string;
  role?: number;
  status?: number;
}

export interface UserPayload {
  id: number;
  username: string;
  role: number;
  iat?: number;
  exp?: number;
}

// --- Service Methods ---

const login = async (credentials: any): Promise<AuthResponse> => {
  // apiClient BaseURL is already '/api', so we just add '/auth/login'
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
  // Optional: Redirect to login or force page reload
  window.location.href = '/login'; 
};

const getCurrentUser = (): UserPayload | null => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode<UserPayload>(token);
      
      // Check for expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        logout();
        return null;
      }
      return decoded;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  }
  return null;
};

// Gets full profile from DB (if you need more than what's in the token)
const getProfile = async (): Promise<User> => {
  // apiClient automatically adds the Authorization header
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

export const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  getProfile,
};