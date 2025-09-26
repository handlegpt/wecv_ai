import { ResumeData } from "@/types/resume";

interface StructuredDataProps {
  type: "website" | "software" | "product" | "organization";
  data?: any;
  locale?: string;
}

export default function StructuredData({ type, data, locale = "zh" }: StructuredDataProps) {
  const baseUrl = "https://wecv.com";
  
  const getStructuredData = () => {
    switch (type) {
      case "website":
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": locale === "zh" ? "WeCV AI - AI驱动的智能简历构建器" : "WeCV AI - AI-Powered Smart Resume Builder",
          "description": locale === "zh" 
            ? "免费开源的AI智能简历构建器，支持AI润色、多语言、数据本地存储，无需注册，让简历更专业"
            : "Free, open-source AI-powered smart resume builder with AI polishing, multi-language support, local data storage, no registration required",
          "url": baseUrl,
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${baseUrl}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "name": "WeCV AI",
            "url": baseUrl,
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/logo.png`,
              "width": 512,
              "height": 512
            }
          },
          "inLanguage": locale,
          "copyrightYear": 2025,
          "copyrightHolder": {
            "@type": "Organization",
            "name": "WeCV AI"
          }
        };

      case "software":
        return {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": locale === "zh" ? "WeCV AI" : "WeCV AI",
          "description": locale === "zh"
            ? "智能简历构建器和编辑器，支持多种模板，AI 辅助优化，完全免费使用"
            : "Smart resume builder and editor with multiple templates, AI-assisted optimization, completely free to use",
          "url": baseUrl,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1000"
          },
          "author": {
            "@type": "Organization",
            "name": "WeCV AI Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "WeCV AI",
            "url": baseUrl
          },
          "featureList": locale === "zh" ? [
            "多种专业简历模板",
            "AI 智能内容优化",
            "多语言支持",
            "本地数据存储",
            "无需注册",
            "完全免费",
            "PDF 导出",
            "实时预览"
          ] : [
            "Multiple professional resume templates",
            "AI-powered content optimization",
            "Multi-language support",
            "Local data storage",
            "No registration required",
            "Completely free",
            "PDF export",
            "Real-time preview"
          ],
          "screenshot": `${baseUrl}/screenshot.png`,
          "softwareVersion": "1.0.0",
          "datePublished": "2024-01-01",
          "dateModified": "2025-01-01"
        };

      case "product":
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": locale === "zh" ? "WeCV AI 简历构建器" : "WeCV AI Resume Builder",
          "description": locale === "zh"
            ? "专业的在线简历构建工具，帮助求职者快速创建精美的简历"
            : "Professional online resume building tool to help job seekers create beautiful resumes quickly",
          "brand": {
            "@type": "Brand",
            "name": "WeCV AI"
          },
          "category": "Software",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        };

      case "organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "WeCV AI",
          "url": baseUrl,
          "logo": `${baseUrl}/logo.png`,
          "description": locale === "zh"
            ? "致力于为全球用户提供免费、高质量的简历构建服务"
            : "Committed to providing free, high-quality resume building services to users worldwide",
          "foundingDate": "2024",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "hello # wecv.com"
          },
          "sameAs": [
            "https://github.com/handlegpt/wecv_old"
          ]
        };

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
      suppressHydrationWarning={true}
    />
  );
}
