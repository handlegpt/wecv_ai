import React from "react";
import BaseInfo from "../preview/BaseInfo";
import ExperienceSection from "../preview/ExperienceSection";
import EducationSection from "../preview/EducationSection";
import SkillSection from "../preview/SkillPanel";
import CustomSection from "../preview/CustomSection";
import { ResumeData } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import ProjectSection from "../preview/ProjectSection";

interface ResponsiveTemplateProps {
  data: ResumeData;
  template: ResumeTemplate;
}

const ResponsiveTemplate: React.FC<ResponsiveTemplateProps> = ({
  data,
  template,
}) => {
  const { colorScheme } = template;
  const enabledSections = data.menuSections.filter(
    (section) => section.enabled
  );
  const sortedSections = [...enabledSections].sort((a, b) => a.order - b.order);

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "basic":
        return (
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-neutral-700">
            <BaseInfo basic={data.basic} globalSettings={data.globalSettings} template={template} />
          </div>
        );
      case "experience":
        return (
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-neutral-700">
            <ExperienceSection
              experiences={data.experience}
              globalSettings={data.globalSettings}
            />
          </div>
        );
      case "education":
        return (
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-neutral-700">
            <EducationSection
              education={data.education}
              globalSettings={data.globalSettings}
            />
          </div>
        );
      case "skills":
        return (
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-neutral-700">
            <SkillSection
              skill={data.skillContent}
              globalSettings={data.globalSettings}
            />
          </div>
        );
      case "projects":
        return (
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-neutral-700">
            <ProjectSection
              projects={data.projects}
              globalSettings={data.globalSettings}
            />
          </div>
        );
      default:
        if (sectionId in data.customData) {
          const sectionTitle = data.menuSections.find(s => s.id === sectionId)?.title || sectionId;
          return (
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-neutral-700">
              <CustomSection
                title={sectionTitle}
                sectionId={sectionId}
                items={data.customData[sectionId]}
                globalSettings={data.globalSettings}
              />
            </div>
          );
        }
        return null;
    }
  };

  const basicSection = sortedSections.find((section) => section.id === "basic");
  const otherSections = sortedSections.filter(
    (section) => section.id !== "basic"
  );

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 w-full gap-6">
      {/* 基本信息区域 - 移动端顶部，桌面端左侧 */}
      <div className="lg:col-span-1">
        {basicSection && (
          <div className="sticky lg:top-6">
            {renderSection(basicSection.id)}
          </div>
        )}
      </div>

      {/* 其他内容区域 - 移动端底部，桌面端右侧 */}
      <div className="lg:col-span-2 space-y-6">
        {otherSections.map((section) => (
          <div key={section.id}>
            {renderSection(section.id)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponsiveTemplate; 