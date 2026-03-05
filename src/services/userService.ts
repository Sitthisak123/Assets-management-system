import apiClient from './apiClient'; // Fixed import path
import type { Workplace } from './workplaceService';

// Define the User interface to ensure type safety across the app
export interface User {
  id: number;
  username?: string | null;
  email?: string | null;
  display_name?: string | null;
  fullname: string;
  position: string;
  workplace_id?: number | null;
  workplace?: Workplace | null;
  role: number;
  status: number;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  created_by_user?: Partial<User>;
}

// Service object
export const userService = {
  // Create a new user
  createUser: (data: {
    fullname: string;
    username?: string;
    display_name?: string;
    email?: string;
    position: string;
    workplace_id?: number | null;
    role: number;
    status?: number;
  }) => {
    return apiClient.post<User>('/users', data);
  },

  // Get all users (Admin view)
  getUsers: () => {
    return apiClient.get<User[]>('/users');
  },

  // Get a single user by ID
  getUser: (id: number | string) => {
    return apiClient.get<User>(`/users/${id}`);
  },

  // Alias for getUser
  getUserById: (id: number | string) => {
    return apiClient.get<User>(`/users/${id}`);
  },

  // Update a user (Required for the UserProfile page)
  updateUser: (id: number | string, data: Partial<User>) => {
    return apiClient.put<User>(`/users/${id}`, data);
  },

  // Delete a user (Optional, good to have)
  deleteUser: (id: number | string) => {
    return apiClient.delete(`/users/${id}`);
  }
};
