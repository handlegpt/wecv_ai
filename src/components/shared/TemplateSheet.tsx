"use client";
import { Layout, PanelsLeftBottom, FileText, Grid3X3, Calendar, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet-no-overlay";
import { cn } from "@/lib/utils";
import { DEFAULT_TEMPLATES } from "@/config";
import { useResumeStore } from "@/store/useResumeStore";

const templateIcons: { [key: string]: any } = {
  classic: FileText,
  modern: Grid3X3,
  "left-right": Layers,
  timeline: Calendar,
  card: Grid3X3
};

const TemplateSheet = () => {
  const t = useTranslations("templates");
  const { activeResume, setTemplate } = useResumeStore();
  const currentTemplate =
    DEFAULT_TEMPLATES.find((t) => t.id === activeResume?.templateId) ||
    DEFAULT_TEMPLATES[0];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <PanelsLeftBottom size={20} />
      </SheetTrigger>
      <SheetContent side="left" className="w-1/2 sm:max-w-1/2">
        <SheetHeader>
          <SheetTitle>{t("switchTemplate")}</SheetTitle>
        </SheetHeader>

        {/* 解决警告问题 */}
        <SheetDescription></SheetDescription>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {DEFAULT_TEMPLATES.map((template) => {
            const Icon = templateIcons[template.id] || FileText;
            return (
              <button
                key={template.id}
                onClick={() => setTemplate(template.id)}
                className={cn(
                  "relative group rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] p-4 h-32 flex flex-col items-center justify-center gap-2",
                  template.id === currentTemplate.id
                    ? "border-primary dark:border-primary shadow-lg dark:shadow-primary/30 bg-primary/5"
                    : "dark:border-neutral-800 dark:hover:border-neutral-700 border-gray-100 hover:border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
              >
                <Icon className={cn(
                  "w-8 h-8 transition-colors",
                  template.id === currentTemplate.id
                    ? "text-primary"
                    : "text-gray-600 dark:text-gray-400"
                )} />
                <span className={cn(
                  "text-sm font-medium text-center",
                  template.id === currentTemplate.id
                    ? "text-primary"
                    : "text-gray-700 dark:text-gray-300"
                )}>
                  {template.name}
                </span>
                {template.id === currentTemplate.id && (
                  <motion.div
                    layoutId="template-selected"
                    className="absolute inset-0 rounded-lg border-2 border-primary bg-primary/10"
                  />
                )}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TemplateSheet;
