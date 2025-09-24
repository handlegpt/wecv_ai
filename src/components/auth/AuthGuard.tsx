"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = false, 
  redirectTo = "/auth" 
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, authMode, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // 如果不需要认证，直接通过
      if (!requireAuth) {
        setIsChecking(false);
        return;
      }

      // 如果是本地模式，允许访问
      if (authMode === 'local') {
        setIsChecking(false);
        return;
      }

      // 如果需要认证但用户未登录，重定向到认证页面
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, authMode, requireAuth, router, redirectTo, pathname]);

  // 显示加载状态
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
