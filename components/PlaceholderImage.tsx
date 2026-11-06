"use client";

import { useEffect, useState } from "react";
import styles from "./PlaceholderImage.module.css";

type PlaceholderImageProps = {
  src: string;
  alt: string;
  label?: string;
  className?: string;
};

// 原型阶段统一用纯色块占位；图片加载成功则显示原图，失败显示占色块。
export default function PlaceholderImage({
  src,
  alt,
  label = "图片占位",
  className,
}: PlaceholderImageProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    setStatus("loading");
    const img = new Image();
    img.onload = () => setStatus("ready");
    img.onerror = () => setStatus("error");
    img.src = src;
  }, [src]);

  if (status === "ready") {
    // 需用原生 img 检测加载状态，next/image 不适用
    return (
      <img src={src} alt={alt} className={`${styles.image} ${className ?? ""}`} />
    );
  }

  return (
    <div className={`${styles.placeholder} ${className ?? ""}`} aria-label={label}>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
