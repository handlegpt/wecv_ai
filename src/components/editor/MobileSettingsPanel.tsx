"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Palette, 
  Type, 
  SpaceIcon, 
  Zap,
  X,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResumeStore } from "@/store/useResumeStore";
import { useTranslations } from "next-intl";
import { THEME_COLORS } from "@/types/resume";

interface MobileSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSettingsPanel = ({ isOpen, onClose }: MobileSettingsPanelProps) => {
  const {
    activeResume,
    updateGlobalSettings,
    setThemeColor,
  } = useResumeStore();
  
  const t = useTranslations("workbench.sidePanel");
  
  const { globalSettings = {} } = activeResume || {};
  const { themeColor = THEME_COLORS[0] } = globalSettings;

  const fontOptions = [
    { value: "sans", label: t("typography.font.sans") },
    { value: "serif", label: t("typography.font.serif") },
    { value: "mono", label: t("typography.font.mono") },
  ];

  const lineHeightOptions = [
    { value: "normal", label: t("typography.lineHeight.normal") },
    { value: "relaxed", label: t("typography.lineHeight.relaxed") },
    { value: "loose", label: t("typography.lineHeight.loose") },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
          <div className="bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">{t("mobile.settings")}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* 主题色设置 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <Label className="text-base font-medium">{t("theme.title")}</Label>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-3">
                    {THEME_COLORS.map((presetTheme) => (
                      <button
                        key={presetTheme}
                        className={cn(
                          "relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200",
                          themeColor === presetTheme
                            ? "border-black dark:border-white"
                            : "dark:border-neutral-800 dark:hover:border-neutral-700 border-gray-100 hover:border-gray-200"
                        )}
                        onClick={() => setThemeColor(presetTheme)}
                      >
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: presetTheme }}
                        />
                        {themeColor === presetTheme && (
                          <motion.div
                            layoutId="theme-selected"
                            className="absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-white/20"
                            initial={false}
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          >
                            <div className="w-2 h-2 rounded-full bg-white dark:bg-black" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("theme.custom")}
                    </span>
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer overflow-hidden hover:scale-105 transition-transform"
                    />
                  </div>
                </div>

                {/* 排版设置 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    <Label className="text-base font-medium">{t("typography.title")}</Label>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600 dark:text-gray-400">
                        {t("typography.lineHeight.title")}
                      </Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[globalSettings?.lineHeight || 1.5]}
                          min={1}
                          max={2}
                          step={0.1}
                          onValueChange={([value]) =>
                            updateGlobalSettings?.({ lineHeight: value })
                          }
                          className="flex-1"
                        />
                        <span className="min-w-[3ch] text-sm text-gray-600 dark:text-gray-400">
                          {globalSettings?.lineHeight || 1.5}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600 dark:text-gray-400">
                        {t("typography.baseFontSize.title")}
                      </Label>
                      <Select
                        value={globalSettings?.baseFontSize?.toString() || "14"}
                        onValueChange={(value) =>
                          updateGlobalSettings?.({ baseFontSize: parseInt(value) })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[12, 13, 14, 15, 16, 18, 20, 24].map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size}px
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 间距设置 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <SpaceIcon className="w-4 h-4" />
                    <Label className="text-base font-medium">{t("spacing.title")}</Label>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600 dark:text-gray-400">
                        {t("spacing.pagePadding.title")}
                      </Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[globalSettings?.pagePadding || 0]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={([value]) =>
                            updateGlobalSettings?.({ pagePadding: value })
                          }
                          className="flex-1"
                        />
                        <div className="flex items-center">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={globalSettings?.pagePadding || 0}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const value = Number(e.target.value);
                              if (!isNaN(value) && value >= 0 && value <= 100) {
                                updateGlobalSettings?.({ pagePadding: value });
                              }
                            }}
                            className="w-16 h-8 text-center text-sm"
                          />
                          <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                            px
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600 dark:text-gray-400">
                        {t("spacing.sectionSpacing.title")}
                      </Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[globalSettings?.sectionSpacing || 0]}
                          min={1}
                          max={100}
                          step={1}
                          onValueChange={([value]) =>
                            updateGlobalSettings?.({ sectionSpacing: value })
                          }
                          className="flex-1"
                        />
                        <div className="flex items-center">
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            step={1}
                            value={globalSettings?.sectionSpacing || 0}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const value = Number(e.target.value);
                              if (!isNaN(value) && value >= 1 && value <= 100) {
                                updateGlobalSettings?.({ sectionSpacing: value });
                              }
                            }}
                            className="w-16 h-8 text-center text-sm"
                          />
                          <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                            px
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 模式设置 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <Label className="text-base font-medium">{t("mode.title")}</Label>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">
                          {t("mode.useIconMode.title")}
                        </Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          使用图标模式显示内容
                        </p>
                      </div>
                      <Switch
                        checked={globalSettings.useIconMode || false}
                        onCheckedChange={(checked) =>
                          updateGlobalSettings({
                            useIconMode: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">
                          {t("mode.centerSubtitle.title")}
                        </Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          居中显示副标题
                        </p>
                      </div>
                      <Switch
                        checked={globalSettings.centerSubtitle || false}
                        onCheckedChange={(checked) =>
                          updateGlobalSettings({
                            centerSubtitle: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileSettingsPanel;
