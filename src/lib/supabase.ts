import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端，支持服务端和客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// 安全的 Supabase 客户端创建
let supabaseClient: any = null;

export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // 服务器端
    if (!supabaseClient) {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      });
    }
    return supabaseClient;
  } else {
    // 客户端
    if (!supabaseClient) {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
    }
    return supabaseClient;
  }
};

export const supabase = getSupabaseClient();

// 检查 Supabase 是否已正确配置
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && url !== 'https://placeholder.supabase.co' && 
         key && key !== 'placeholder-key');
};

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          preferences?: {
            language: string;
            theme: 'light' | 'dark' | 'system';
            sync_enabled: boolean;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          preferences?: {
            language: string;
            theme: 'light' | 'dark' | 'system';
            sync_enabled: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          preferences?: {
            language: string;
            theme: 'light' | 'dark' | 'system';
            sync_enabled: boolean;
          };
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          data: any; // ResumeData
          template_id: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          data: any;
          template_id: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          data?: any;
          template_id?: string;
          is_public?: boolean;
          updated_at?: string;
          version?: number;
        };
      };
      sync_logs: {
        Row: {
          id: string;
          user_id: string;
          action: 'create' | 'update' | 'delete' | 'sync';
          resume_id?: string;
          local_version: number;
          cloud_version: number;
          status: 'pending' | 'synced' | 'conflict' | 'error';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: 'create' | 'update' | 'delete' | 'sync';
          resume_id?: string;
          local_version: number;
          cloud_version: number;
          status?: 'pending' | 'synced' | 'conflict' | 'error';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: 'create' | 'update' | 'delete' | 'sync';
          resume_id?: string;
          local_version?: number;
          cloud_version?: number;
          status?: 'pending' | 'synced' | 'conflict' | 'error';
        };
      };
    };
  };
}
