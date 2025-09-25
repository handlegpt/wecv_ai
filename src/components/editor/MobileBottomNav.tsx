"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Rocket, 
  Zap, 
  Plus,
  Eye,
  EyeOff,
  Settings,
  Palette,
  Type,
  SpaceIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/store/useResumeStore";
import { MenuSection } from "@/types/resume";
import { useTranslations } from "next-intl";

interface MobileBottomNavProps {
  activeSection: string;
  setActiveSection: (id: string) => void;
  toggleSectionVisibility: (id: string) => void;
  updateMenuSections: (sections: MenuSection[]) => void;
  menuSections: MenuSection[];
  onSettingsClick: () => void;
}

const MobileBottomNav = ({
  activeSection,
  setActiveSection,
  toggleSectionVisibility,
  updateMenuSections,
  menuSections,
  onSettingsClick
}: MobileBottomNavProps) => {
  const [showSections, setShowSections] = useState(false);
  const t = useTranslations("workbench.sidePanel");

  const getSectionIcon = (sectionId: string) => {
    const iconMap: Record<string, any> = {
      basic: User,
      skills: Zap,
      experience: Briefcase,
      projects: Rocket,
      education: GraduationCap,
    };
    return iconMap[sectionId] || Plus;
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setShowSections(false);
  };

  const handleToggleVisibility = (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    toggleSectionVisibility(sectionId);
  };

  const handleDeleteSection = (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    const updatedSections = menuSections.filter(section => section.id !== sectionId);
    updateMenuSections(updatedSections);
    
    // 如果删除的是当前激活的部分，切换到第一个部分
    if (activeSection === sectionId && updatedSections.length > 0) {
      setActiveSection(updatedSections[0].id);
    }
  };

  return (
    <>
      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 shadow-lg">
          <div className="flex items-center justify-between px-4 py-2">
            {/* 左侧：当前激活的部分 */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSections(!showSections)}
                className="flex items-center gap-2 text-sm font-medium"
              >
                {(() => {
                  const activeSectionData = menuSections.find(s => s.id === activeSection);
                  const Icon = activeSectionData ? getSectionIcon(activeSectionData.id) : User;
                  return (
                    <>
                      <Icon className="w-4 h-4" />
                      <span>{activeSectionData?.title || "基本信息"}</span>
                    </>
                  );
                })()}
              </Button>
            </div>

            {/* 右侧：设置按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">{t("mobile.settings")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 部分选择面板 */}
      <AnimatePresence>
        {showSections && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          >
            <div className="bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 shadow-2xl max-h-[60vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{t("mobile.selectSection")}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSections(false)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-2">
                  {menuSections.map((section) => {
                    const Icon = getSectionIcon(section.id);
                    const isActive = activeSection === section.id;
                    
                    return (
                      <motion.div
                        key={section.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border transition-all",
                          isActive
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700"
                        )}
                        onClick={() => handleSectionClick(section.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{section.title}</span>
                          {!section.enabled && (
                            <Badge variant="secondary" className="text-xs">
                              {t("mobile.hidden")}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleToggleVisibility(e, section.id)}
                            className="p-1 h-8 w-8"
                          >
                            {section.enabled ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>

                          {section.id !== "basic" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDeleteSection(e, section.id)}
                              className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
                            >
                              <span className="text-sm">🗑️</span>
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* 添加自定义部分按钮 */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-neutral-600 hover:border-primary hover:bg-primary/5 transition-all"
                    onClick={() => {
                      // 这里可以添加创建自定义部分的逻辑
                      setShowSections(false);
                    }}
                  >
                    <div className="flex items-center gap-2 text-gray-600 dark:text-neutral-400">
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">{t("mobile.addCustomSection")}</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 遮罩层 */}
      <AnimatePresence>
        {showSections && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setShowSections(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileBottomNav;
