export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: {
    language: string;
    theme: 'light' | 'dark' | 'system';
    syncEnabled: boolean;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface SyncStatus {
  isEnabled: boolean;
  lastSyncAt: string | null;
  pendingChanges: number;
  isSyncing: boolean;
}

export interface CloudResumeData {
  id: string;
  userId: string;
  title: string;
  data: any; // ResumeData
  createdAt: string;
  updatedAt: string;
  version: number;
}

export type AuthMode = 'local' | 'cloud' | 'hybrid';
