/**
 * 智能语言检测工具
 * 根据浏览器语言自动选择默认语言，并记住用户偏好
 */

export type SupportedLocale = "zh" | "en" | "ja";

export const SUPPORTED_LOCALES: SupportedLocale[] = ["zh", "en", "ja"];

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  zh: "中文",
  en: "English", 
  ja: "日本語",
};

/**
 * 根据浏览器语言检测最适合的语言
 * @param browserLanguages - 浏览器语言列表
 * @returns 检测到的语言代码
 */
export function detectBrowserLocale(browserLanguages: string[]): SupportedLocale {
  // 遍历浏览器语言列表，找到第一个匹配的语言
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
  
  // 默认返回英文
  return "en";
}

/**
 * 获取浏览器语言列表
 * @returns 浏览器语言数组
 */
export function getBrowserLanguages(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  
  const languages: string[] = [];
  
  // 获取 navigator.languages（优先）
  if (navigator.languages && navigator.languages.length > 0) {
    languages.push(...navigator.languages);
  }
  
  // 获取 navigator.language（备用）
  if (navigator.language) {
    languages.push(navigator.language);
  }
  
  return languages;
}

/**
 * 检测用户偏好的语言
 * 优先级：用户手动选择 > 浏览器语言 > 默认语言
 * @param userPreference - 用户手动选择的语言（来自 cookie）
 * @param browserLanguages - 浏览器语言列表
 * @param defaultLocale - 默认语言
 * @returns 最终选择的语言
 */
export function detectUserLocale(
  userPreference?: string | null,
  browserLanguages?: string[],
  defaultLocale: SupportedLocale = "en"
): SupportedLocale {
  // 1. 如果用户有手动选择，优先使用
  if (userPreference && SUPPORTED_LOCALES.includes(userPreference as SupportedLocale)) {
    return userPreference as SupportedLocale;
  }
  
  // 2. 根据浏览器语言检测
  if (browserLanguages && browserLanguages.length > 0) {
    const detected = detectBrowserLocale(browserLanguages);
    if (detected) {
      return detected;
    }
  }
  
  // 3. 使用默认语言
  return defaultLocale;
}

/**
 * 保存用户语言偏好到 cookie
 * @param locale - 语言代码
 * @param maxAge - cookie 过期时间（秒），默认 1 年
 */
export function saveUserLocalePreference(locale: SupportedLocale, maxAge: number = 365 * 24 * 60 * 60): void {
  if (typeof document === "undefined") {
    return;
  }
  
  const cookieName = "NEXT_LOCALE";
  const cookieValue = locale;
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  
  document.cookie = `${cookieName}=${cookieValue}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * 从 cookie 获取用户语言偏好
 * @returns 用户偏好的语言代码，如果没有则返回 null
 */
export function getUserLocalePreference(): SupportedLocale | null {
  if (typeof document === "undefined") {
    return null;
  }
  
  const cookies = document.cookie.split(";");
  const localeCookie = cookies.find(cookie => 
    cookie.trim().startsWith("NEXT_LOCALE=")
  );
  
  if (localeCookie) {
    const locale = localeCookie.split("=")[1]?.trim();
    if (locale && SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
      return locale as SupportedLocale;
    }
  }
  
  return null;
}

/**
 * 客户端语言检测 Hook
 * 在客户端组件中使用，提供实时的语言检测
 */
export function useLocaleDetection() {
  if (typeof window === "undefined") {
    return {
      detectedLocale: "en" as SupportedLocale,
      browserLanguages: [],
      userPreference: null,
    };
  }
  
  const browserLanguages = getBrowserLanguages();
  const userPreference = getUserLocalePreference();
  const detectedLocale = detectUserLocale(userPreference, browserLanguages);
  
  return {
    detectedLocale,
    browserLanguages,
    userPreference,
  };
}
