"use client";

import { useState, useEffect } from "react";
import { SupportedLocale, detectUserLocale as detectLocale } from "@/utils/localeDetection";

/**
 * 客户端语言检测 Hook
 * 提供实时的语言检测和用户偏好管理
 */
export function useLocaleDetection() {
  const [isClient, setIsClient] = useState(false);
  const [detectedLocale, setDetectedLocale] = useState<SupportedLocale>("en");
  const [browserLanguages, setBrowserLanguages] = useState<string[]>([]);
  const [userPreference, setUserPreference] = useState<SupportedLocale | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== "undefined") {
      // 获取浏览器语言
      const languages = Array.from(navigator.languages || [navigator.language]);
      setBrowserLanguages(languages);
      
      // 获取用户偏好
      const preference = localStorage.getItem("NEXT_LOCALE") as SupportedLocale | null;
      setUserPreference(preference);
      
      // 检测最适合的语言
      const detected = detectLocale(preference || undefined, languages);
      setDetectedLocale(detected);
    }
  }, []);

  return {
    isClient,
    detectedLocale,
    browserLanguages,
    userPreference,
    // 工具方法
    savePreference: (locale: SupportedLocale) => {
      localStorage.setItem("NEXT_LOCALE", locale);
      setUserPreference(locale);
    },
    clearPreference: () => {
      localStorage.removeItem("NEXT_LOCALE");
      setUserPreference(null);
    },
  };
}

/**
 * 检测用户偏好的语言
 */
function detectUserLocale(
  userPreference: SupportedLocale | null,
  browserLanguages: string[],
  defaultLocale: SupportedLocale = "en"
): SupportedLocale {
  // 1. 如果用户有手动选择，优先使用
  if (userPreference) {
    return userPreference;
  }
  
  // 2. 根据浏览器语言检测
  if (browserLanguages.length > 0) {
    for (const browserLang of browserLanguages) {
      const lang = browserLang.toLowerCase();
      
      // 精确匹配
      if (lang === "ja" || lang === "ja-jp") {
        return "ja";
      }
      
      if (lang === "zh" || lang === "zh-cn" || lang === "zh-tw" || lang === "zh-hk") {
        return "zh";
      }
      
      if (lang === "en" || lang.startsWith("en-")) {
        return "en";
      }
      
      // 部分匹配
      if (lang.startsWith("ja")) {
        return "ja";
      }
      
      if (lang.startsWith("zh")) {
        return "zh";
      }
    }
  }
  
  // 3. 使用默认语言
  return defaultLocale;
}
