"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/useAuthStore";
import SyncStatusCard from "@/components/sync/SyncStatusCard";

export const dynamic = 'force-dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Cloud, 
  Shield, 
  LogOut, 
  Settings, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function AuthSettingsPage() {
  const t = useTranslations("auth");
  const { 
    isAuthenticated, 
    user, 
    authMode, 
    syncStatus, 
    logout, 
    enableSync, 
    disableSync, 
    syncData,
    setAuthMode 
  } = useAuthStore();
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success(t("logoutSuccess"));
    } catch (error) {
      toast.error(t("logoutFailed"));
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSyncToggle = (enabled: boolean) => {
    if (enabled) {
      enableSync();
      toast.success(t("enableSyncSuccess"));
    } else {
      disableSync();
      toast.success(t("disableSyncSuccess"));
    }
  };

  const handleSyncNow = async () => {
    if (!isAuthenticated) return;
    
    setIsSyncing(true);
    try {
      await syncData();
      toast.success(t("syncComplete"));
    } catch (error) {
      toast.error(t("syncFailed"));
    } finally {
      setIsSyncing(false);
    }
  };

  const getModeInfo = () => {
    switch (authMode) {
      case 'local':
        return {
          title: t("localMode"),
          description: t("localDescription"),
          icon: Shield,
          color: "text-green-600",
          bgColor: "bg-green-50 dark:bg-green-950/50",
          badge: t("privacyFirst")
        };
      case 'cloud':
        return {
          title: t("cloudMode"),
          description: t("cloudDescription"),
          icon: Cloud,
          color: "text-blue-600",
          bgColor: "bg-blue-50 dark:bg-blue-950/50",
          badge: t("cloudSync")
        };
      case 'hybrid':
        return {
          title: t("hybridMode"),
          description: t("hybridDescription"),
          icon: RefreshCw,
          color: "text-purple-600",
          bgColor: "bg-purple-50 dark:bg-purple-950/50",
          badge: t("hybridMode")
        };
      default:
        return {
          title: t("localMode"),
          description: t("localDescription"),
          icon: Shield,
          color: "text-green-600",
          bgColor: "bg-green-50 dark:bg-green-950/50",
          badge: t("privacyFirst")
        };
    }
  };

  const modeInfo = getModeInfo();
  const ModeIcon = modeInfo.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("currentMode")}</h1>
        <p className="text-muted-foreground">{t("modeDescription")}</p>
      </div>

      {/* 当前模式状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("currentMode")}
          </CardTitle>
          <CardDescription>
            {t("modeDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg ${modeInfo.bgColor} border`}>
            <div className="flex items-center gap-3">
              <ModeIcon className={`h-6 w-6 ${modeInfo.color}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{modeInfo.title}</h3>
                  <Badge variant="secondary">{modeInfo.badge}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {modeInfo.description}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 用户信息 */}
      {isAuthenticated && user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("userInfo")}
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
                <p className="text-muted-foreground">{t("registerTime")}</p>
                <p>{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("lastUpdate")}</p>
                <p>{new Date(user.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 同步设置 */}
      {isAuthenticated && (
        <Card>
          <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          {t("syncSettings")}
        </CardTitle>
            <CardDescription>
              {t("syncDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sync-enabled">{t("enableCloudSync")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("syncDescription2")}
                </p>
              </div>
              <Switch
                id="sync-enabled"
                checked={syncStatus.isEnabled}
                onCheckedChange={handleSyncToggle}
              />
            </div>

            {syncStatus.isEnabled && (
              <>
                <Separator />
                <SyncStatusCard />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      <Card>
        <CardHeader>
          <CardTitle>{t("operations")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isAuthenticated ? (
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="destructive"
              className="w-full"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("loggingOut")}
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("logout")}
                </>
              )}
            </Button>
          ) : (
            <div className="text-center p-4">
              <p className="text-muted-foreground mb-4">
                认证功能正在开发中，请稍后再试
              </p>
              <Button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.assign('/dashboard');
                  }
                }}
                variant="outline"
                className="w-full"
              >
                <User className="mr-2 h-4 w-4" />
                返回仪表板
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
