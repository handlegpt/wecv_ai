import React from "react";
import BaseInfo from "../preview/BaseInfo";
import ExperienceSection from "../preview/ExperienceSection";
import EducationSection from "../preview/EducationSection";
import SkillSection from "../preview/SkillPanel";
import CustomSection from "../preview/CustomSection";
import { ResumeData } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import ProjectSection from "../preview/ProjectSection";

interface CardTemplateProps {
  data: ResumeData;
  template: ResumeTemplate;
}

const CardTemplate: React.FC<CardTemplateProps> = ({
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
          <div className="bg-white dark:bg-neutral-800/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
            <BaseInfo basic={data.basic} globalSettings={data.globalSettings} />
          </div>
        );
      case "experience":
        return (
          <div className="bg-white dark:bg-neutral-800/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
            <ExperienceSection
              experiences={data.experience}
              globalSettings={data.globalSettings}
            />
          </div>
        );
      case "education":
        return (
          <div className="bg-white dark:bg-neutral-800/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
            <EducationSection
              education={data.education}
              globalSettings={data.globalSettings}
            />
          </div>
        );
      case "skills":
        return (
          <div className="bg-white dark:bg-neutral-800/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
            <SkillSection
              skill={data.skillContent}
              globalSettings={data.globalSettings}
            />
          </div>
        );
      case "projects":
        return (
          <div className="bg-white dark:bg-neutral-800/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
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
            <div className="bg-white dark:bg-neutral-800/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
              <CustomSection
                title={sectionTitle}
                key={sectionId}
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

  return (
    <div
      className="flex flex-col w-full min-h-screen gap-4 sm:gap-6 p-4 sm:p-6"
      style={{
        backgroundColor: colorScheme.background,
        color: colorScheme.text,
      }}
    >
      {sortedSections.map((section) => (
        <div key={section.id} className="w-full">
          {renderSection(section.id)}
        </div>
      ))}
    </div>
  );
};

export default CardTemplate; 