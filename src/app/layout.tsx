import { ReactNode } from "react";
import { Metadata } from "next";
import "./globals.css";
import "./font.css";

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  metadataBase: new URL("https://wecv.com"),
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
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="zh">
      <body>
        {children}
      </body>
    </html>
  );
}
