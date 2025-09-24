"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Coffee, Sparkles, Star, Gift } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollBackground from "./client/ScrollBackground";
import AnimatedFeature from "./client/AnimatedFeature";

export default function CTASection() {
  const t = useTranslations("home");

  return (
    <section className="py-32 bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 relative overflow-hidden">
      <ScrollBackground />
      
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedFeature>
          <div className="text-center">
            {/* 徽章 */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-xl mb-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("cta.badge")}
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            {/* 主标题 */}
            <h2 className="text-5xl lg:text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                {t("cta.mainTitle")}
              </span>
            </h2>
            
            {/* 副标题 */}
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              {t("cta.mainDescription")}
            </p>

            {/* 按钮组 */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="https://buymeacoffee.com/wego" target="_blank" rel="noopener noreferrer">
                <Button
                  type="submit"
                  size="lg"
                  variant="outline"
                  className="group border-2 border-gray-300 dark:border-gray-600 hover:border-yellow-500 dark:hover:border-yellow-400 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-12 py-6 text-xl font-bold transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center gap-4">
                    <Coffee className="w-6 h-6" />
                    {t("cta.button")}
                  </span>
                </Button>
              </Link>
            </div>

          </div>
        </AnimatedFeature>
      </div>
    </section>
  );
}