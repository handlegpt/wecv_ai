import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const baseUrl = "https://wecv.ai";
  
  return {
    title: locale === "zh" 
      ? "隐私政策 - WeCV AI" 
      : "Privacy Policy - WeCV AI",
    description: locale === "zh"
      ? "WeCV AI 隐私政策 - 了解我们如何保护您的数据隐私，本地存储，无需注册，完全免费使用。"
      : "WeCV AI Privacy Policy - Learn how we protect your data privacy with local storage, no registration required, completely free to use.",
    alternates: {
      canonical: `${baseUrl}/${locale}/privacy`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("home");
  const p = await getTranslations("privacy");

  return (
    <div className="py-20">
      <div className="mx-auto max-w-[800px] px-4">
        <h1 className="text-4xl font-bold mb-8">{t("privacyPolicy")}</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-6">
            {p("lastUpdated")}
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. {p("commitment.title")}</h2>
          <p>
            {p("commitment.content")}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. {p("dataCollection.title")}</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">2.1 {p("dataCollection.localStorage.title")}</h3>
          <p>
            {p("dataCollection.localStorage.content")}
          </p>
          <ul className="list-disc pl-6 mt-2">
            {p.raw("dataCollection.localStorage.items").map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.2 {p("dataCollection.technicalData.title")}</h3>
          <p>
            {p("dataCollection.technicalData.content")}
          </p>
          <ul className="list-disc pl-6 mt-2">
            {p.raw("dataCollection.technicalData.items").map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. {p("dataSecurity.title")}</h2>
          <p>
            {p("dataSecurity.content")}
          </p>
          <ul className="list-disc pl-6 mt-2">
            {p.raw("dataSecurity.measures").map((measure: string, index: number) => (
              <li key={index}><strong>{measure.split('：')[0]}：</strong>{measure.split('：')[1]}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. {p("cookies.title")}</h2>
          <p>
            {p("cookies.content")}
          </p>
          <ul className="list-disc pl-6 mt-2">
            {p.raw("cookies.technologies").map((tech: string, index: number) => (
              <li key={index}><strong>{tech.split('：')[0]}：</strong>{tech.split('：')[1]}</li>
            ))}
          </ul>
          <p className="mt-4">
            {p("cookies.note")}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. {p("thirdParty.title")}</h2>
          <p>
            {p("thirdParty.content")}
          </p>
          <ul className="list-disc pl-6 mt-2">
            {p.raw("thirdParty.services").map((service: string, index: number) => (
              <li key={index}><strong>{service.split('：')[0]}：</strong>{service.split('：')[1]}</li>
            ))}
          </ul>
          <p className="mt-4">
            {p("thirdParty.note")}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. {p("dataControl.title")}</h2>
          <p>
            {p("dataControl.content")}
          </p>
          <ul className="list-disc pl-6 mt-2">
            {p.raw("dataControl.rights").map((right: string, index: number) => (
              <li key={index}><strong>{right.split('：')[0]}：</strong>{right.split('：')[1]}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. {p("children.title")}</h2>
          <p>
            {p("children.content")}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. {p("updates.title")}</h2>
          <p>
            {p("updates.content")}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. {p("contact.title")}</h2>
          <p>
            {p("contact.content")}
          </p>
          <ul className="list-disc pl-6 mt-2">
            {p.raw("contact.methods").map((method: string, index: number) => (
              <li key={index}>{method}</li>
            ))}
          </ul>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{p("promise.title")}</h3>
            <p className="text-sm">
              {p("promise.content")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
