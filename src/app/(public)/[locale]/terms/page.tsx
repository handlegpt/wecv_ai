import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import Link from "next/link";

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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* 简单的静态头部 */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <div>
                <div className="font-black text-xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  WeCV
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  AI Resume Builder
                </div>
              </div>
            </Link>
            <Link 
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {safeGetTranslation("backToHome", "Back to Home")}
            </Link>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            {safeGetTranslation("title", "Terms of Service")}
          </h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {safeGetTranslation("sections.serviceDescription.title", "1. Service Description")}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {safeGetTranslation("sections.serviceDescription.content", "WeCV AI is a free, AI-powered online resume creation and editing tool.")}
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                {safeGetRawTranslation("sections.serviceDescription.features", ["AI-driven resume creation", "Multiple templates", "Local storage"]).map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {safeGetTranslation("sections.userResponsibilities.title", "2. User Responsibilities")}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {safeGetTranslation("sections.userResponsibilities.content", "By using WeCV AI, you agree to the following terms:")}
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                {safeGetRawTranslation("sections.userResponsibilities.requirements", ["Comply with laws", "No illegal activities", "Provide accurate information"]).map((requirement: string, index: number) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {safeGetTranslation("sections.privacyProtection.title", "3. Privacy Protection")}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {safeGetTranslation("sections.privacyProtection.content", "WeCV AI values user privacy protection:")}
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                {safeGetRawTranslation("sections.privacyProtection.features", ["Local data storage", "End-to-end encryption", "Data control"]).map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {safeGetTranslation("sections.disclaimer.title", "4. Disclaimer")}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {safeGetTranslation("sections.disclaimer.content", "WeCV AI provides services 'as is' without any express or implied warranties.")}
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                {safeGetRawTranslation("sections.disclaimer.items", ["Service interruptions", "Data loss", "Third-party issues"]).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {safeGetTranslation("sections.intellectualProperty.title", "5. Intellectual Property")}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {safeGetTranslation("sections.intellectualProperty.content", "WeCV AI respects intellectual property rights.")}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {safeGetTranslation("sections.intellectualProperty.userRights", "Users retain ownership of their resume content.")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {safeGetTranslation("sections.serviceAvailability.title", "6. Service Availability")}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {safeGetTranslation("sections.serviceAvailability.content", "We strive to maintain service availability but cannot guarantee uninterrupted access.")}
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                {safeGetRawTranslation("sections.serviceAvailability.reasons", ["Maintenance", "Technical issues", "Force majeure"]).map((reason: string, index: number) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {safeGetTranslation("sections.modifications.title", "7. Modifications")}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {safeGetTranslation("sections.modifications.content", "We may modify these terms at any time. Continued use constitutes acceptance.")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {safeGetTranslation("sections.contact.title", "8. Contact Us")}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {safeGetTranslation("sections.contact.content", "If you have any questions about these terms, please contact us:")}
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                {safeGetRawTranslation("sections.contact.methods", ["Email: hello # wecv.com", "Website: https://wecv.com"]).map((method: string, index: number) => (
                  <li key={index}>{method}</li>
                ))}
              </ul>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {safeGetTranslation("lastUpdated", "Last updated: August 15, 2025")}
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* 简单的静态页脚 */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>{safeGetTranslation("footer.copyright", "© 2025 WeCV AI. All rights reserved.")}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span>Made by WeCV AI</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 italic">not backed by Y Combinator</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}