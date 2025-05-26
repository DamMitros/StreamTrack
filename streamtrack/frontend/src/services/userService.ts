import { apiCall } from './apiService';

export interface User {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  keycloak_id: string;
  roles: string[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  avatar_url?: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface UserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export interface UserPromoteRequest {
  user_id: string;
  role: 'user' | 'admin';
}

export const userService = {
  async register(userData: UserCreate): Promise<User> {
    return apiCall('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async getAllUsers(): Promise<User[]> {
    return apiCall('/users');
  },

  async getProfile(): Promise<User> {
    return apiCall('/profile');
  },

  async updateProfile(userData: UserUpdate): Promise<User> {
    return apiCall('/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  async promoteUser(promotionData: UserPromoteRequest): Promise<{message: string}> {
    return apiCall('/promote', {
      method: 'POST',
      body: JSON.stringify(promotionData),
    });
  },

  async getUserById(userId: string): Promise<User> {
    return apiCall(`/users/${userId}`);
  },

  async deactivateUser(userId: string): Promise<{message: string}> {
    return apiCall(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async activateUser(userId: string): Promise<{message: string}> {
    return apiCall(`/users/${userId}/activate`, {
      method: 'PUT',
    });
  },

  async uploadAvatar(file: File): Promise<{avatar_url: string, message: string}> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiCall('/avatar', {
      method: 'POST',
      body: formData,
    });
  },
};
