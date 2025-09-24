"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { FileText, Menu, Moon, Sun, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import Logo from "@/components/shared/Logo";
import ThemeToggle from "@/components/shared/ThemeToggle";
import LanguageSwitch from "@/components/shared/LanguageSwitch";
import ScrollHeader from "./client/ScrollHeader";
import MobileMenu from "./client/MobileMenu";
import GoDashboard from "./GoDashboard";

export default function LandingHeader() {
  const t = useTranslations("home");
  const pathname = usePathname();
  const locale = pathname.split("/")[1]; // 从路径中获取语言代码
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <ScrollHeader>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo 区域 */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.assign(`/${locale}/`);
                }
              }}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M8 4V2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M8 8h8M8 12h6M8 16h4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <circle cx="18" cy="6" r="2" fill="currentColor" opacity="0.8"/>
                    <circle cx="18" cy="6" r="1" fill="white"/>
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  {t("header.title")}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  AI Resume Builder
                </span>
              </div>
            </div>

            {/* 导航菜单 */}
            <div className="hidden md:flex items-center gap-8">
                     <nav className="flex items-center gap-6">
                       <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                         {t("header.features")}
                       </a>
                       <a href="#how-to-use" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                         {t("header.guide")}
                       </a>
                       <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                         {t("header.testimonials")}
                       </a>
                     </nav>

              <div className="flex items-center gap-3">
                <LanguageSwitch />
                <ThemeToggle>
                  <div className="w-10 h-10 relative cursor-pointer rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md">
                    <Sun className="h-5 w-5 absolute inset-0 m-auto rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-600 dark:text-gray-300" />
                    <Moon className="h-5 w-5 absolute inset-0 m-auto rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-600 dark:text-gray-300" />
                  </div>
                </ThemeToggle>

                <GoDashboard>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-10 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {t("header.startButton")}
                  </Button>
                </GoDashboard>
              </div>
            </div>

            {/* 移动端菜单按钮 */}
            <button
              className="md:hidden w-10 h-10 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </ScrollHeader>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        buttonText={t("header.startButton")}
      />
    </>
  );
}
