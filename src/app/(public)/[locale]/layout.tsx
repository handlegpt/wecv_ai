import { ReactNode } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale
} from "next-intl/server";
import Document from "@/components/Document";
import { locales } from "@/i18n/config";
import { Providers } from "@/app/providers";
import JsonLd from "@/components/seo/JsonLd";
import { generatePerformanceMetadata } from "@/lib/performance";

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale }
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "common" });
  const baseUrl = "https://wecv.com";

  const baseMetadata = {
    title: t("title") + " - " + t("subtitle"),
    description: t("description"),
    keywords: locale === "zh" 
      ? "AI简历,智能简历,简历制作,简历模板,简历编辑器,免费简历,AI润色,求职工具,简历设计,在线简历,简历优化,AI写作"
      : locale === "ja"
      ? "AI履歴書,スマート履歴書,履歴書作成,履歴書テンプレート,履歴書エディター,無料履歴書,AI潤色,就職ツール,履歴書デザイン,オンライン履歴書,履歴書最適化,AIライティング"
      : "AI resume,smart resume,resume builder,resume template,resume editor,free resume,AI polishing,job search tool,resume design,online resume,resume optimization,AI writing",
    authors: [{ name: "WeCV AI Team" }],
    creator: "WeCV AI",
    publisher: "WeCV AI",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'zh': `${baseUrl}/zh`,
        'en': `${baseUrl}/en`,
        'ja': `${baseUrl}/ja`,
      },
    },
    openGraph: {
      title: t("title") + " - " + t("subtitle"),
      description: t("description"),
      url: `${baseUrl}/${locale}`,
      siteName: "WeCV AI",
      locale: locale,
      type: "website",
      images: [
        {
          url: `${baseUrl}/opengraph-image-${locale}`,
          width: 1200,
          height: 630,
          alt: t("title") + " - " + t("subtitle"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title") + " - " + t("subtitle"),
      description: t("description"),
      images: [`${baseUrl}/opengraph-image-${locale}`],
      creator: "@wecvai",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large" as const,
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
      yandex: "your-yandex-verification-code",
      yahoo: "your-yahoo-verification-code",
    },
  };

  // 合并性能优化元数据
  const performanceMetadata = generatePerformanceMetadata();
  
  return {
    ...baseMetadata,
    ...performanceMetadata,
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: Props) {
  setRequestLocale(locale);

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <Document locale={locale}>
      <NextIntlClientProvider messages={messages}>
        <Providers>
          {/* JSON-LD 结构化数据 */}
          <JsonLd type="website" locale={locale} />
          <JsonLd type="software" locale={locale} />
          <JsonLd type="organization" locale={locale} />
          <JsonLd type="faq" locale={locale} />
          {children}
        </Providers>
      </NextIntlClientProvider>
    </Document>
  );
}
