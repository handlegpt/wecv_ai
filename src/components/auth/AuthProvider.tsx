"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, user, token, setAuthMode } = useAuthStore();

  useEffect(() => {
    // 检查是否有现有的会话
    const checkSession = async () => {
      if (!isSupabaseConfigured()) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // 如果有会话，更新认证状态
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          useAuthStore.setState({
            isAuthenticated: true,
            user: {
              id: session.user.id,
              email: session.user.email!,
              name: profile.name,
              avatar: profile.avatar_url,
              createdAt: session.user.created_at,
              updatedAt: profile.updated_at,
              preferences: profile.preferences,
            },
            token: session.access_token,
            authMode: 'hybrid',
            syncStatus: {
              isEnabled: profile.preferences?.sync_enabled || false,
              lastSyncAt: null,
              pendingChanges: 0,
              isSyncing: false,
            },
          });
        }
      }
    };

    checkSession();

    // 监听认证状态变化
    if (!isSupabaseConfigured()) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // 用户登录
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            useAuthStore.setState({
              isAuthenticated: true,
              user: {
                id: session.user.id,
                email: session.user.email!,
                name: profile.name,
                avatar: profile.avatar_url,
                createdAt: session.user.created_at,
                updatedAt: profile.updated_at,
                preferences: profile.preferences,
              },
              token: session.access_token,
              authMode: 'hybrid',
              syncStatus: {
                isEnabled: profile.preferences?.sync_enabled || false,
                lastSyncAt: null,
                pendingChanges: 0,
                isSyncing: false,
              },
            });
          }
        } else if (event === 'SIGNED_OUT') {
          // 用户登出
          useAuthStore.setState({
            isAuthenticated: false,
            user: null,
            token: null,
            authMode: 'local',
            syncStatus: {
              isEnabled: false,
              lastSyncAt: null,
              pendingChanges: 0,
              isSyncing: false,
            },
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
