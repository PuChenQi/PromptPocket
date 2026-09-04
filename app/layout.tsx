import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "PromptPocket — 本地提示词库",
    description: "分类整理、快速搜索并一键复制你的提示词，所有数据仅保存在本机。",
    icons: { icon: "/app-icon.png", apple: "/app-icon.png" },
    openGraph: {
      title: "PromptPocket — 把好提示词收进口袋",
      description: "无需登录、不上传云端，支持 Windows 与 macOS。",
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "PromptPocket 本地提示词库" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "PromptPocket — 把好提示词收进口袋",
      description: "无需登录、不上传云端，支持 Windows 与 macOS。",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
