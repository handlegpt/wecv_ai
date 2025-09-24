import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端，支持服务端和客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// 调试信息 - 检查环境变量
console.log('Supabase环境变量检查:', {
  supabaseUrl,
  supabaseAnonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined',
  processEnv: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'undefined'
  }
});

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
  // 使用模块级别的变量，这些在构建时就已经确定
  const isConfigured = Boolean(supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseAnonKey && supabaseAnonKey !== 'placeholder-key');
  
  // 调试信息
  if (typeof window !== 'undefined') {
    console.log('Supabase配置检查:', {
      supabaseUrl,
      supabaseAnonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined',
      isConfigured
    });
  }
  
  return isConfigured;
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
