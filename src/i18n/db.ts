import { cookies, headers } from "next/headers";
import { defaultLocale, locales } from "./config";
import { detectBrowserLocale } from "@/utils/localeDetection";

const COOKIE_NAME = "NEXT_LOCALE";

/**
 * 获取用户语言偏好
 * 优先级：用户手动选择 > 浏览器语言 > 默认语言
 */
export async function getUserLocale(): Promise<string> {
  const cookieStore = cookies();
  const headersList = headers();
  
  // 1. 检查用户手动选择的语言（cookie）
  const userPreference = cookieStore.get(COOKIE_NAME)?.value;
  if (userPreference && locales.includes(userPreference as any)) {
    return userPreference;
  }
  
  // 2. 检查浏览器语言偏好
  const acceptLanguage = headersList.get("accept-language");
  if (acceptLanguage) {
    const browserLanguages = acceptLanguage
      .split(",")
      .map(lang => lang.split(";")[0].trim());
    
    const detectedLocale = detectBrowserLocale(browserLanguages);
    if (detectedLocale && locales.includes(detectedLocale)) {
      return detectedLocale;
    }
  }
  
  // 3. 使用默认语言
  return defaultLocale;
}

/**
 * 设置用户语言偏好
 */
export async function setUserLocale(locale: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: 365 * 24 * 60 * 60, // 1 年
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * 清除用户语言偏好
 */
export async function clearUserLocale() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}
