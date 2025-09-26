import { ReactNode } from "react";
import { Metadata } from "next";
import Document from "@/components/Document";

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  title: "分享简历 - WeCV AI",
  description: "查看通过 WeCV AI 创建的简历",
  robots: {
    index: true,
    follow: true,
  },
};

export default function ShareLayout({ children }: Props) {
  return (
    <Document locale="zh">
      {children}
    </Document>
  );
}
