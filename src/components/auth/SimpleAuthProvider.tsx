"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

interface SimpleAuthProviderProps {
  children: React.ReactNode;
}

export default function SimpleAuthProvider({ children }: SimpleAuthProviderProps) {
  const { setAuthMode } = useAuthStore();

  useEffect(() => {
    // 在客户端初始化时设置默认模式
    setAuthMode('local');
  }, [setAuthMode]);

  return <>{children}</>;
}
