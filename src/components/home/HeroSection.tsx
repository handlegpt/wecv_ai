"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Star, 
  Zap, 
  Shield, 
  Globe,
  Play,
  Award,
  TrendingUp,
  FileText,
  Brain,
  Download,
  Rocket,
  Heart
} from "lucide-react";
import ScrollBackground from "./client/ScrollBackground";
import AnimatedFeature from "./client/AnimatedFeature";
import GoDashboard from "./GoDashboard";

export default function HeroSection() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/30 pt-20">
      {/* 增强的动态背景 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 主要背景装饰 */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/25 to-purple-600/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-400/25 to-cyan-600/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-yellow-400/15 to-orange-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* 额外的装饰元素 */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-bl from-green-400/20 to-blue-500/20 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-500/20 rounded-full blur-2xl animate-pulse delay-300"></div>
        
        {/* 浮动粒子效果 */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400/30 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/40 rounded-full animate-bounce delay-2000"></div>
        <div className="absolute bottom-32 left-40 w-5 h-5 bg-pink-400/30 rounded-full animate-bounce delay-3000"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-cyan-400/50 rounded-full animate-bounce delay-4000"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <AnimatedFeature>
            {/* 增强的徽章 */}
            <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-2xl mb-8 hover:shadow-3xl transition-all duration-500 transform hover:scale-105">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-bold text-gray-900 dark:text-white">
                {t("hero.badge")}
              </span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
            </div>
            
            {/* 重新设计的主标题 */}
            <h1 className="text-4xl lg:text-6xl xl:text-7xl font-black leading-[0.9] mb-6">
              <span className="block bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent drop-shadow-2xl">
                {t("hero.title")}
              </span>
            </h1>
            
            {/* 增强的副标题 */}
            <p className="text-lg lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed font-light max-w-3xl mx-auto drop-shadow-lg">
              {t("hero.subtitle")}
            </p>
            
            {/* 重新设计的特性亮点 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14 max-w-4xl mx-auto">
              <div className="group flex items-center gap-4 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t("hero.feature1")}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t("hero.feature1_desc")}</div>
                </div>
              </div>
              
              <div className="group flex items-center gap-4 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t("hero.feature2")}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t("hero.feature2_desc")}</div>
                </div>
              </div>
              
              <div className="group flex items-center gap-4 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t("hero.feature3")}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t("hero.feature3_desc")}</div>
                </div>
              </div>
            </div>

            {/* 增强的按钮组 */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <GoDashboard>
                <Button
                  type="submit"
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-2xl px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 transform hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    <Rocket className="w-6 h-6" />
                    {t("hero.cta")}
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Button>
              </GoDashboard>

              <GoDashboard type="templates">
                <Button
                  type="submit"
                  size="lg"
                  variant="outline"
                  className="group border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl px-12 py-6 text-xl font-bold transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  <span className="flex items-center gap-4">
                    <FileText className="w-6 h-6" />
                    {t("hero.secondary")}
                  </span>
                </Button>
              </GoDashboard>
            </div>

            {/* 重新设计的统计数据 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-4xl mx-auto">
              <div className="group text-center p-8 rounded-3xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{t("stats.users.value")}</div>
                <div className="text-xl font-bold text-gray-700 dark:text-gray-200">{t("stats.users.label")}</div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t("stats.users.description")}</span>
                </div>
              </div>
              <div className="group text-center p-8 rounded-3xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-300">{t("stats.rating.value")}</div>
                <div className="text-xl font-bold text-gray-700 dark:text-gray-200">{t("stats.rating.label")}</div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t("stats.rating.description")}</span>
                </div>
              </div>
              <div className="group text-center p-8 rounded-3xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                <div className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">100%</div>
                <div className="text-xl font-bold text-gray-700 dark:text-gray-200">{t("testimonials.freeToUse")}</div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Heart className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t("testimonials.completelyFree")}</span>
                </div>
              </div>
            </div>
          </AnimatedFeature>
        </div>
      </div>
    </section>
  );
}
