import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, AuthState, LoginCredentials, RegisterCredentials, SyncStatus, AuthMode } from "@/types/auth";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { syncService, SyncResult } from "@/services/syncService";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface AuthStore extends AuthState {
  // 认证操作
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  
  // Supabase 认证方法
  setUser: (user: User) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  
  // 用户管理
  updateUser: (userData: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  
  // 同步管理
  syncStatus: SyncStatus;
  enableSync: () => void;
  disableSync: () => void;
  syncData: () => Promise<void>;
  refreshSyncStatus: () => Promise<void>;
  
  // 模式管理
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  
  // 工具方法
  clearError: () => void;
  isLocalMode: () => boolean;
  isCloudMode: () => boolean;
  isHybridMode: () => boolean;
}

// 使用 Supabase 替代自定义 API

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
      
      syncStatus: {
        isEnabled: false,
        lastSyncAt: null,
        pendingChanges: 0,
        isSyncing: false,
      },
      
      authMode: 'local', // 默认本地模式
      
      // 认证操作
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          if (!isSupabaseConfigured()) {
            throw new Error('Supabase 未配置，请检查环境变量');
          }
          
          const supabase = getSupabaseClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });
          
          if (error) {
            throw new Error(error.message);
          }
          
          if (data.user) {
            // 获取用户资料
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              name: profile?.name || data.user.user_metadata?.name || '用户',
              avatar: profile?.avatar_url || data.user.user_metadata?.avatar_url,
              createdAt: data.user.created_at,
              updatedAt: profile?.updated_at || data.user.updated_at,
              preferences: profile?.preferences,
            };
            
            set({
              isAuthenticated: true,
              user,
              token: data.session?.access_token || null,
              isLoading: false,
              authMode: 'hybrid', // 登录后切换到混合模式
            });
            
            // 启用同步
            get().enableSync();
          }
          
        } catch (error: any) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },
      
      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          if (credentials.password !== credentials.confirmPassword) {
            throw new Error('密码确认不匹配');
          }
          
          if (!isSupabaseConfigured()) {
            throw new Error('Supabase 未配置，请检查环境变量');
          }
          
          const supabase = getSupabaseClient();
          const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
              data: {
                name: credentials.name,
              }
            }
          });
          
          if (error) {
            throw new Error(error.message);
          }
          
          if (data.user) {
            // 创建用户资料
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email!,
                name: credentials.name,
                preferences: {
                  language: 'zh',
                  theme: 'system',
                  sync_enabled: true,
                }
              });
            
            if (profileError) {
              // 用户资料创建失败，但不影响登录流程
            }
            
            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              name: credentials.name,
              avatar: data.user.user_metadata?.avatar_url,
              createdAt: data.user.created_at,
              updatedAt: data.user.updated_at,
              preferences: {
                language: 'zh',
                theme: 'system',
                syncEnabled: true,
              },
            };
            
            set({
              isAuthenticated: true,
              user,
              token: data.session?.access_token || null,
              isLoading: false,
              authMode: 'hybrid',
            });
            
            // 启用同步
            get().enableSync();
          }
          
        } catch (error: any) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },
      
      logout: async () => {
        if (isSupabaseConfigured()) {
          const supabase = getSupabaseClient();
          await supabase.auth.signOut();
        }
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
          authMode: 'local',
          syncStatus: {
            isEnabled: false,
            lastSyncAt: null,
            pendingChanges: 0,
            isSyncing: false,
          },
        });
      },
      
      refreshToken: async () => {
        const { token } = get();
        if (!token) return;
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          const data = await response.json();
          
          if (response.ok) {
            set({ token: data.token });
          } else {
            get().logout();
          }
        } catch (error) {
          get().logout();
        }
      },
      
      // 用户管理
      updateUser: async (userData: Partial<User>) => {
        const { token } = get();
        if (!token) throw new Error('未登录');
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || '更新失败');
          }
          
          set({ user: data.user });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },
      
      updatePreferences: async (preferences: Partial<User['preferences']>) => {
        const { user, updateUser } = get();
        if (!user) return;
        
        const updatedPreferences = {
          language: 'zh',
          theme: 'system' as 'system' | 'light' | 'dark',
          syncEnabled: true,
          ...user.preferences,
          ...preferences,
        };
        
        await updateUser({ preferences: updatedPreferences });
      },
      
      // 同步管理
      enableSync: () => {
        set(state => ({
          syncStatus: {
            ...state.syncStatus,
            isEnabled: true,
          },
        }));
      },
      
      disableSync: () => {
        set(state => ({
          syncStatus: {
            ...state.syncStatus,
            isEnabled: false,
          },
        }));
      },
      
      syncData: async () => {
        const { token, syncStatus } = get();
        if (!token || !syncStatus.isEnabled) return;
        
        set(state => ({
          syncStatus: {
            ...state.syncStatus,
            isSyncing: true,
          },
        }));
        
        try {
          // 执行真正的数据同步
          const result: SyncResult = await syncService.performSync();
          
          if (result.success) {
            // 获取更新后的同步状态
            const status = await syncService.getSyncStatus();
            
            set(state => ({
              syncStatus: {
                ...state.syncStatus,
                isSyncing: false,
                lastSyncAt: status.lastSync || new Date().toISOString(),
                pendingChanges: status.pendingChanges,
              },
            }));
          } else {
            throw new Error(result.errors.join('; '));
          }
        } catch (error) {
          set(state => ({
            syncStatus: {
              ...state.syncStatus,
              isSyncing: false,
            },
          }));
          throw error;
        }
      },
      
      refreshSyncStatus: async () => {
        const { syncStatus } = get();
        if (!syncStatus.isEnabled) return;
        
        try {
          const status = await syncService.getSyncStatus();
          set(state => ({
            syncStatus: {
              ...state.syncStatus,
              lastSyncAt: status.lastSync,
              pendingChanges: status.pendingChanges,
            },
          }));
        } catch (error) {
          console.error('刷新同步状态失败:', error);
        }
      },
      
      // 模式管理
      setAuthMode: (mode: AuthMode) => {
        set({ authMode: mode });
      },
      
      // Supabase 认证方法
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },
      
      setIsAuthenticated: (authenticated: boolean) => {
        set({ isAuthenticated: authenticated });
        if (!authenticated) {
          set({ user: null, token: null });
        }
      },
      
      // 工具方法
      clearError: () => {
        set({ error: null });
      },
      
      isLocalMode: () => {
        return get().authMode === 'local';
      },
      
      isCloudMode: () => {
        return get().authMode === 'cloud';
      },
      
      isHybridMode: () => {
        return get().authMode === 'hybrid';
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        authMode: state.authMode,
        syncStatus: state.syncStatus,
      }),
    }
  )
);
