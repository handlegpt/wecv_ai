"use client";
import { useState, useEffect } from "react";
import { User, Settings, Shield, Palette, Bell, Mail, LogOut, Loader2, CheckCircle, AlertCircle, Cloud, CloudOff, RefreshCw, Database, ShieldCheck, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      console.log("开始登出，当前状态:", { isAuthenticated, user: user?.name });
      await logout();
      console.log("登出完成，新状态:", { isAuthenticated, user: user?.name });
      toast.success(tAuth("logoutSuccess"));
      // 强制刷新页面以确保状态更新
      window.location.reload();
    } catch (error) {
      console.error("登出失败:", error);
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
              {tAuth("welcomeBack", { name: user.name })}
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
              <CardTitle>{tAuth("loginBenefits")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {tAuth("cloudSyncData")}</li>
                <li>• {tAuth("manageProfile")}</li>
                <li>• {tAuth("multiDevice")}</li>
                <li>• {tAuth("dataProtection")}</li>
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
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="text-lg font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.bio && (
                      <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant="secondary" className="w-fit">
                      <Cloud className="h-3 w-3 mr-1" />
                      {tAuth("cloudUser")}
                    </Badge>
                    <Badge variant="outline" className="w-fit">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      {tAuth("verified")}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">{tAuth("registerTime")}</p>
                      <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">{tAuth("lastUpdate")}</p>
                      <p className="font-medium">{new Date(user.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">{tAuth("syncStatus")}</p>
                      <p className="font-medium text-green-600">{tAuth("enabled")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 设置导航 */}
          <div className="space-y-6">
            {/* 主要设置 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{tAuth("mainSettings")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Settings */}
                <Link href="/dashboard/settings/profile">
                  <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full">
                    <CardHeader className="space-y-4">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950">
                          <User className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                        </div>
                        <span>{tAuth("profileSettings")}</span>
                      </CardTitle>
                      <CardDescription className="text-base">
                        {tAuth("profileDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{tAuth("profileFeatures")}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Preferences Settings */}
                <Link href="/dashboard/settings/preferences">
                  <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full">
                    <CardHeader className="space-y-4">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950">
                          <Palette className="h-6 w-6 text-purple-500 dark:text-purple-400" />
                        </div>
                        <span>{tAuth("preferencesSettings")}</span>
                      </CardTitle>
                      <CardDescription className="text-base">
                        {tAuth("preferencesDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Palette className="h-4 w-4" />
                        <span>{tAuth("preferencesFeatures")}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            {/* 账户管理 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{tAuth("accountManagement")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 同步状态 */}
                <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardHeader className="space-y-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-950">
                        <Cloud className="h-6 w-6 text-green-500 dark:text-green-400" />
                      </div>
                      <span>{tAuth("dataSync")}</span>
                    </CardTitle>
                    <CardDescription className="text-base">
                      {tAuth("syncDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{tAuth("cloudSync")}</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Cloud className="h-3 w-3 mr-1" />
                        {tAuth("enabled")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{tAuth("lastSync")}</span>
                      <span className="text-sm text-muted-foreground">
                        {syncStatus.lastSyncAt 
                          ? new Date(syncStatus.lastSyncAt).toLocaleString()
                          : tAuth("never")
                        }
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleManualSync}
                      disabled={isSyncing}
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {tAuth("syncing")}
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {tAuth("syncNow")}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* 登出按钮 */}
                <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardHeader className="space-y-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950">
                        <LogOut className="h-6 w-6 text-red-500 dark:text-red-400" />
                      </div>
                      <span>{tAuth("accountManagement")}</span>
                    </CardTitle>
                    <CardDescription className="text-base">
                      {tAuth("logoutDescription")}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
