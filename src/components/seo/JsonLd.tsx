"use client";

import { useTranslations } from "next-intl";

interface JsonLdProps {
  type: "website" | "software" | "organization" | "faq" | "breadcrumb";
  data?: any;
  locale?: string;
}

export default function JsonLd({ type, data, locale = "zh" }: JsonLdProps) {
  const t = useTranslations("common");
  const baseUrl = "https://wecv.com";
  
  const getJsonLd = () => {
    switch (type) {
      case "website":
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": t("title"),
          "description": t("description"),
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
          "name": t("title"),
          "description": t("description"),
          "url": baseUrl,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "author": {
            "@type": "Organization",
            "name": "WeCV AI"
          },
          "datePublished": "2025-01-01",
          "dateModified": new Date().toISOString(),
          "softwareVersion": "1.0.0",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1000"
          }
        };

      case "organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "WeCV AI",
          "description": t("description"),
          "url": baseUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/logo.png`,
            "width": 512,
            "height": 512
          },
          "sameAs": [
            "https://github.com/handlegpt/wecv_ai",
            "https://x.com/wecvai"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "support@wecv.com"
          }
        };

      case "faq":
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": locale === "zh" ? "WeCV AI 是什么？" : 
                     locale === "ja" ? "WeCV AI とは何ですか？" : 
                     "What is WeCV AI?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": t("description")
              }
            },
            {
              "@type": "Question",
              "name": locale === "zh" ? "WeCV AI 是免费的吗？" : 
                     locale === "ja" ? "WeCV AI は無料ですか？" : 
                     "Is WeCV AI free?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": locale === "zh" ? "是的，WeCV AI 完全免费使用，无需注册。" : 
                       locale === "ja" ? "はい、WeCV AI は完全に無料で、登録不要です。" : 
                       "Yes, WeCV AI is completely free to use with no registration required."
              }
            },
            {
              "@type": "Question",
              "name": locale === "zh" ? "我的数据安全吗？" : 
                     locale === "ja" ? "私のデータは安全ですか？" : 
                     "Is my data secure?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": locale === "zh" ? "是的，所有数据都存储在本地，我们不会收集您的个人信息。" : 
                       locale === "ja" ? "はい、すべてのデータはローカルに保存され、個人情報は収集されません。" : 
                       "Yes, all data is stored locally and we don't collect your personal information."
              }
            }
          ]
        };

      case "breadcrumb":
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data?.breadcrumbs?.map((item: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": `${baseUrl}${item.url}`
          })) || []
        };

      default:
        return {};
    }
  };

  const jsonLd = getJsonLd();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
