"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/useAuthStore";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Palette, 
  Globe, 
  Bell, 
  Shield, 
  Save,
  Loader2,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

export default function PreferencesPage() {
  const t = useTranslations("preferences");
  const { user, updateUser } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  
  // 偏好设置状态
  const [preferences, setPreferences] = useState({
    language: "zh",
    theme: "system" as "light" | "dark" | "system",
    syncEnabled: true,
    notifications: {
      email: true,
      push: false,
      updates: true
    },
    privacy: {
      profilePublic: false,
      dataSharing: false,
      analytics: true
    }
  });

  // 初始化偏好设置
  useEffect(() => {
    if (user?.preferences) {
      setPreferences(prev => ({
        ...prev,
        ...user.preferences
      }));
    }
  }, [user]);

  // 检查Supabase配置
  useEffect(() => {
    setSupabaseConfigured(isSupabaseConfigured());
  }, []);

  // 处理偏好设置更新
  const handlePreferenceChange = (category: string, key: string, value: any) => {
    setPreferences(prev => {
      const newPreferences = { ...prev };
      if (category === 'notifications') {
        newPreferences.notifications = {
          ...prev.notifications,
          [key]: value
        };
      } else if (category === 'privacy') {
        newPreferences.privacy = {
          ...prev.privacy,
          [key]: value
        };
      }
      return newPreferences;
    });
  };

  // 处理直接偏好设置更新
  const handleDirectPreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 保存偏好设置
  const handleSavePreferences = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      if (supabaseConfigured) {
        const supabase = getSupabaseClient();
        
        // 更新Supabase profiles表
        const { error } = await supabase
          .from('profiles')
          .update({
            preferences: preferences,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;
      }

      // 更新本地状态
      await updateUser({
        preferences: preferences,
        updatedAt: new Date().toISOString()
      });

      // 应用主题设置
      if (preferences.theme !== 'system') {
        document.documentElement.setAttribute('data-theme', preferences.theme);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }

      toast.success("偏好设置已保存");
    } catch (error: any) {
      toast.error(error.message || "保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">请先登录以管理偏好设置</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">偏好设置</h1>
        <p className="text-muted-foreground">自定义您的应用体验</p>
      </div>

      {/* 外观设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            外观设置
          </CardTitle>
          <CardDescription>
            自定义应用的外观和主题
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">主题模式</Label>
            <Select 
              value={preferences.theme} 
              onValueChange={(value) => handleDirectPreferenceChange('theme', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择主题" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">浅色模式</SelectItem>
                <SelectItem value="dark">深色模式</SelectItem>
                <SelectItem value="system">跟随系统</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 语言设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            语言设置
          </CardTitle>
          <CardDescription>
            选择您偏好的界面语言
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">界面语言</Label>
            <Select 
              value={preferences.language} 
              onValueChange={(value) => handleDirectPreferenceChange('language', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择语言" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 同步设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            同步设置
          </CardTitle>
          <CardDescription>
            管理您的数据同步偏好
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sync-enabled">启用云端同步</Label>
              <p className="text-sm text-muted-foreground">
                将您的简历数据同步到云端，支持多设备访问
              </p>
            </div>
            <Switch
              id="sync-enabled"
              checked={preferences.syncEnabled}
              onCheckedChange={(checked) => handleDirectPreferenceChange('syncEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 通知设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            通知设置
          </CardTitle>
          <CardDescription>
            管理您希望接收的通知类型
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">邮件通知</Label>
                <p className="text-sm text-muted-foreground">
                  接收重要更新和系统通知
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.notifications.email}
                onCheckedChange={(checked) => handlePreferenceChange('notifications', 'email', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">推送通知</Label>
                <p className="text-sm text-muted-foreground">
                  接收实时推送通知
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={preferences.notifications.push}
                onCheckedChange={(checked) => handlePreferenceChange('notifications', 'push', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="update-notifications">更新通知</Label>
                <p className="text-sm text-muted-foreground">
                  接收产品更新和新功能通知
                </p>
              </div>
              <Switch
                id="update-notifications"
                checked={preferences.notifications.updates}
                onCheckedChange={(checked) => handlePreferenceChange('notifications', 'updates', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 隐私设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            隐私设置
          </CardTitle>
          <CardDescription>
            管理您的隐私和数据使用偏好
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="profile-public">公开个人资料</Label>
                <p className="text-sm text-muted-foreground">
                  允许其他用户查看您的基本信息
                </p>
              </div>
              <Switch
                id="profile-public"
                checked={preferences.privacy.profilePublic}
                onCheckedChange={(checked) => handlePreferenceChange('privacy', 'profilePublic', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="data-sharing">数据共享</Label>
                <p className="text-sm text-muted-foreground">
                  允许匿名数据用于产品改进
                </p>
              </div>
              <Switch
                id="data-sharing"
                checked={preferences.privacy.dataSharing}
                onCheckedChange={(checked) => handlePreferenceChange('privacy', 'dataSharing', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics">使用分析</Label>
                <p className="text-sm text-muted-foreground">
                  帮助我们改进产品体验
                </p>
              </div>
              <Switch
                id="analytics"
                checked={preferences.privacy.analytics}
                onCheckedChange={(checked) => handlePreferenceChange('privacy', 'analytics', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              保存设置
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
