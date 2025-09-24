"use client";
import { User, Settings, Shield, Palette, Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";

const SettingsPage = () => {
  const t = useTranslations();
  const { isAuthenticated, user } = useAuthStore();

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

        {/* Auth Settings */}
        <Link href="/dashboard/settings/auth">
          <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
            <CardHeader className="space-y-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-950">
                  <Shield className="h-6 w-6 text-green-500 dark:text-green-400" />
                </div>
                <span>账户与安全</span>
              </CardTitle>
              <CardDescription className="text-base">
                管理登录方式和账户安全设置
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

    </div>
  );
};

export default SettingsPage;
