import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WeCV AI - 智能简历构建器",
    short_name: "WeCV AI",
    description: "AI驱动的智能简历构建器，支持多语言、数据本地存储，无需注册",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}
