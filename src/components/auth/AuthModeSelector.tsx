"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Cloud, 
  Smartphone, 
  ArrowRight,
  Check,
  Users,
  Lock,
  RefreshCw
} from "lucide-react";

interface AuthModeSelectorProps {
  onSelectMode: (mode: 'local' | 'login' | 'register') => void;
}

export default function AuthModeSelector({ onSelectMode }: AuthModeSelectorProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  
  const modes = [
    {
      id: 'local',
      title: t("modes.local.title"),
      description: t("modes.local.description"),
      icon: Shield,
      features: [
        t("modes.local.features.privacy"),
        t("modes.local.features.offline"),
        t("modes.local.features.noAccount"),
        t("modes.local.features.instant")
      ],
      badge: t("modes.local.badge"),
      color: "bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800",
      iconColor: "text-green-600 dark:text-green-400",
      buttonText: t("modes.local.button"),
      recommended: true
    },
    {
      id: 'cloud',
      title: t("modes.cloud.title"),
      description: t("modes.cloud.description"),
      icon: Cloud,
      features: [
        t("modes.cloud.features.sync"),
        t("modes.cloud.features.backup"),
        t("modes.cloud.features.collaboration"),
        t("modes.cloud.features.access")
      ],
      badge: t("modes.cloud.badge"),
      color: "bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400",
      buttonText: t("modes.cloud.button"),
      recommended: false
    }
  ];
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t("welcome.title")}</h1>
        <p className="text-muted-foreground text-lg">{t("welcome.description")}</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Card key={mode.id} className={`relative ${mode.color} border-2`}>
              {mode.recommended && (
                <Badge className="absolute -top-2 left-4 bg-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  {t("modes.recommended")}
                </Badge>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${mode.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{mode.title}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {mode.badge}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-base">
                  {mode.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {mode.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-4">
                  {mode.id === 'local' ? (
                    <Button
                      onClick={() => router.push("/app/dashboard")}
                      className="w-full"
                      size="lg"
                    >
                      {mode.buttonText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={() => onSelectMode('login')}
                        className="w-full"
                        size="lg"
                        variant="outline"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        {t("modes.cloud.login")}
                      </Button>
                      <Button
                        onClick={() => onSelectMode('register')}
                        className="w-full"
                        size="lg"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        {t("modes.cloud.register")}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t("welcome.note")}
        </p>
      </div>
    </div>
  );
}
