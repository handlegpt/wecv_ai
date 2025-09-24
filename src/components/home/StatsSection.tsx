"use client";

import { useTranslations } from "next-intl";
import { Users, FileText, Download, Star, TrendingUp, Award, Globe, Zap } from "lucide-react";
import AnimatedFeature from "./client/AnimatedFeature";

const stats = [
  {
    icon: Users,
    key: "users",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
  },
  {
    icon: FileText,
    key: "resumes",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
  },
  {
    icon: Download,
    key: "exports",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
  },
  {
    icon: Star,
    key: "rating",
    color: "from-yellow-500 to-orange-500",
    bgColor: "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
  },
];

export default function StatsSection() {
  const t = useTranslations("home");

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedFeature>
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              {t("stats.badge")}
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                {t("stats.title")}
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t("stats.subtitle")}
            </p>
          </div>
        </AnimatedFeature>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <AnimatedFeature key={index} delay={index * 0.1}>
              <div className={`group relative p-8 rounded-3xl bg-gradient-to-br ${stat.bgColor} border border-white/20 dark:border-gray-700/20 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl`}>
                {/* 背景装饰 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>
                
                {/* 图标 */}
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                
                {/* 数据 */}
                <div className="relative z-10">
                  <div className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-2">
                    {t(`stats.${stat.key}.value`)}
                  </div>
                  <div className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">
                    {t(`stats.${stat.key}.label`)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t(`stats.${stat.key}.description`)}
                  </div>
                </div>
                
                {/* 装饰性元素 */}
                <div className={`absolute top-4 right-4 w-3 h-3 rounded-full bg-gradient-to-r ${stat.color} opacity-60`}></div>
                <div className={`absolute bottom-4 left-4 w-2 h-2 rounded-full bg-gradient-to-r ${stat.color} opacity-40`}></div>
              </div>
            </AnimatedFeature>
          ))}
        </div>

        {/* 底部装饰 */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-xl">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{t("testimonials.professionalTemplates")}</span>
            </div>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{t("testimonials.beautifulDesigns")}</span>
            </div>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{t("testimonials.completelyFree")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 