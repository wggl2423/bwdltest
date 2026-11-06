import type { NextConfig } from "next";

// GitHub Pages 部署在子路径 /bwdltest/ 下，需设置 basePath。
// Vercel 部署在根路径，无需设置。
// 构建时通过 GITHUB_PAGES=true 环境变量切换。
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/bwdltest" : "";

const nextConfig: NextConfig = {
  // 静态导出，支持 GitHub Pages
  output: "export",
  basePath,
  assetPrefix: isGithubPages ? `${basePath}/` : "",
  // 暴露给客户端，用于拼接资源路径
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  cacheComponents: !isGithubPages,
  // PPR 不支持静态导出，GitHub Pages 模式下禁用
  partialPrefetching: !isGithubPages,
  // 静态导出时禁用图片优化（项目用原生 img，不影响）
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
