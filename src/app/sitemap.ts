import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://wecv.ai";
  const currentDate = new Date();

  const locales = ["zh", "en", "ja"];
  const staticPages = ["", "/privacy", "/terms"];

  const sitemap: MetadataRoute.Sitemap = [];

  // 添加首页和静态页面
  locales.forEach((locale) => {
    staticPages.forEach((page) => {
      const url = page === "" ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${page}`;
      const priority = page === "" ? 1.0 : page === "/privacy" ? 0.8 : 0.6;
      const changeFrequency = page === "" ? "daily" : "monthly";

      sitemap.push({
        url,
        lastModified: currentDate,
        changeFrequency: changeFrequency as "daily" | "weekly" | "monthly" | "yearly",
        priority,
      });
    });
  });

  // 添加应用页面（较低优先级，因为需要登录）
  locales.forEach((locale) => {
    const appPages = [
      "/app",
      "/app/dashboard",
      "/app/dashboard/resumes",
      "/app/dashboard/templates",
      "/app/dashboard/ai",
      "/app/dashboard/settings"
    ];

    appPages.forEach((page) => {
      sitemap.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    });
  });

  return sitemap;
}
