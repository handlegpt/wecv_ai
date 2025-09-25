import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getFileHandle, verifyPermission } from "@/utils/fileSystem";

// 获取翻译后的"未命名模块"文本
const getUnnamedSectionText = (locale: string = "zh") => {
  switch (locale) {
    case "en":
      return "Untitled Section";
    case "ja":
      return "無題のセクション";
    case "zh":
    default:
      return "未命名模块";
  }
};

import {
  BasicInfo,
  Education,
  Experience,
  GlobalSettings,
  Project,
  CustomItem,
  ResumeData,
  MenuSection,
} from "../types/resume";
import { DEFAULT_TEMPLATES } from "@/config";
import {
  initialResumeState,
  initialResumeStateEn,
  initialResumeStateJa,
} from "@/config/initialResumeData";
import { generateUUID } from "@/utils/uuid";
interface ResumeStore {
  resumes: Record<string, ResumeData>;
  activeResumeId: string | null;
  activeResume: ResumeData | null;

  createResume: (templateId: string | null) => string;
  deleteResume: (resume: ResumeData) => void;
  duplicateResume: (resumeId: string) => string;
  updateResume: (resumeId: string, data: Partial<ResumeData>) => void;
  setActiveResume: (resumeId: string) => void;
  updateResumeFromFile: (resume: ResumeData) => void;

  updateResumeTitle: (title: string) => void;
  updateBasicInfo: (data: Partial<BasicInfo>) => void;
  updateEducation: (data: Education) => void;
  updateEducationBatch: (educations: Education[]) => void;
  deleteEducation: (id: string) => void;
  updateExperience: (data: Experience) => void;
  updateExperienceBatch: (experiences: Experience[]) => void;
  deleteExperience: (id: string) => void;
  updateProjects: (project: Project) => void;
  updateProjectsBatch: (projects: Project[]) => void;
  deleteProject: (id: string) => void;
  setDraggingProjectId: (id: string | null) => void;
  updateSkillContent: (skillContent: string) => void;
  reorderSections: (newOrder: ResumeData["menuSections"]) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  setActiveSection: (sectionId: string) => void;
  updateMenuSections: (sections: ResumeData["menuSections"]) => void;
  addCustomData: (sectionId: string) => void;
  updateCustomData: (sectionId: string, items: CustomItem[]) => void;
  removeCustomData: (sectionId: string) => void;
  addCustomItem: (sectionId: string) => void;
  updateCustomItem: (
    sectionId: string,
    itemId: string,
    updates: Partial<CustomItem>
  ) => void;
  removeCustomItem: (sectionId: string, itemId: string) => void;
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;
  setThemeColor: (color: string) => void;
  setTemplate: (templateId: string) => void;
  addResume: (resume: ResumeData) => string;
  fixAvatarSizes: () => void;
}

const VALID_TEMPLATE_IDS = DEFAULT_TEMPLATES.map(t => t.id);
const DEFAULT_TEMPLATE_ID = "classic";

