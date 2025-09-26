import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ShareLink, ShareLinkStats } from '@/services/shareLinkService';

interface ShareLinkState {
  // 数据状态
  shareLinks: ShareLink[];
  stats: ShareLinkStats | null;
  loading: boolean;
  error: string | null;
  
  // 操作状态
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

interface ShareLinkActions {
  // 数据获取
  loadShareLinks: () => Promise<void>;
  loadStats: () => Promise<void>;
  
  // 分享链接管理
  createShareLink: (data: {
    username: string;
    resumeId: string;
    password?: string;
  }) => Promise<ShareLink>;
  
  updateShareLink: (id: string, data: {
    isActive?: boolean;
    password?: string;
    removePassword?: boolean;
  }) => Promise<ShareLink>;
  
  deleteShareLink: (id: string) => Promise<void>;
  
  // 工具方法
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  
  // 状态管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type ShareLinkStore = ShareLinkState & ShareLinkActions;

export const useShareLinkStore = create<ShareLinkStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      shareLinks: [],
      stats: null,
      loading: false,
      error: null,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,

      // 加载分享链接列表
      loadShareLinks: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/share-links', {
            credentials: 'include', // 包含cookies
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || '获取分享链接失败');
          }
          
          set({ shareLinks: data.data, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      // 加载统计信息
      loadStats: async () => {
        try {
          const response = await fetch('/api/share-links/stats', {
            credentials: 'include', // 包含cookies
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || '获取统计信息失败');
          }
          
          set({ stats: data.data });
        } catch (error: any) {
          console.error('加载统计信息失败:', error);
        }
      },

      // 创建分享链接
      createShareLink: async (data) => {
        set({ isCreating: true, error: null });
        try {
          const response = await fetch('/api/share-links', {
            method: 'POST',
            credentials: 'include', // 包含cookies
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || '创建分享链接失败');
          }
          
          // 更新本地状态
          const { shareLinks } = get();
          set({ 
            shareLinks: [result.data, ...shareLinks],
            isCreating: false 
          });
          
          return result.data;
        } catch (error: any) {
          set({ error: error.message, isCreating: false });
          throw error;
        }
      },

      // 更新分享链接
      updateShareLink: async (id, data) => {
        set({ isUpdating: true, error: null });
        try {
          const response = await fetch(`/api/share-links/${id}`, {
            method: 'PUT',
            credentials: 'include', // 包含cookies
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || '更新分享链接失败');
          }
          
          // 更新本地状态
          const { shareLinks } = get();
          const updatedLinks = shareLinks.map(link => 
            link.id === id ? result.data : link
          );
          
          set({ 
            shareLinks: updatedLinks,
            isUpdating: false 
          });
          
          return result.data;
        } catch (error: any) {
          set({ error: error.message, isUpdating: false });
          throw error;
        }
      },

      // 删除分享链接
      deleteShareLink: async (id) => {
        set({ isDeleting: true, error: null });
        try {
          const response = await fetch(`/api/share-links/${id}`, {
            method: 'DELETE',
            credentials: 'include', // 包含cookies
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || '删除分享链接失败');
          }
          
          // 更新本地状态
          const { shareLinks } = get();
          const updatedLinks = shareLinks.filter(link => link.id !== id);
          
          set({ 
            shareLinks: updatedLinks,
            isDeleting: false 
          });
        } catch (error: any) {
          set({ error: error.message, isDeleting: false });
          throw error;
        }
      },

      // 检查用户名可用性
      checkUsernameAvailability: async (username) => {
        try {
          const response = await fetch('/api/share-links/check-username', {
            method: 'POST',
            credentials: 'include', // 包含cookies
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            return false;
          }
          
          return result.data.available;
        } catch (error) {
          return false;
        }
      },

      // 状态管理方法
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'share-link-storage',
      partialize: (state) => ({
        shareLinks: state.shareLinks,
        stats: state.stats,
      }),
    }
  )
);
