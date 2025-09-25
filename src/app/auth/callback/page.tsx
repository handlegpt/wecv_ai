"use client";

import { useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

// 强制禁用服务端渲染
export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  const { setUser, setIsAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // 处理认证回调
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('认证错误:', error);
          window.location.href = '/dashboard/settings?error=auth_failed';
          return;
        }

        if (data.session?.user) {
          const user = data.session.user;
          
          // 更新认证状态
          setUser({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || '用户',
            avatar: user.user_metadata?.avatar_url || null,
            preferences: {
              language: 'zh',
              theme: 'system',
              syncEnabled: true
            },
            createdAt: user.created_at,
            updatedAt: user.updated_at || user.created_at
          });
          
          setIsAuthenticated(true);
          
          // 直接重定向到仪表板
          window.location.href = '/dashboard';
        } else {
          console.error('未找到用户信息');
          window.location.href = '/dashboard/settings?error=no_user';
        }
      } catch (error: any) {
        console.error('认证回调错误:', error);
        window.location.href = '/dashboard/settings?error=callback_failed';
      }
    };

    handleAuthCallback();
  }, [setUser, setIsAuthenticated]);

  // 简单的加载页面，避免复杂的状态管理
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">正在处理登录...</p>
      </div>
    </div>
  );
}