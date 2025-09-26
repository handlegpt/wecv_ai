"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Settings, Shield, Palette, Bell, Mail, LogOut, Loader2, CheckCircle, AlertCircle, Cloud, CloudOff, RefreshCw, Database, ShieldCheck, Clock, Share2, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { useShareLinkStore } from "@/store/useShareLinkStore";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { syncService } from "@/services/syncService";
import { toast } from "sonner";
import ShareLinkDialog from "@/components/share/ShareLinkDialog";

const SettingsPage = () => {
  const t = useTranslations();
  const tAuth = useTranslations("auth");
  const tPrefs = useTranslations("preferences");
  const tShare = useTranslations("share");
  const router = useRouter();
  const { 
    isAuthenticated, 
    user, 
    logout, 
    syncStatus, 
    enableSync, 
    disableSync, 
    syncData,
    initializeAuth,
    updateUser
  } = useAuthStore();
  
  const { 
    shareLinks, 
    stats, 
    loadShareLinks, 
    loadStats 
  } = useShareLinkStore();
  
  // 认证相关状态
  const [email, setEmail] = useState("");
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // 分享链接相关状态
  const [showShareLinkDialog, setShowShareLinkDialog] = useState(false);

  // 检查Supabase配置
  useEffect(() => {
    setSupabaseConfigured(isSupabaseConfigured());
  }, []);

  // 初始化认证状态（只执行一次）
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  // 加载分享链接数据
  useEffect(() => {
    console.log('设置页面认证状态检查:', { isAuthenticated, user: !!user, userId: user?.id });
    if (isAuthenticated) {
      loadShareLinks();
      loadStats();
    }
  }, [isAuthenticated, user, loadShareLinks, loadStats]);

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
      
      // 执行登出
      await logout();
      console.log("登出完成");
      
      // 清除所有相关的 localStorage 数据
      try {
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('resume-storage');
        console.log("已清除所有本地存储数据");
      } catch (error) {
        console.warn("清除本地存储失败:", error);
      }
      
      toast.success(tAuth("logoutSuccess"));
      
      // 延迟刷新以确保状态完全清理
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
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
    if (!isAuthenticated) {
      toast.error(tAuth("loginRequired"));
      return;
    }
    
    if (!syncStatus.isEnabled) {
      toast.error(tAuth("syncNotEnabled"));
      return;
    }
    
    setIsSyncing(true);
    try {
      await syncData();
      
      // 检查是否有简历数据
      const localData = localStorage.getItem('resume-storage');
      const hasLocalResumes = localData && Object.keys(JSON.parse(localData || '{}')).length > 0;
      
      if (!hasLocalResumes) {
        toast.info(tShare('noResumesCreated'));
      } else {
        toast.success(tShare('syncSuccess'));
      }
    } catch (error) {
      console.error("同步失败:", error);
      toast.error(tAuth("syncFailed"));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCheckCloudData = async () => {
    try {
      await syncService.checkCloudData();
      toast.success("云端数据检查完成，请查看控制台");
    } catch (error) {
      console.error("检查云端数据失败:", error);
      toast.error("检查云端数据失败");
    }
  };

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("dashboard.settings.title")}
          </h2>
          {isAuthenticated && user && (
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {tAuth("welcomeBack", { name: user.name })}
            </p>
          )}
        </div>
      </div>

      {/* 未登录状态：显示登录界面 */}
      {!isAuthenticated && (
        <div className="space-y-4 md:space-y-6">
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
                    className="w-full min-h-[48px] text-base"
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
                    className="w-full min-h-[48px] text-base"
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
              <div className="space-y-4 md:space-y-6">
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

            {/* 分享与链接 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{tAuth("sharingAndLinks")}</h3>
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {/* 分享链接管理 */}
                <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardHeader className="space-y-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950">
                        <Share2 className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                      </div>
                      <span>{tAuth("shareLinks")}</span>
                    </CardTitle>
                    <CardDescription className="text-base">
                      {tAuth("shareLinksDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 公开资料开关 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{tAuth("publicProfile")}</span>
                          <Badge variant="outline" className="text-xs">
                            wecv.com/share/{user?.name?.toLowerCase().replace(/\s+/g, '') || 'username'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {user?.preferences?.privacy?.profilePublic 
                            ? tAuth("publicProfileEnabled") 
                            : tAuth("publicProfileDisabled")
                          }
                        </p>
                      </div>
                      <Switch
                        checked={user?.preferences?.privacy?.profilePublic || false}
                        onCheckedChange={async (checked) => {
                          try {
                            await updateUser({
                              preferences: {
                                language: user?.preferences?.language || 'zh',
                                theme: user?.preferences?.theme || 'system',
                                syncEnabled: user?.preferences?.syncEnabled || false,
                                notifications: user?.preferences?.notifications,
                                privacy: {
                                  profilePublic: checked,
                                  dataSharing: user?.preferences?.privacy?.dataSharing ?? false,
                                  analytics: user?.preferences?.privacy?.analytics ?? false
                                }
                              }
                            });
                            toast.success(checked ? tAuth("publicProfileEnabled") : tAuth("publicProfileDisabled"));
                          } catch (error) {
                            toast.error(tAuth("updateFailed"));
                          }
                        }}
                      />
                    </div>
                    
                    {/* 链接信息 */}
                    {user?.preferences?.privacy?.profilePublic && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{tAuth("viewCount")}</span>
                          <span className="text-sm text-muted-foreground">
                            {stats?.totalViews || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{tAuth("protectionStatus")}</span>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                            <Lock className="h-3 w-3 mr-1" />
                            {shareLinks.length > 0 ? tAuth("enabled") : tAuth("disabled")}
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    {/* 主要操作按钮 */}
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full min-h-[44px] text-sm md:text-base"
                        onClick={() => setShowShareLinkDialog(true)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        {shareLinks.length > 0 ? tAuth("manageShareLinks") : "创建分享链接"}
                      </Button>
                      
                      {shareLinks.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full min-h-[44px] text-sm md:text-base"
                          onClick={() => setShowShareLinkDialog(true)}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          {tPrefs("setPassword")}
                        </Button>
                      )}
                    </div>
                    
                    {/* 辅助操作按钮 */}
                    {shareLinks.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => {
                            const link = `${window.location.origin}/share/${shareLinks[0]?.username}`;
                            navigator.clipboard.writeText(link);
                            toast.success(tShare('linkCopiedToClipboard'));
                          }}
                        >
                          📋 {tShare('copyLink')}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => setShowShareLinkDialog(true)}
                        >
                          📊 {tShare('viewStats')}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => {
                            const link = `${window.location.origin}/share/${shareLinks[0]?.username}`;
                            window.open(link, '_blank');
                          }}
                        >
                          🔗 {tShare('previewLink')}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 账户管理 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{tAuth("accountManagement")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                          : tPrefs("never")
                        }
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full min-h-[44px] text-sm md:text-base"
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
                      <div className="space-y-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-xs"
                          onClick={handleCheckCloudData}
                        >
                          🔍 检查云端数据
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-xs"
                          onClick={() => router.push('/dashboard/resumes')}
                        >
                          📝 {tShare('createResume')}
                        </Button>
                      </div>
                    </div>
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
                      className="w-full min-h-[48px] text-base"
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
      
      {/* 分享链接管理对话框 */}
      <ShareLinkDialog
        isOpen={showShareLinkDialog}
        onClose={() => setShowShareLinkDialog(false)}
      />
    </div>
  );
};

export default SettingsPage;
