export const locales = ["zh", "en", "ja"] as const;
export type Locale = (typeof locales)[number];

// 默认语言改为英文，因为我们的检测逻辑会智能选择
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  zh: "中文",
  en: "English",
  ja: "日本語",
};

// 语言检测配置
export const LOCALE_DETECTION_CONFIG = {
  // 浏览器语言映射
  browserLanguageMap: {
    "ja": "ja",
    "ja-JP": "ja", 
    "zh": "zh",
    "zh-CN": "zh",
    "zh-TW": "zh",
    "zh-HK": "zh",
    "en": "en",
    "en-US": "en",
    "en-GB": "en",
  },
  // 默认语言优先级
  defaultFallback: "en" as Locale,
} as const;