// 同步简历到文件系统
const syncResumeToFile = async (
  resumeData: ResumeData,
  prevResume?: ResumeData
) => {
  try {
    const handle = await getFileHandle("syncDirectory");
    if (!handle) {
      // 静默处理，用户可能还没有配置同步文件夹
      return;
    }

    const hasPermission = await verifyPermission(handle);
    if (!hasPermission) {
      return;
    }

    const dirHandle = handle as FileSystemDirectoryHandle;

    if (
      prevResume &&
      prevResume.id === resumeData.id &&
      prevResume.title !== resumeData.title
    ) {
      try {
        await dirHandle.removeEntry(`${prevResume.title}.json`);
      } catch (error) {
        // 旧文件删除失败，继续处理
      }
    }

    const fileName = `${resumeData.title}.json`;
    const fileHandle = await dirHandle.getFileHandle(fileName, {
      create: true,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(resumeData, null, 2));
    await writable.close();
  } catch (error) {
    // 文件同步失败，继续使用内存数据
  }
};

export const useResumeStore = create(
  persist<ResumeStore>(
    (set, get) => ({
      resumes: {},
      activeResumeId: null,
      activeResume: null,

      createResume: (templateId = null) => {
        // 更可靠的语言检测方式
        let locale = "zh"; // 默认中文
        
        if (typeof window !== "undefined") {
          // 1. 检查 URL 路径
          const pathname = window.location.pathname;
          if (pathname.startsWith('/en')) {
            locale = "en";
          } else if (pathname.startsWith('/ja')) {
            locale = "ja";
          } else {
            // 2. 检查 cookie
            const cookieLocale = document.cookie
              .split("; ")
              .find((row) => row.startsWith("NEXT_LOCALE="))
              ?.split("=")[1];
            if (cookieLocale) {
              locale = cookieLocale;
            } else {
              // 3. 检查浏览器语言
              const browserLang = navigator.language.split('-')[0];
              if (browserLang === 'en' || browserLang === 'ja') {
                locale = browserLang;
              }
            }
          }
        }

        console.log("检测到的语言环境:", locale);

        const initialResumeData =
          locale === "en" 
            ? initialResumeStateEn 
            : locale === "ja" 
            ? initialResumeStateJa 
            : initialResumeState;

        const id = generateUUID();
        const template = templateId
          ? DEFAULT_TEMPLATES.find((t) => t.id === templateId)
          : DEFAULT_TEMPLATES[0];

        const newResume: ResumeData = {
          ...initialResumeData,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          templateId: template?.id,
          title: `${
            locale === "en" 
              ? "New Resume" 
              : locale === "ja" 
              ? "新しい履歴書" 
              : "新建简历"
          } ${id.slice(0, 6)}`,
        };

        set((state) => ({
          resumes: {
            ...state.resumes,
            [id]: newResume,
          },
          activeResumeId: id,
          activeResume: newResume,
        }));

        // 异步执行文件同步，不阻塞主流程
        (async () => {
          try {
            await syncResumeToFile(newResume);
          } catch (error) {
            // 新简历文件同步失败
          }
        })();

        return id;
      },

      updateResume: (resumeId, data) => {
        set((state) => {
          const resume = state.resumes[resumeId];
          if (!resume) return state;

          const updatedResume = {
            ...resume,
            ...data,
          };

          // 异步执行文件同步，不阻塞主流程
          (async () => {
            try {
              await syncResumeToFile(updatedResume, resume);
            } catch (error) {
              // 更新简历文件同步失败
            }
          })();

          return {
            resumes: {
              ...state.resumes,
              [resumeId]: updatedResume,
            },
            activeResume:
              state.activeResumeId === resumeId
                ? updatedResume
                : state.activeResume,
          };
        });
      },

      // 从文件更新，直接更新resumes
      updateResumeFromFile: (resume) => {
        // 自动修正templateId
        let fixedResume = { ...resume };
        if (!fixedResume.templateId || !VALID_TEMPLATE_IDS.includes(fixedResume.templateId)) {
          fixedResume.templateId = DEFAULT_TEMPLATE_ID;
        }
        set((state) => ({
          resumes: {
            ...state.resumes,
            [fixedResume.id]: fixedResume,
          },
        }));
      },

      updateResumeTitle: (title) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          get().updateResume(activeResumeId, { title });
        }
      },

      deleteResume: (resume) => {
        const resumeId = resume.id;
        set((state) => {
          const { [resumeId]: _, activeResume, ...rest } = state.resumes;
          return {
            resumes: rest,
            activeResumeId: null,
            activeResume: null,
          };
        });

        (async () => {
          try {
            const handle = await getFileHandle("syncDirectory");
            if (!handle) return;

            const hasPermission = await verifyPermission(handle);
            if (!hasPermission) return;

            const dirHandle = handle as FileSystemDirectoryHandle;
            try {
              await dirHandle.removeEntry(`${resume.title}.json`);
            } catch (error) {}
          } catch (error) {
            // 简历文件删除失败
          }
        })();
      },

      duplicateResume: (resumeId) => {
        const newId = generateUUID();
        const originalResume = get().resumes[resumeId];

        // 获取当前语言环境
        const locale =
          typeof document !== "undefined"
            ? document.cookie
                .split("; ")
                .find((row) => row.startsWith("NEXT_LOCALE="))
                ?.split("=")[1] || "zh"
            : "zh";

        const duplicatedResume = {
          ...originalResume,
          id: newId,
          title: `${originalResume.title} (${
            locale === "en" ? "Copy" : "复制"
          })`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          resumes: {
            ...state.resumes,
            [newId]: duplicatedResume,
          },
          activeResumeId: newId,
          activeResume: duplicatedResume,
        }));

        return newId;
      },

      setActiveResume: (resumeId) => {
        const resume = get().resumes[resumeId];
        if (resume) {
          set({ activeResume: resume, activeResumeId: resumeId });
        } else {
          // 如果resume不存在，清空activeResume状态
          set({ activeResume: null, activeResumeId: null });
        }
      },

      updateBasicInfo: (data) => {
        set((state) => {
          if (!state.activeResume) return state;

          const updatedResume = {
            ...state.activeResume,
            basic: {
              ...state.activeResume.basic,
              ...data,
            },
          };

          const newState = {
            resumes: {
              ...state.resumes,
              [state.activeResume.id]: updatedResume,
            },
            activeResume: updatedResume,
          };

          syncResumeToFile(updatedResume, state.activeResume);

          return newState;
        });
      },

      updateEducation: (education) => {
        const { activeResumeId, resumes } = get();
        if (!activeResumeId) return;

        const currentResume = resumes[activeResumeId];
        const newEducation = currentResume.education.some(
          (e) => e.id === education.id
        )
          ? currentResume.education.map((e) =>
              e.id === education.id ? education : e
            )
          : [...currentResume.education, education];

        get().updateResume(activeResumeId, { education: newEducation });
      },

      updateEducationBatch: (educations) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          get().updateResume(activeResumeId, { education: educations });
        }
      },

      deleteEducation: (id) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const resume = get().resumes[activeResumeId];
          const updatedEducation = resume.education.filter((e) => e.id !== id);
          get().updateResume(activeResumeId, { education: updatedEducation });
        }
      },

      updateExperience: (experience) => {
        const { activeResumeId, resumes } = get();
        if (!activeResumeId) return;

        const currentResume = resumes[activeResumeId];
        const newExperience = currentResume.experience.find(
          (e) => e.id === experience.id
        )
          ? currentResume.experience.map((e) =>
              e.id === experience.id ? experience : e
            )
          : [...currentResume.experience, experience];

        get().updateResume(activeResumeId, { experience: newExperience });
      },

      updateExperienceBatch: (experiences: Experience[]) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const updateData = { experience: experiences };
          get().updateResume(activeResumeId, updateData);
        }
      },
      deleteExperience: (id) => {
        const { activeResumeId, resumes } = get();
        if (!activeResumeId) return;

        const currentResume = resumes[activeResumeId];
        const updatedExperience = currentResume.experience.filter(
          (e) => e.id !== id
        );

        get().updateResume(activeResumeId, { experience: updatedExperience });
      },

      updateProjects: (project) => {
        const { activeResumeId, resumes } = get();
        if (!activeResumeId) return;
        const currentResume = resumes[activeResumeId];
        const newProjects = currentResume.projects.some(
          (p) => p.id === project.id
        )
          ? currentResume.projects.map((p) =>
              p.id === project.id ? project : p
            )
          : [...currentResume.projects, project];

        get().updateResume(activeResumeId, { projects: newProjects });
      },

      updateProjectsBatch: (projects: Project[]) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const updateData = { projects };
          get().updateResume(activeResumeId, updateData);
        }
      },

      deleteProject: (id) => {
        const { activeResumeId } = get();
        if (!activeResumeId) return;
        const currentResume = get().resumes[activeResumeId];
        const updatedProjects = currentResume.projects.filter(
          (p) => p.id !== id
        );
        get().updateResume(activeResumeId, { projects: updatedProjects });
      },

      setDraggingProjectId: (id: string | null) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          get().updateResume(activeResumeId, { draggingProjectId: id });
        }
      },

      updateSkillContent: (skillContent) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          get().updateResume(activeResumeId, { skillContent });
        }
      },

      reorderSections: (newOrder) => {
        const { activeResumeId, resumes } = get();
        if (activeResumeId) {
          const currentResume = resumes[activeResumeId];
          const basicInfoSection = currentResume.menuSections.find(
            (section) => section.id === "basic"
          );
          const reorderedSections = [
            basicInfoSection,
            ...newOrder.filter((section) => section.id !== "basic"),
          ].map((section, index) => ({
            ...section,
            order: index,
          }));
          get().updateResume(activeResumeId, {
            menuSections: reorderedSections as MenuSection[],
          });
        }
      },

      toggleSectionVisibility: (sectionId) => {
        const { activeResumeId, resumes } = get();
        if (activeResumeId) {
          const currentResume = resumes[activeResumeId];
          const updatedSections = currentResume.menuSections.map((section) =>
            section.id === sectionId
              ? { ...section, enabled: !section.enabled }
              : section
          );
          get().updateResume(activeResumeId, { menuSections: updatedSections });
        }
      },

      setActiveSection: (sectionId) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          get().updateResume(activeResumeId, { activeSection: sectionId });
        }
      },

      updateMenuSections: (sections) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          get().updateResume(activeResumeId, { menuSections: sections });
        }
      },

      addCustomData: (sectionId) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const currentResume = get().resumes[activeResumeId];
          const locale = typeof document !== "undefined"
            ? document.cookie
                .split("; ")
                .find((row) => row.startsWith("NEXT_LOCALE="))
                ?.split("=")[1] || "zh"
            : "zh";
          const updatedCustomData = {
            ...currentResume.customData,
            [sectionId]: [
              {
                id: generateUUID(),
                title: getUnnamedSectionText(locale),
                subtitle: "",
                dateRange: "",
                description: "",
                visible: true,
              },
            ],
          };
          get().updateResume(activeResumeId, { customData: updatedCustomData });
        }
      },

      updateCustomData: (sectionId, items) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const currentResume = get().resumes[activeResumeId];
          const updatedCustomData = {
            ...currentResume.customData,
            [sectionId]: items,
          };
          get().updateResume(activeResumeId, { customData: updatedCustomData });
        }
      },

      removeCustomData: (sectionId) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const currentResume = get().resumes[activeResumeId];
          const { [sectionId]: _, ...rest } = currentResume.customData;
          get().updateResume(activeResumeId, { customData: rest });
        }
      },

      addCustomItem: (sectionId) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const currentResume = get().resumes[activeResumeId];
          const locale = typeof document !== "undefined"
            ? document.cookie
                .split("; ")
                .find((row) => row.startsWith("NEXT_LOCALE="))
                ?.split("=")[1] || "zh"
            : "zh";
          const updatedCustomData = {
            ...currentResume.customData,
            [sectionId]: [
              ...(currentResume.customData[sectionId] || []),
              {
                id: generateUUID(),
                title: getUnnamedSectionText(locale),
                subtitle: "",
                dateRange: "",
                description: "",
                visible: true,
              },
            ],
          };
          get().updateResume(activeResumeId, { customData: updatedCustomData });
        }
      },

      updateCustomItem: (sectionId, itemId, updates) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const currentResume = get().resumes[activeResumeId];
          const updatedCustomData = {
            ...currentResume.customData,
            [sectionId]: currentResume.customData[sectionId].map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
          };
          get().updateResume(activeResumeId, { customData: updatedCustomData });
        }
      },

      removeCustomItem: (sectionId, itemId) => {
        const { activeResumeId } = get();
        if (activeResumeId) {
          const currentResume = get().resumes[activeResumeId];
          const updatedCustomData = {
            ...currentResume.customData,
            [sectionId]: currentResume.customData[sectionId].filter(
              (item) => item.id !== itemId
            ),
          };
          get().updateResume(activeResumeId, { customData: updatedCustomData });
        }
      },

      updateGlobalSettings: (settings: Partial<GlobalSettings>) => {
        const { activeResumeId, updateResume, activeResume } = get();
        if (activeResumeId) {
          updateResume(activeResumeId, {
            globalSettings: {
              ...activeResume?.globalSettings,
              ...settings,
            },
          });
        }
      },

      setThemeColor: (color) => {
        const { activeResumeId, updateResume } = get();
        if (activeResumeId) {
          updateResume(activeResumeId, {
            globalSettings: {
              ...get().activeResume?.globalSettings,
              themeColor: color,
            },
          });
        }
      },

      setTemplate: (templateId) => {
        const { activeResumeId, resumes } = get();
        if (!activeResumeId) return;

        const template = DEFAULT_TEMPLATES.find((t) => t.id === templateId);
        if (!template) return;

        const updatedResume = {
          ...resumes[activeResumeId],
          templateId,
          globalSettings: {
            ...resumes[activeResumeId].globalSettings,
            themeColor: template.colorScheme.primary,
            sectionSpacing: template.spacing.sectionGap,
            paragraphSpacing: template.spacing.itemGap,
            pagePadding: template.spacing.contentPadding,
          },
          basic: {
            ...resumes[activeResumeId].basic,
            layout: template.basic.layout,
          },
        };

        set({
          resumes: {
            ...resumes,
            [activeResumeId]: updatedResume,
          },
          activeResume: updatedResume,
        });
      },
      addResume: (resume: ResumeData) => {
        // 自动修正templateId
        let fixedResume = { ...resume };
        if (!fixedResume.templateId || !VALID_TEMPLATE_IDS.includes(fixedResume.templateId)) {
          fixedResume.templateId = DEFAULT_TEMPLATE_ID;
        }
        set((state) => ({
          resumes: {
            ...state.resumes,
            [fixedResume.id]: fixedResume,
          },
          activeResumeId: fixedResume.id,
          activeResume: fixedResume,
        }));

        syncResumeToFile(fixedResume);
        return fixedResume.id;
      },

      // 修复头像尺寸过大的问题
      fixAvatarSizes: () => {
        const updatedResumes = { ...get().resumes };
        let hasChanges = false;

        Object.values(updatedResumes).forEach((resume) => {
          if (resume.basic?.photoConfig) {
            const { width, height } = resume.basic.photoConfig;
            if (width > 120 || height > 120) {
              resume.basic.photoConfig.width = Math.min(width, 120);
              resume.basic.photoConfig.height = Math.min(height, 120);
              hasChanges = true;
            }
          }
        });

        if (hasChanges) {
          set({ resumes: updatedResumes });
          // 同步修复后的数据到文件
          Object.values(updatedResumes).forEach((resume) => {
            syncResumeToFile(resume);
          });
        }
      },
    }),
    {
      name: "resume-storage",
    }
  )
);
