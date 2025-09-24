"use client";
import React, { useCallback } from "react";
import {
  Edit2,
  PanelRightClose,
  PanelRightOpen,
  SpellCheck2,
  Home,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Dock, DockIcon } from "@/components/magicui/dock";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TemplateSheet from "@/components/shared/TemplateSheet";
import { cn } from "@/lib/utils";
import { useGrammarCheck } from "@/hooks/useGrammarCheck";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { AI_MODEL_CONFIGS } from "@/config/ai";
import { useResumeStore } from "@/store/useResumeStore";

export type IconProps = React.HTMLAttributes<SVGElement>;

interface PreviewDockProps {
  sidePanelCollapsed: boolean;
  editPanelCollapsed: boolean;
  toggleSidePanel: () => void;
  toggleEditPanel: () => void;
  resumeContentRef: React.RefObject<HTMLDivElement>;
}

const PreviewDock = ({
  sidePanelCollapsed,
  editPanelCollapsed,
  toggleSidePanel,
  toggleEditPanel,
  resumeContentRef,
}: PreviewDockProps) => {
  const router = useRouter();
  const t = useTranslations("previewDock");
  const { checkGrammar, isChecking } = useGrammarCheck();
  const {
    selectedModel,
    doubaoApiKey,
    doubaoModelId,
    deepseekApiKey,
    deepseekModelId,
    openaiApiKey,
    openaiModelId,
    openaiApiEndpoint,
  } = useAIConfigStore();

  const handleGrammarCheck = useCallback(async () => {
    if (!resumeContentRef.current) return;
    const config = AI_MODEL_CONFIGS[selectedModel];
    const isConfigured =
        selectedModel === "doubao"
            ? doubaoApiKey && doubaoModelId
            : selectedModel === "openai"
                ? openaiApiKey && openaiModelId && openaiApiEndpoint
                : config.requiresModelId
                    ? deepseekApiKey && deepseekModelId
                    : deepseekApiKey;

    if (!isConfigured) {
      toast.error(
        <>
          <span>{t("grammarCheck.configurePrompt")}</span>
          <Button
            className="p-0 h-auto text-white"
            onClick={() => router.push("/dashboard/ai")}
          >
            {t("grammarCheck.configureButton")}
          </Button>
        </>
      );
      return;
    }

    try {
      const text = resumeContentRef.current.innerText;
      await checkGrammar(text);
    } catch (error) {
      toast.error(t("grammarCheck.errorToast"));
    }
  }, [
    resumeContentRef,
    selectedModel,
    doubaoApiKey,
    doubaoModelId,
    deepseekApiKey,
    deepseekModelId,
    openaiApiKey,
    openaiModelId,
    openaiApiEndpoint,
    checkGrammar,
    router,
    t,
  ]);

  const { duplicateResume, activeResumeId } = useResumeStore();

  const handleCopyResume = useCallback(() => {
    if (!activeResumeId) return;
    try {
      const newId = duplicateResume(activeResumeId);
      toast.success(t("copyResume.success"));
      router.push(`/app/workbench/${newId}`);
    } catch (error) {
      toast.error(t("copyResume.error"));
    }
  }, [activeResumeId, duplicateResume, router, t]);

  return (
    <div className="hidden md:block fixed top-1/2 right-3 transform -translate-y-1/2">
      <TooltipProvider delayDuration={0}>
        <Dock>
          <div className="flex flex-col gap-2">
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex cursor-pointer h-7 w-7 items-center justify-center rounded-lg",
                      "hover:bg-gray-100/50 dark:hover:bg-neutral-800/50"
                    )}
                  >
                    <TemplateSheet />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={10}>
                  <p>{t("switchTemplate")}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex cursor-pointer h-7 w-7 items-center justify-center rounded-lg",
                      "hover:bg-gray-100/50 dark:hover:bg-neutral-800/50",
                      "transition-all duration-200",
                      isChecking && "animate-pulse"
                    )}
                    onClick={handleGrammarCheck}
                  >
                    <SpellCheck2
                      className={cn("h-4 w-4", isChecking && "animate-spin")}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={10}>
                  <p>
                    {isChecking
                      ? t("grammarCheck.checking")
                      : t("grammarCheck.idle")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex cursor-pointer h-7 w-7 items-center justify-center rounded-lg",
                      "hover:bg-gray-100/50 dark:hover:bg-neutral-800/50"
                    )}
                    onClick={handleCopyResume}
                  >
                    <Copy className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={10}>
                  <p>{t("copyResume.tooltip")}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
            <div className="w-full h-[1px] bg-gray-200" />
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleSidePanel}
                    className={cn(
                      "flex h-[30px] w-[30px] items-center justify-center rounded-sm transition-all",
                      "hover:bg-gray-100/50 dark:hover:bg-neutral-800/50",
                      "active:scale-95",
                      !sidePanelCollapsed && [
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90 dark:hover:bg-primary/90",
                        "shadow-sm",
                      ]
                    )}
                  >
                    {sidePanelCollapsed && <PanelRightClose size={20} />}
                    {!sidePanelCollapsed && <PanelRightOpen size={20} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={10}>
                  <p>
                    {sidePanelCollapsed
                      ? t("sidePanel.expand")
                      : t("sidePanel.collapse")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleEditPanel}
                    className={cn(
                      "flex h-[30px] w-[30px] items-center justify-center rounded-sm transition-all",
                      "hover:bg-gray-100/50 dark:hover:bg-neutral-800/50",
                      "active:scale-95",
                      !editPanelCollapsed && [
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90 dark:hover:bg-primary/90",
                        "shadow-sm",
                      ]
                    )}
                  >
                    <Edit2 size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={10}>
                  {editPanelCollapsed
                    ? t("editPanel.expand")
                    : t("editPanel.collapse")}
                </TooltipContent>
              </Tooltip>
            </DockIcon>
            <div className="w-full h-[1px] bg-gray-200" />

            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex cursor-pointer h-7 w-7 items-center justify-center rounded-lg",
                      "hover:bg-gray-100/50 dark:hover:bg-neutral-800/50"
                    )}
                    onClick={() => router.push("/dashboard")}
                  >
                    <Home className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={10}>
                  <p>{t("backToDashboard")}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          </div>
        </Dock>
      </TooltipProvider>
    </div>
  );
};

export default PreviewDock;
