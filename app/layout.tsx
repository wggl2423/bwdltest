import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "波纹大陆",
  description: "六国拼图，滑着看",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
