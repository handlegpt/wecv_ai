"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { 
  Brain, 
  Shield, 
  Zap, 
  Globe, 
  Download, 
  FileText, 
  Sparkles,
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";
import AnimatedFeature from "./client/AnimatedFeature";

const features = [
  {
    id: "ai",
    icon: Brain,
    title: "features.ai.title",
    description: "features.ai.description",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
    items: [
      {
        title: "features.ai.item1",
        description: "features.ai.item1_description",
        icon: Sparkles,
      },
      {
        title: "features.ai.item2", 
        description: "features.ai.item2_description",
        icon: Zap,
      },
    ],
  },
  {
    id: "security",
    icon: Shield,
    title: "features.storage.title",
    description: "features.storage.description",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
    items: [
      {
        title: "features.storage.item1",
        description: "features.storage.item1_description",
        icon: Globe,
      },
      {
        title: "features.storage.item2",
        description: "features.storage.item2_description",
        icon: Download,
      },
    ],
  },
  {
    id: "export",
    icon: FileText,
    title: "features.export.title",
    description: "features.export.description",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
    items: [
      {
        title: "features.export.item1",
        description: "features.export.item1_description",
        icon: Download,
      },
      {
        title: "features.export.item2",
        description: "features.export.item2_description",
        icon: FileText,
      },
    ],
  },
] as const;

export default function FeaturesSection() {
  const t = useTranslations("home");
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  return (
    <section className="py-24 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 标题部分 */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            {t("features.badge")}
          </div>
          <h2 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
              {t("features.title")}
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t("features.subtitle")}
          </p>
        </div>

        {/* 特性网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <AnimatedFeature key={feature.id} delay={index * 0.1}>
                <div
                  className={`group relative p-8 rounded-3xl bg-gradient-to-br ${feature.bgColor} border border-white/20 dark:border-gray-700/20 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer`}
                  onMouseEnter={() => setHoveredFeature(feature.id)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  {/* 背景装饰 */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>
                  
                  {/* 图标 */}
                  <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* 内容 */}
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {t(feature.title)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      {t(feature.description)}
                    </p>
                    
                    {/* 特性列表 */}
                    <div className="space-y-3">
                      {feature.items.map((item, itemIndex) => {
                        const ItemIcon = item.icon;
                        return (
                          <div key={itemIndex} className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <ItemIcon className="w-3 h-3 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {t(item.title)}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {t(item.description)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* 悬停效果 */}
                  <div className={`absolute bottom-6 right-6 w-8 h-8 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0`}>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </AnimatedFeature>
            );
          })}
        </div>

      </div>
    </section>
  );
}