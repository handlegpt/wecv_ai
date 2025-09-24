import LandingHeader from "@/components/home/LandingHeader";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import StatsSection from "@/components/home/StatsSection";
import HowToUseSection from "@/components/home/HowToUseSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";
import Footer from "@/components/home/Footer";
import StructuredData from "@/components/seo/StructuredData";

interface LandingPageProps {
  params: { locale: string };
}

export default function LandingPage({ params }: LandingPageProps) {
  return (
    <>
      <StructuredData type="website" locale={params.locale} />
      <div className="relative bg-gradient-to-b from-gray-50/50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        <LandingHeader />
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowToUseSection />
        <TestimonialsSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
