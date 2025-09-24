"use client";
import React, { useState } from "react";
import NextImage from "next/image";
import { Settings2, Image, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PhotoConfigDrawer from "./PhotoConfigDrawer";
import { useResumeStore } from "@/store/useResumeStore";
import { BasicInfo, PhotoConfig } from "@/types/resume";
import { useTranslations } from "next-intl";

interface Props {
  className?: string;
}

const PhotoSelector: React.FC<Props> = ({ className }) => {
  const t = useTranslations("workbench");
  const [showConfig, setShowConfig] = useState(false);
  const { updateBasicInfo, activeResume } = useResumeStore();
  const { basic = {} as BasicInfo } = activeResume || {};
  const handlePhotoChange = (
    photo: string | undefined,
    config?: PhotoConfig
  ) => {
    updateBasicInfo({
      ...basic,
      photo,
      photoConfig: config,
    });
  };

  const handleConfigChange = (config: PhotoConfig) => {
    updateBasicInfo({
      ...basic,
      photoConfig: config,
    });
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4" aria-label="Photo icon" />
          <span className="text-sm font-medium">{t("basicPanel.avatar")}</span>
        </div>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={() => setShowConfig(true)}
          >
            <Settings2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={() => {
              updateBasicInfo({
                ...basic,
                photoConfig: {
                  ...basic.photoConfig,
                  visible: !(basic.photoConfig?.visible ?? true),
                },
              });
            }}
          >
            {basic.photoConfig?.visible !== false ? (
              <Eye className="w-4 h-4 text-primary" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="mt-2 relative overflow-hidden">
        {basic.photo && (
          <NextImage
            src={basic.photo}
            alt="Selected photo"
            width={48}
            height={48}
            className="object-cover rounded"
          />
        )}
      </div>

      <PhotoConfigDrawer
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        photo={basic.photo}
        config={basic.photoConfig}
        onPhotoChange={handlePhotoChange}
        onConfigChange={handleConfigChange}
      />
    </div>
  );
};

export default PhotoSelector;
