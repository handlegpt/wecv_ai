"use client";
import { useResumeStore } from "@/store/useResumeStore";
import { cn } from "@/lib/utils";
import Field from "../Field";
import { useTranslations } from "next-intl";

const SkillPanel = () => {
  const { activeResume, updateSkillContent } = useResumeStore();
  const { skillContent = "" } = activeResume || {};
  const t = useTranslations("workbench.skillPanel");

  const handleChange = (value: string) => {
    updateSkillContent(value);
  };

  return (
    <div
      className={cn(
        "space-y-4 px-4 py-4 rounded-lg",
        "bg-white dark:bg-neutral-900/30"
      )}
    >
      <Field
        value={skillContent}
        onChange={handleChange}
        type="editor"
        placeholder={t("placeholder")}
      />
    </div>
  );
};

export default SkillPanel;
