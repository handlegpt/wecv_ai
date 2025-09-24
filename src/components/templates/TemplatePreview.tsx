"use client";

import React, { useMemo } from "react";
import { useLocale } from "next-intl";
import { DEFAULT_TEMPLATES } from "@/config";
import { initialResumeState, initialResumeStateEn, initialResumeStateJa } from "@/config/initialResumeData";
import templates from "../templates";

interface TemplatePreviewProps {
  templateId: string;
  scale?: number;
  className?: string;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  templateId,
  scale = 0.4,
  className = "",
}) => {
  const locale = useLocale();
  
  // 获取模板配置
  const template = useMemo(() => {
    return (
      DEFAULT_TEMPLATES.find((t) => t.id === templateId) ||
      DEFAULT_TEMPLATES[0]
    );
  }, [templateId]);

  // 根据当前语言选择对应的初始数据
  const baseResumeData = useMemo(() => {
    switch (locale) {
      case 'zh':
        return initialResumeState;
      case 'ja':
        return initialResumeStateJa;
      case 'en':
      default:
        return initialResumeStateEn;
    }
  }, [locale]);

  // 创建示例简历数据
  const sampleResumeData = useMemo(() => {
    const baseData = { ...baseResumeData };
    const now = new Date().toISOString();
    
    // 根据模板ID调整数据
    if (templateId === "left-right") {
      return {
        ...baseData,
        id: `preview-${templateId}`,
        templateId,
        createdAt: now,
        updatedAt: now,
        globalSettings: {
          ...baseData.globalSettings,
          themeColor: template.colorScheme.primary,
          sectionSpacing: template.spacing.sectionGap,
          paragraphSpacing: template.spacing.itemGap,
          pagePadding: template.spacing.contentPadding,
        },
        basic: {
          ...baseData.basic,
          layout: template.basic.layout,
        },
      };
    }
    
    return {
      ...baseData,
      id: `preview-${templateId}`,
      templateId,
      createdAt: now,
      updatedAt: now,
      globalSettings: {
        ...baseData.globalSettings,
        themeColor: template.colorScheme.primary,
        sectionSpacing: template.spacing.sectionGap,
        paragraphSpacing: template.spacing.itemGap,
        pagePadding: template.spacing.contentPadding,
      },
      basic: {
        ...baseData.basic,
        layout: template.basic.layout,
      },
    };
  }, [templateId, template, baseResumeData]);

  // 获取模板组件
  const TemplateComponent = useMemo(() => {
    if (!template || !template.id) {
      return templates["classic"];
    }

    const Template = templates[template.id as keyof typeof templates] || templates["classic"];
    
    if (!Template) {
      return templates["classic"];
    }

    return Template;
  }, [template]);

  return (
    <div 
      className={`template-preview ${className}`}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
      }}
    >
      <div
        style={{
          padding: `${sampleResumeData.globalSettings?.pagePadding || 20}px`,
        }}
        className="relative bg-white"
      >
        <TemplateComponent 
          data={sampleResumeData} 
          template={template} 
        />
      </div>
    </div>
  );
};

export default TemplatePreview;
