"use client";
import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Download,
  Loader2,
  FileJson,
  Printer,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getOptimizedStyles = () => {
  const styleCache = new Map();
  const startTime = performance.now();

  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .filter((rule) => {
            const ruleText = rule.cssText;
            if (styleCache.has(ruleText)) return false;
            styleCache.set(ruleText, true);

            if (rule instanceof CSSFontFaceRule) return false;
            if (ruleText.includes("font-family")) return false;
            if (ruleText.includes("@keyframes")) return false;
            if (ruleText.includes("animation")) return false;
            if (ruleText.includes("transition")) return false;
            if (ruleText.includes("hover")) return false;
            return true;
          })
          .map((rule) => rule.cssText)
          .join("\n");
      } catch (e) {
        return "";
      }
    })
    .join("\n");

  // 样式处理完成
  return styles;
};

const optimizeImages = async (element: HTMLElement) => {
  const startTime = performance.now();
  const images = element.getElementsByTagName("img");

  const imagePromises = Array.from(images)
    .filter((img) => !img.src.startsWith("data:"))
    .map(async (img) => {
      try {
        // 处理相对路径和绝对路径
        let imageUrl = img.src;
        
        // 如果是相对路径，转换为绝对路径
        if (imageUrl.startsWith('/')) {
          imageUrl = window.location.origin + imageUrl;
        }
        
        // 如果是相对路径（不以 http 开头），添加当前域名
        if (!imageUrl.startsWith('http')) {
          imageUrl = window.location.origin + '/' + imageUrl;
        }
        
        const response = await fetch(imageUrl, {
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) {
          console.warn(`Failed to load image: ${imageUrl}`);
          return Promise.resolve();
        }
        
        const blob = await response.blob();
        return new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            img.src = reader.result as string;
            resolve();
          };
          reader.onerror = () => {
            console.warn(`Failed to convert image to base64: ${imageUrl}`);
            resolve();
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.warn(`Image optimization failed for ${img.src}:`, error);
        return Promise.resolve();
      }
    });

  await Promise.all(imagePromises);
  // 图片处理完成
};

const PdfExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const { activeResume } = useResumeStore();
  const { globalSettings = {}, title } = activeResume || {};
  const t = useTranslations("pdfExport");
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  const handleExport = async () => {
    const exportStartTime = performance.now();
    setIsExporting(true);

    try {
      const pdfElement = document.querySelector<HTMLElement>("#resume-preview");
      if (!pdfElement) {
        throw new Error("PDF element not found");
      }

      const clonedElement = pdfElement.cloneNode(true) as HTMLElement;

      const pageBreakLines =
        clonedElement.querySelectorAll<HTMLElement>(".page-break-line");
      pageBreakLines.forEach((line) => {
        line.style.display = "none";
      });

      const [styles] = await Promise.all([
        getOptimizedStyles(),
        optimizeImages(clonedElement),
      ]);

      // 添加 PDF 专用样式
      const pdfStyles = `
        ${styles}
        
        /* PDF 专用样式 - 确保两栏布局 */
        .resume-container {
          display: flex !important;
          gap: 20px !important;
          width: 100% !important;
        }
        
        .resume-left-column {
          flex: 0 0 35% !important;
          background: #333 !important;
          color: white !important;
          padding: 20px !important;
          min-height: 100vh !important;
        }
        
        .resume-right-column {
          flex: 1 !important;
          padding: 20px !important;
          background: white !important;
        }
        
        /* 确保在 PDF 中正确显示 */
        @media print {
          .resume-container {
            display: flex !important;
          }
          .resume-left-column,
          .resume-right-column {
            display: block !important;
          }
        }
        
        /* 图片优化 */
        img {
          max-width: 100% !important;
          height: auto !important;
        }
        
        /* 字体优化 */
        body {
          font-family: Arial, sans-serif !important;
          line-height: 1.4 !important;
        }
      `;

      const response = await fetch(
        "https://1347602769-75a9mv2v75.ap-singapore.tencentscf.com/generate-pdf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: clonedElement.outerHTML, // 内容来源安全，来自用户编辑的简历数据
            styles: pdfStyles,
            margin: globalSettings.pagePadding,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);
      // 导出完成
      toast.success(t("toast.success"));
    } catch (error) {
      console.error("PDF export error:", error);
      
      // 如果 PDF 生成失败，提供降级方案
      if (error instanceof Error && error.message.includes('CORS')) {
        toast.error("PDF 生成服务暂时不可用，请稍后重试或联系管理员");
      } else {
        toast.error(t("toast.error"));
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleJsonExport = () => {
    try {
      setIsExportingJson(true);
      if (!activeResume) {
        throw new Error("No active resume");
      }

      const jsonStr = JSON.stringify(activeResume, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.json`;
      link.click();

      window.URL.revokeObjectURL(url);
      toast.success(t("toast.jsonSuccess"));
    } catch (error) {
      toast.error(t("toast.jsonError"));
    } finally {
      setIsExportingJson(false);
    }
  };

  const handlePrint = () => {
    if (!printFrameRef.current) {
      return;
    }

    const resumeContent = document.getElementById("resume-preview");
    if (!resumeContent) {
      return;
    }

    const actualContent = resumeContent.parentElement;
    if (!actualContent) {
      return;
    }

    const pagePadding = globalSettings?.pagePadding;
    const iframeWindow = printFrameRef.current.contentWindow;
    if (!iframeWindow) {
      return;
    }

    try {
      iframeWindow.document.open();
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Resume</title>
            <style>
              @font-face {
                font-family: "MiSans VF";
                src: url("/fonts/MiSans-VF.ttf") format("woff2");
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }

              @page {
                size: A4;
                margin: ${pagePadding}px;
                padding: 0;
              }
              * {
                box-sizing: border-box;
              }
              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                background: white;
              }
              body {
                font-family: sans-serif;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              #resume-preview {
                padding: 0 !important;
                margin: 0 !important;
                font-family: "MiSans VF", sans-serif !important;
              }

              #print-content {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                padding: 0;
                background: white;
                box-shadow: none;
              }
              #print-content * {
                box-shadow: none !important;
                transform: none !important;
                scale: 1 !important;
              }
              .scale-90 {
                transform: none !important;
              }
              
              .page-break-line {
                display: none;
              }

              ${Array.from(document.styleSheets)
                .map((sheet) => {
                  try {
                    return Array.from(sheet.cssRules)
                      .map((rule) => rule.cssText)
                      .join("\n");
                  } catch (e) {
                    return "";
                  }
                })
                .join("\n")}
            </style>
          </head>
          <body>
            <div id="print-content">
              ${actualContent.innerHTML} <!-- 内容来源安全，来自用户编辑的简历数据 -->
            </div>
          </body>
        </html>
      `;

      iframeWindow.document.write(htmlContent);
      iframeWindow.document.close();

      setTimeout(() => {
        try {
          iframeWindow.focus();
          iframeWindow.print();
        } catch (error) {
          // 打印失败
        }
      }, 1000);
    } catch (error) {
      // 打印设置失败
    }
  };

  const isLoading = isExporting || isExportingJson;
  const loadingText = isExporting
    ? t("button.exporting")
    : isExportingJson
    ? t("button.exportingJson")
    : "";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{loadingText}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{t("button.export")}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExport} disabled={isLoading}>
            <Download className="w-4 h-4 mr-2" />
            {t("button.exportPdf")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrint} disabled={isLoading}>
            <Printer className="w-4 h-4 mr-2" />
            {t("button.print")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleJsonExport} disabled={isLoading}>
            <FileJson className="w-4 h-4 mr-2" />
            {t("button.exportJson")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <iframe
        ref={printFrameRef}
        style={{
          position: "absolute",
          width: "210mm",
          height: "297mm",
          visibility: "hidden",
          zIndex: -1,
        }}
        title="Print Frame"
      />
    </>
  );
};

export default PdfExport;
