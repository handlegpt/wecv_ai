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
  initializeAuth: () => Promise<void>;
  
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
        console.log("logout 方法被调用");
        try {
          if (isSupabaseConfigured()) {
            console.log("Supabase 已配置，执行 signOut");
            const supabase = getSupabaseClient();
            const { error } = await supabase.auth.signOut();
            if (error) {
              console.error("Supabase signOut 错误:", error);
            } else {
              console.log("Supabase signOut 成功");
            }
          } else {
            console.log("Supabase 未配置，跳过 signOut");
          }
        } catch (error) {
          console.error("登出过程中发生错误:", error);
        }
        
        console.log("更新本地状态");
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
        console.log("状态更新完成");
        
        // 清除 localStorage 中的认证状态
        try {
          localStorage.removeItem('auth-storage');
          console.log("已清除 localStorage 中的认证状态");
        } catch (error) {
          console.warn("清除 localStorage 失败:", error);
        }
        
        // 确保状态更新后通知所有订阅者
        return Promise.resolve();
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
        const { user: currentUser } = get();
        if (!currentUser) throw new Error('未登录');
        
        try {
          // 直接更新本地状态，因为用户数据现在存储在 Supabase Auth 中
          const updatedUser = {
            ...currentUser,
            ...userData,
          };
          
          set({ user: updatedUser });
          
          // 如果需要更新 Supabase 中的用户元数据，可以在这里添加
          if (isSupabaseConfigured()) {
            const supabase = getSupabaseClient();
            const { error } = await supabase.auth.updateUser({
              data: userData
            });
            
            if (error) {
              console.error('更新 Supabase 用户数据失败:', error);
              // 不抛出错误，因为本地状态已经更新
            }
          }
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
        
        if (!token) {
          throw new Error('用户未登录，无法同步数据');
        }
        if (!syncStatus.isEnabled) {
          throw new Error('云同步功能未启用');
        }
        
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
      
      // 初始化认证状态
      initializeAuth: async () => {
        console.log("初始化认证状态...");
        try {
          if (isSupabaseConfigured()) {
            const supabase = getSupabaseClient();
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error("获取会话失败:", error);
              // 清除可能损坏的状态
              set({
                isAuthenticated: false,
                user: null,
                token: null,
                authMode: 'local',
              });
              return;
            }
            
            if (session?.user && session.access_token) {
              console.log("发现有效会话，设置用户状态");
              
              // 验证token是否有效
              try {
                const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
                if (userError || !currentUser) {
                  console.log("Token无效，清除认证状态");
                  set({
                    isAuthenticated: false,
                    user: null,
                    token: null,
                    authMode: 'local',
                  });
                  return;
                }
                
                const user: User = {
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '用户',
                  avatar: session.user.user_metadata?.avatar_url || null,
                  preferences: {
                    language: 'zh',
                    theme: 'system' as 'system' | 'light' | 'dark',
                    syncEnabled: true
                  },
                  createdAt: session.user.created_at,
                  updatedAt: session.user.updated_at || session.user.created_at
                };
                
                set({
                  isAuthenticated: true,
                  user,
                  token: session.access_token,
                  authMode: 'cloud',
                });
              } catch (error) {
                console.log("Token验证失败，清除认证状态:", error);
                set({
                  isAuthenticated: false,
                  user: null,
                  token: null,
                  authMode: 'local',
                });
              }
            } else {
              console.log("无有效会话，设置为本地模式");
              set({
                isAuthenticated: false,
                user: null,
                token: null,
                authMode: 'local',
              });
            }
          } else {
            console.log("Supabase 未配置，使用本地模式");
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              authMode: 'local',
            });
          }
        } catch (error) {
          console.error("初始化认证状态失败:", error);
          // 发生错误时重置为本地模式
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            authMode: 'local',
          });
        }
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
