import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import dynamic from "next/dynamic";

// 动态导入客户端组件，禁用SSR
const LandingHeader = dynamic(() => import("@/components/home/LandingHeader"), {
  ssr: false,
  loading: () => <div className="h-20 bg-white dark:bg-gray-900 border-b"></div>
});

const Footer = dynamic(() => import("@/components/home/Footer"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-50 dark:bg-gray-900"></div>
});

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const baseUrl = "https://wecv.com";
  
  return {
    title: locale === "zh" 
      ? "服务条款 - WeCV AI" 
      : "Terms of Service - WeCV AI",
    description: locale === "zh"
      ? "WeCV AI 服务条款 - 了解我们的服务条款和使用条件，保护您的权益。"
      : "WeCV AI Terms of Service - Learn about our terms of service and usage conditions to protect your rights.",
    alternates: {
      canonical: `${baseUrl}/${locale}/terms`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function TermsPage() {
  const t = await getTranslations("terms");

  // 添加错误处理，确保翻译键存在
  const safeGetTranslation = (key: string, fallback: string = "") => {
    try {
      return t(key) || fallback;
    } catch (error) {
      console.warn(`Translation key "${key}" not found:`, error);
      return fallback;
    }
  };

  const safeGetRawTranslation = (key: string, fallback: string[] = []) => {
    try {
      return t.raw(key) || fallback;
    } catch (error) {
      console.warn(`Translation key "${key}" not found:`, error);
      return fallback;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      <LandingHeader />
      <div className="py-20">
        <div className="mx-auto max-w-[800px] px-4">
          <h1 className="text-4xl font-bold mb-8">{safeGetTranslation("title", "Terms of Service")}</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              {safeGetTranslation("lastUpdated", "Last updated: August 15, 2025")}
            </p>
            
            {/* 1. Service Description */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{safeGetTranslation("sections.serviceDescription.title", "1. Service Description")}</h2>
            <p className="mb-4">
              {safeGetTranslation("sections.serviceDescription.content", "WeCV AI is a free, AI-powered online resume creation and editing tool.")}
            </p>
            <ul className="list-disc pl-6 mt-2">
              {safeGetRawTranslation("sections.serviceDescription.features", ["AI-driven resume creation", "Multiple templates", "Local storage"]).map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            {/* 2. User Responsibilities */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{safeGetTranslation("sections.userResponsibilities.title", "2. User Responsibilities")}</h2>
            <p className="mb-4">
              {safeGetTranslation("sections.userResponsibilities.content", "By using WeCV AI, you agree to the following terms:")}
            </p>
            <ul className="list-disc pl-6 mt-2">
              {safeGetRawTranslation("sections.userResponsibilities.requirements", ["Comply with laws", "No illegal activities", "Provide accurate information"]).map((requirement: string, index: number) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>

            {/* 3. Privacy Protection */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{safeGetTranslation("sections.privacyProtection.title", "3. Privacy Protection")}</h2>
            <p className="mb-4">
              {safeGetTranslation("sections.privacyProtection.content", "WeCV AI values user privacy protection:")}
            </p>
            <ul className="list-disc pl-6 mt-2">
              {safeGetRawTranslation("sections.privacyProtection.features", ["Local data storage", "End-to-end encryption", "Data control"]).map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            {/* 4. Disclaimer */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{safeGetTranslation("sections.disclaimer.title", "4. Disclaimer")}</h2>
            <p className="mb-4">
              {safeGetTranslation("sections.disclaimer.content", "WeCV AI provides services 'as is' without any express or implied warranties.")}
            </p>
            <ul className="list-disc pl-6 mt-2">
              {safeGetRawTranslation("sections.disclaimer.items", ["Service interruptions", "Data loss", "Third-party issues"]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            {/* 5. Intellectual Property */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{safeGetTranslation("sections.intellectualProperty.title", "5. Intellectual Property")}</h2>
            <p className="mb-4">
              {safeGetTranslation("sections.intellectualProperty.content", "WeCV AI respects intellectual property rights.")}
            </p>
            <p className="mt-4">
              {safeGetTranslation("sections.intellectualProperty.userRights", "Users retain ownership of their resume content.")}
            </p>

            {/* 6. Service Availability */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{safeGetTranslation("sections.serviceAvailability.title", "6. Service Availability")}</h2>
            <p className="mb-4">
              {safeGetTranslation("sections.serviceAvailability.content", "We strive to maintain service availability but cannot guarantee uninterrupted access.")}
            </p>
            <ul className="list-disc pl-6 mt-2">
              {safeGetRawTranslation("sections.serviceAvailability.reasons", ["Maintenance", "Technical issues", "Force majeure"]).map((reason: string, index: number) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>

            {/* 7. Modifications */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{safeGetTranslation("sections.modifications.title", "7. Modifications")}</h2>
            <p className="mb-4">
              {safeGetTranslation("sections.modifications.content", "We may modify these terms at any time. Continued use constitutes acceptance.")}
            </p>

            {/* 8. Contact */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{safeGetTranslation("sections.contact.title", "8. Contact Us")}</h2>
            <p className="mb-4">
              {safeGetTranslation("sections.contact.content", "If you have any questions about these terms, please contact us:")}
            </p>
            <ul className="list-disc pl-6 mt-2">
              {safeGetRawTranslation("sections.contact.methods", ["Email: hello # wecv.com", "Website: https://wecv.com"]).map((method: string, index: number) => (
                <li key={index}>{method}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}