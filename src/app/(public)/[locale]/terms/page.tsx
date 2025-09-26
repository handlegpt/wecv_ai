import { useTranslations } from "next-intl";
import LandingHeader from "@/components/home/LandingHeader";
import Footer from "@/components/home/Footer";

export default function TermsPage() {
  const t = useTranslations("terms");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      <LandingHeader />
      <div className="py-20">
        <div className="mx-auto max-w-[800px] px-4">
          <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              {t("lastUpdated")}
            </p>
            
            {/* 1. Service Description */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("sections.serviceDescription.title")}</h2>
            <p className="mb-4">
              {t("sections.serviceDescription.content")}
            </p>
            <ul className="list-disc pl-6 mt-2">
              {t.raw("sections.serviceDescription.features").map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            {/* 2. User Responsibilities */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("sections.userResponsibilities.title")}</h2>
            <p className="mb-4">
              {t("sections.userResponsibilities.content")}
            </p>
            <ul className="list-disc pl-6 mt-2">
              {t.raw("sections.userResponsibilities.requirements").map((requirement: string, index: number) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>

            {/* 3. Privacy Protection */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("sections.privacyProtection.title")}</h2>
            <p className="mb-4">
              {t("sections.privacyProtection.content")}
            </p>
            <ul className="list-disc pl-6 mt-2">
              {t.raw("sections.privacyProtection.features").map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            {/* 4. Disclaimer */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("sections.disclaimer.title")}</h2>
            <p className="mb-4">
              {t("sections.disclaimer.content")}
            </p>
            <ul className="list-disc pl-6 mt-2">
              {t.raw("sections.disclaimer.items").map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            {/* 5. Intellectual Property */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("sections.intellectualProperty.title")}</h2>
            <p className="mb-4">
              {t("sections.intellectualProperty.content")}
            </p>
            <p className="mt-4">
              {t("sections.intellectualProperty.userRights")}
            </p>

            {/* 6. Service Availability */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("sections.serviceAvailability.title")}</h2>
            <p className="mb-4">
              {t("sections.serviceAvailability.content")}
            </p>
            <ul className="list-disc pl-6 mt-2">
              {t.raw("sections.serviceAvailability.reasons").map((reason: string, index: number) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>

            {/* 7. Modifications */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("sections.modifications.title")}</h2>
            <p className="mb-4">
              {t("sections.modifications.content")}
            </p>

            {/* 8. Contact */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("sections.contact.title")}</h2>
            <p className="mb-4">
              {t("sections.contact.content")}
            </p>
            <ul className="list-disc pl-6 mt-2">
              {t.raw("sections.contact.methods").map((method: string, index: number) => (
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