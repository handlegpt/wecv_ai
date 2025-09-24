"use client";

import { useTranslations } from "next-intl";
import { FileText, Edit, Download, CheckCircle, ArrowRight, Play } from "lucide-react";
import AnimatedFeature from "./client/AnimatedFeature";

const steps = [
  {
    icon: FileText,
    key: "step1",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
  },
  {
    icon: Edit,
    key: "step2",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
  },
  {
    icon: Download,
    key: "step3",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
  },
  {
    icon: CheckCircle,
    key: "step4",
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
  },
];

export default function HowToUseSection() {
  const t = useTranslations("home");

  return (
    <section id="how-to-use" className="py-20 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedFeature>
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 text-green-600 dark:text-green-400 text-sm font-medium mb-6">
              <Play className="w-4 h-4" />
              {t("howToUse.badge")}
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-green-900 to-blue-900 dark:from-white dark:via-green-100 dark:to-blue-100 bg-clip-text text-transparent">
                {t("howToUse.title")}
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t("howToUse.subtitle")}
            </p>
          </div>
        </AnimatedFeature>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <AnimatedFeature key={index} delay={index * 0.1}>
              <div className="group relative">
                {/* 连接线 */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700 z-0"></div>
                )}
                
                <div className={`relative p-8 rounded-3xl bg-gradient-to-br ${step.bgColor} border border-white/20 dark:border-gray-700/20 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl group-hover:z-10`}>
                  {/* 背景装饰 */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>
                  
                  {/* 步骤编号 */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 shadow-lg">
                    {index + 1}
                  </div>
                  
                  {/* 图标 */}
                  <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* 内容 */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {t(`howToUse.${step.key}.title`)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {t(`howToUse.${step.key}.description`)}
                    </p>
                  </div>
                  
                  {/* 悬停箭头 */}
                  <div className={`absolute bottom-6 right-6 w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0`}>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </AnimatedFeature>
          ))}
        </div>

      </div>
    </section>
  );
}