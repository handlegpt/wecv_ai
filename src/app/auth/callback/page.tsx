"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  // 确保只在客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // 处理认证回调
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
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
          setStatus('success');
          
          toast.success('登录成功！');
          
          // 延迟跳转到仪表板
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          throw new Error('未找到用户信息');
        }
      } catch (error: any) {
        console.error('认证回调错误:', error);
        setError(error.message || '登录失败');
        setStatus('error');
        toast.error('登录失败，请重试');
      }
    };

    handleAuthCallback();
  }, [router, setUser, setIsAuthenticated]);

  // 服务端渲染时显示加载状态
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              正在验证登录...
            </CardTitle>
            <CardDescription>
              请稍候，正在处理您的登录请求...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {status === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
            {status === 'loading' && '正在验证登录...'}
            {status === 'success' && '登录成功'}
            {status === 'error' && '登录失败'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && '请稍候，正在处理您的登录请求...'}
            {status === 'success' && '正在跳转到仪表板...'}
            {status === 'error' && error}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'error' && (
            <div className="space-y-4">
              <Button 
                onClick={() => router.push('/dashboard/settings')}
                className="w-full"
              >
                返回设置页面
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
