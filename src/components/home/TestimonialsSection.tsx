"use client";

import { useTranslations } from "next-intl";
import { Star, Quote, Heart, ThumbsUp, Award } from "lucide-react";
import AnimatedFeature from "./client/AnimatedFeature";

const testimonials = [
  {
    key: "user1",
    avatar: "👨‍💻",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
  },
  {
    key: "user2",
    avatar: "👩‍💼",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
  },
  {
    key: "user3",
    avatar: "🎨",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
  },
];

export default function TestimonialsSection() {
  const t = useTranslations("home");

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedFeature>
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-600 dark:text-yellow-400 text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              {t("testimonials.badge")}
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-yellow-900 to-orange-900 dark:from-white dark:via-yellow-100 dark:to-orange-100 bg-clip-text text-transparent">
                {t("testimonials.title")}
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t("testimonials.subtitle")}
            </p>
          </div>
        </AnimatedFeature>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedFeature key={index} delay={index * 0.1}>
              <div className={`group relative p-8 rounded-3xl bg-gradient-to-br ${testimonial.bgColor} border border-white/20 dark:border-gray-700/20 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl`}>
                {/* 背景装饰 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>
                
                {/* 引用图标 */}
                <div className={`absolute top-6 right-6 w-8 h-8 rounded-full bg-gradient-to-r ${testimonial.color} flex items-center justify-center opacity-20`}>
                  <Quote className="w-4 h-4 text-white" />
                </div>
                
                {/* 用户信息 */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-lg">
                      {t(`testimonials.${testimonial.key}.name`)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t(`testimonials.${testimonial.key}.role`)}
                    </div>
                  </div>
                </div>
                
                {/* 评分 */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* 评价内容 */}
                <div className="relative z-10">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    &ldquo;{t(`testimonials.${testimonial.key}.content`)}&rdquo;
                  </p>
                  
                  {/* 底部装饰 */}
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${testimonial.color} text-white text-xs font-medium`}>
                      <ThumbsUp className="w-3 h-3" />
                      {t("testimonials.recommended")}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t(`testimonials.${testimonial.key}.date`)}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedFeature>
          ))}
        </div>

        {/* 底部统计 */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-8 px-8 py-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">4.9/5</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t("testimonials.averageRating")}</div>
              </div>
            </div>
            
            <div className="w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">98%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t("testimonials.userSatisfaction")}</div>
              </div>
            </div>
            
            <div className="w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t("testimonials.title")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}