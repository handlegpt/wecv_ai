"use client";

import { useLocaleDetection } from "@/hooks/useLocaleDetection";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * 语言检测调试信息组件
 * 仅在开发环境中显示，帮助调试语言检测逻辑
 */
export default function LocaleDebugInfo() {
  const currentLocale = useLocale();
  const { isClient, detectedLocale, browserLanguages, userPreference } = useLocaleDetection();

  // 只在开发环境显示
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  if (!isClient) {
    return (
      <Card className="m-4 border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-sm">🌐 语言检测调试</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">正在加载客户端信息...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="m-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-sm">🌐 语言检测调试信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">当前语言:</span>
          <Badge variant="default">{currentLocale}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">检测到的语言:</span>
          <Badge variant="secondary">{detectedLocale}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">用户偏好:</span>
          <Badge variant={userPreference ? "default" : "outline"}>
            {userPreference || "无"}
          </Badge>
        </div>
        
        <div>
          <span className="font-medium">浏览器语言:</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {browserLanguages.map((lang, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {lang}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-600">
            优先级: 用户偏好 → 浏览器语言 → 默认语言
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
