"use client";
import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Plus, Settings, AlertCircle, Upload, Calendar, Trash2, Edit3, Sparkles, FolderOpen, Cloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { getConfig, getFileHandle, verifyPermission } from "@/utils/fileSystem";
import { useResumeStore } from "@/store/useResumeStore";
import { initialResumeState } from "@/config/initialResumeData";

import { generateUUID } from "@/utils/uuid";
const ResumesList = () => {
  return <ResumeWorkbench />;
};

const ResumeWorkbench = () => {
  const t = useTranslations();
  const {
    resumes,
    setActiveResume,
    updateResume,
    updateResumeFromFile,
    addResume,
    deleteResume,
    createResume,
    fixAvatarSizes
  } = useResumeStore();
  const router = useRouter();
  const [hasConfiguredFolder, setHasConfiguredFolder] = React.useState(false);

  useEffect(() => {
    const syncResumesFromFiles = async () => {
      try {
        const handle = await getFileHandle("syncDirectory");
        if (!handle) return;

        const hasPermission = await verifyPermission(handle);
        if (!hasPermission) return;

        const dirHandle = handle as FileSystemDirectoryHandle;

        for await (const entry of (dirHandle as any).values()) {
          if (entry.kind === "file" && entry.name.endsWith(".json")) {
            try {
              const file = await entry.getFile();
              const content = await file.text();
              const resumeData = JSON.parse(content);
              updateResumeFromFile(resumeData);
            } catch (error) {
              // 跳过无法读取的文件
            }
          }
        }
      } catch (error) {
        // 文件同步失败，继续使用本地数据
      }
    };

    if (Object.keys(resumes).length === 0) {
      syncResumesFromFiles();
    }
  }, [resumes, updateResume, updateResumeFromFile]);

  useEffect(() => {
    const loadSavedConfig = async () => {
      try {
        const handle = await getFileHandle("syncDirectory");
        const path = await getConfig("syncDirectoryPath");
        if (handle && path) {
          setHasConfiguredFolder(true);
        }
      } catch (error) {
        // 配置加载失败，使用默认配置
      }
    };

    loadSavedConfig();
    
    // 修复现有简历中的头像尺寸问题
    fixAvatarSizes();
  }, [fixAvatarSizes]);

  const handleCreateResume = () => {
    const newId = createResume(null);
    setActiveResume(newId);
  };

  const handleImportJson = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const content = await file.text();
        const config = JSON.parse(content);

        const newResume = {
          ...initialResumeState,
          ...config,
          id: generateUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        addResume(newResume);
        toast.success(t("dashboard.resumes.importSuccess"));
      } catch (error) {
        toast.error(t("dashboard.resumes.importError"));
      }
    };

    input.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 max-w-7xl"
      >
        {/* Header Section */}
        <motion.div
          className="mb-8"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              {t("dashboard.resumes.myResume")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t("dashboard.resumes.subtitle")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={handleImportJson}
                variant="outline"
                size="lg"
                className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:bg-slate-800/80 dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-blue-950/50 transition-all duration-300"
              >
                <Upload className="mr-2 h-5 w-5" />
                {t("dashboard.resumes.import")}
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={handleCreateResume}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {t("dashboard.resumes.create")}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Status Alert */}
        <motion.div
          className="mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {hasConfiguredFolder ? (
            <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 shadow-lg">
              <AlertDescription className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-green-700 dark:text-green-400 font-medium">
                    {t("dashboard.resumes.synced")}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-4 hover:bg-green-100 dark:hover:bg-green-900 border-green-300 dark:border-green-700"
                  onClick={() => {
                    router.push("/dashboard/settings");
                  }}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  {t("dashboard.resumes.view")}
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800 shadow-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-amber-800 dark:text-amber-300">
                {t("dashboard.resumes.notice.title")}
              </AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span className="text-amber-700 dark:text-amber-400">
                  {t("dashboard.resumes.notice.description")}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4 hover:bg-amber-100 dark:hover:bg-amber-900 border-amber-300 dark:border-amber-700"
                  onClick={() => {
                    router.push("/dashboard/settings#auth");
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {t("dashboard.resumes.notice.goToSettings")}
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </motion.div>

        {/* Resume Grid */}
        <motion.div
          className="mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Create New Resume Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={handleCreateResume}
            >
              <Card className="group relative border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer h-[320px] transition-all duration-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 dark:hover:border-blue-500 shadow-lg hover:shadow-xl">
                <CardContent className="flex-1 pt-8 text-center flex flex-col items-center justify-center h-full">
                  <motion.div
                    className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 group-hover:from-blue-200 group-hover:to-purple-200 dark:group-hover:from-blue-800/40 dark:group-hover:to-purple-800/40 transition-all duration-300"
                    whileHover={{ rotate: 180, scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Plus className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t("dashboard.resumes.newResume")}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {t("dashboard.resumes.newResumeDescription")}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            {/* Existing Resume Cards */}
            <AnimatePresence>
              {Object.entries(resumes).map(([id, resume], index) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="group relative border border-gray-200 dark:border-gray-700 h-[320px] flex flex-col transition-all duration-300 hover:border-blue-300 hover:shadow-xl dark:hover:border-blue-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardContent className="relative flex-1 pt-6 text-center flex flex-col items-center">
                      
                      {/* Resume Title with Sync Status */}
                      <div className="flex items-center justify-center gap-2 mb-2 px-2">
                        <CardTitle className="text-lg font-semibold line-clamp-2 text-gray-900 dark:text-gray-100">
                          {resume.title || t("dashboard.resumes.untitled")}
                        </CardTitle>
                        {resume.isSynced && (
                          <Cloud className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                      
                      {/* Creation Date */}
                      <CardDescription className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardContent>
                    
                    {/* Action Buttons */}
                    <CardFooter className="pt-0 pb-4 px-4">
                      <div className="grid grid-cols-2 gap-3 w-full">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 17
                          }}
                        >
                          <Button
                            variant="outline"
                            className="w-full text-sm bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 dark:bg-blue-950/50 dark:hover:bg-blue-900/70 dark:border-blue-800 dark:hover:border-blue-700 dark:text-blue-300 dark:hover:text-blue-200 transition-all duration-200"
                            size="sm"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                if (!resumes[id]) {
                                  toast.error(t("dashboard.resumes.resumeNotFound"));
                                  return;
                                }
                                
                                setActiveResume(id);
                                await new Promise(resolve => setTimeout(resolve, 0));
                                router.push(`/workbench/${id}`);
                              } catch (error) {
                                toast.error(t("dashboard.resumes.navigationError"));
                              }
                            }}
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            {t("common.edit")}
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 17
                          }}
                        >
                          <Button
                            variant="outline"
                            className="w-full text-sm bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 text-red-700 hover:text-red-800 dark:bg-red-950/50 dark:hover:bg-red-900/70 dark:border-red-800 dark:hover:border-red-700 dark:text-red-300 dark:hover:text-red-200 transition-all duration-200"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteResume(resume);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {t("common.delete")}
                          </Button>
                        </motion.div>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResumesList;
