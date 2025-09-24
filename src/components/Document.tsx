import { Inter } from "next/font/google";
import { ReactNode } from "react";
import GoogleAnalytics from "./GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
});

type Props = {
  children: ReactNode;
  locale: string;
  bodyClassName?: string;
};

export default function Document({ children, locale, bodyClassName }: Props) {
  return (
    <html className={inter.className} lang={locale} suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <link rel="icon" href="/favicon.ico?v=2" />
      </head>
      <body className={bodyClassName}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
