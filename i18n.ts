import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { locales } from "./src/i18n/config";

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./src/i18n/locales/${locale}.json`)).default
  };
}); 