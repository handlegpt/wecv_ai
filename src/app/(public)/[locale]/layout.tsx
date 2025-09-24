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

  return {
    title: t("title") + " - " + t("subtitle"),
    description: t("description"),
    keywords: locale === "zh" 
      ? "简历制作,简历模板,简历编辑器,免费简历,AI简历,求职工具,简历设计,在线简历"
      : "resume builder,resume template,resume editor,free resume,AI resume,job search tool,resume design,online resume",
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
          url: `${baseUrl}/og-image-${locale}.png`,
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
      images: [`${baseUrl}/og-image-${locale}.png`],
      creator: "@wecv_ai",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
      yandex: "your-yandex-verification-code",
      yahoo: "your-yahoo-verification-code",
    },
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
        <Providers>{children}</Providers>
      </NextIntlClientProvider>
    </Document>
  );
}
