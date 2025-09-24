"use client";
import { useState, useEffect } from "react";
import { User, Settings, Shield, Palette, Bell, Mail, LogOut, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

const SettingsPage = () => {
  const t = useTranslations();
  const tAuth = useTranslations("auth");
  const { 
    isAuthenticated, 
    user, 
    logout, 
    syncStatus, 
    enableSync, 
    disableSync, 
    syncData 
  } = useAuthStore();
  
  // 认证相关状态
  const [email, setEmail] = useState("");
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 检查Supabase配置
  useEffect(() => {
    setSupabaseConfigured(isSupabaseConfigured());
  }, []);

  // 处理Magic Link登录
  const handleMagicLinkLogin = async () => {
    if (!email.trim()) {
      toast.error(tAuth("enterEmail"));
      return;
    }

    if (!supabaseConfigured) {
      toast.error(tAuth("authNotConfigured"));
      return;
    }

    setIsSendingMagicLink(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      setMagicLinkSent(true);
      toast.success(tAuth("loginLinkSentSuccess"));
    } catch (error: any) {
      toast.error(error.message || tAuth("sendLoginLinkFailed"));
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  // 处理登出
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success(tAuth("logoutSuccess"));
    } catch (error) {
      toast.error(tAuth("logoutFailed"));
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 处理同步
  const handleSyncToggle = async (checked: boolean) => {
    if (checked) {
      enableSync();
      toast.success(tAuth("enableSyncSuccess"));
    } else {
      disableSync();
      toast.success(tAuth("disableSyncSuccess"));
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncData();
      toast.success(tAuth("syncComplete"));
    } catch (error) {
      toast.error(tAuth("syncFailed"));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("dashboard.settings.title")}
          </h2>
          {isAuthenticated && user && (
            <p className="text-muted-foreground mt-1">
              欢迎回来，{user.name}
            </p>
          )}
        </div>
      </div>

      {/* 未登录状态：显示登录界面 */}
      {!isAuthenticated && (
        <div className="space-y-6">
          {/* Magic Link 登录 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {tAuth("magicLinkLogin")}
              </CardTitle>
              <CardDescription>
                {tAuth("magicLinkDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!magicLinkSent ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{tAuth("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={tAuth("emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSendingMagicLink}
                    />
                  </div>
                  <Button 
                    onClick={handleMagicLinkLogin}
                    disabled={isSendingMagicLink || !email.trim()}
                    className="w-full"
                  >
                    {isSendingMagicLink ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {tAuth("sending")}
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        {tAuth("sendLoginLink")}
                      </>
                    )}
                  </Button>
                  {!supabaseConfigured && (
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{tAuth("authNotConfigured")}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">{tAuth("loginLinkSent")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tAuth("checkEmail")}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setMagicLinkSent(false);
                      setEmail("");
                    }}
                    className="w-full"
                  >
                    {tAuth("resend")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 登录后功能说明 */}
          <Card>
            <CardHeader>
              <CardTitle>登录后您可以：</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 云端同步您的简历数据</li>
                <li>• 管理个人资料和偏好设置</li>
                <li>• 在多设备间无缝切换</li>
                <li>• 享受更安全的数据保护</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 已登录状态：显示完整设置界面 */}
      {isAuthenticated && (
        <div className="space-y-6">
          {/* 用户信息卡片 */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {tAuth("userInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{tAuth("registerTime")}</p>
                    <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{tAuth("lastUpdate")}</p>
                    <p>{new Date(user.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 设置导航 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Settings */}
            <Link href="/dashboard/settings/profile">
              <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                <CardHeader className="space-y-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950">
                      <User className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    </div>
                    <span>个人资料</span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    编辑个人信息、头像和简介
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Preferences Settings */}
            <Link href="/dashboard/settings/preferences">
              <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                <CardHeader className="space-y-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950">
                      <Palette className="h-6 w-6 text-purple-500 dark:text-purple-400" />
                    </div>
                    <span>偏好设置</span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    自定义主题、语言和通知偏好
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* 登出按钮 */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="space-y-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950">
                    <LogOut className="h-6 w-6 text-red-500 dark:text-red-400" />
                  </div>
                  <span>账户管理</span>
                </CardTitle>
                <CardDescription className="text-base">
                  登出当前账户
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleLogout} 
                  variant="destructive" 
                  className="w-full"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {tAuth("loggingOut")}
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      {tAuth("logout")}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
