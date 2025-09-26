"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Mail, Github, Twitter, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const t = useTranslations("home");
  const [email, setEmail] = useState("");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "zh";

  useEffect(() => {
    // 动态生成邮箱地址
    const name = "hello";
    const domain = "wecv.com";
    const fullEmail = `${name}@${domain}`;
    setEmail(fullEmail);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-t border-gray-200/50 dark:border-gray-700/50">
      {/* 回到顶部按钮 */}
      <button
        onClick={scrollToTop}
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo 和描述 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <div>
                <div className="font-black text-xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  WeCV
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  AI Resume Builder
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm hover:shadow-md"
              >
                <Github className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </a>
              <a
                href="https://x.com/wecvai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm hover:shadow-md"
              >
                <Twitter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </a>
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm hover:shadow-md"
                >
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </a>
              )}
            </div>
          </div>

          {/* 产品链接 */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t("footer.product")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/privacy`} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* 支持链接 */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t("footer.support")}</h3>
            <ul className="space-y-3">
              <li>
                <a href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t("footer.termsOfService")}
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {t("footer.contactUs")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 底部版权信息 */}
        <div className="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>{t("footer.copyright")}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span>Made by WeCV AI</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 italic">not backed by Y Combinator</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}