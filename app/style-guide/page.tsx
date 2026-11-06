import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "设计规范 · 波纹大陆",
};

const palette = [
  { token: "--pink-primary", value: "#E8B4B8", usage: "主色 / 主按钮" },
  { token: "--pink-deep", value: "#D48A8F", usage: "图标、强调" },
  { token: "--pink-soft", value: "#F5E6E8", usage: "浅色背景块" },
  { token: "--bg", value: "#FAF7F4", usage: "页面底色" },
  { token: "--surface", value: "#FFFFFF", usage: "卡片、面板" },
  { token: "--text", value: "#3D3A38", usage: "正文" },
  { token: "--text-muted", value: "#8A8480", usage: "次要文字" },
  { token: "--accent", value: "#A8BFC4", usage: "状态 / 小面积点缀" },
  { token: "--border", value: "#E5DDD8", usage: "描边、分割线" },
];

const radii = [
  { token: "--radius-sm", value: "8px", label: "小圆角" },
  { token: "--radius-md", value: "14px", label: "中圆角" },
  { token: "--radius-lg", value: "20px", label: "大圆角" },
];

export default function StyleGuidePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>波纹大陆</p>
        <h1 className={styles.title}>设计规范</h1>
        <p className={styles.lead}>
          原型阶段的视觉基线，所有页面统一从这里取色、取圆角、取阴影。
        </p>
        <Link className={styles.back} href="/">
          返回主页面
        </Link>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>色板</h2>
        <ul className={styles.palette}>
          {palette.map((color) => (
            <li className={styles.swatch} key={color.token}>
              <span
                className={styles.swatchColor}
                style={{ background: `var(${color.token})` }}
              />
              <code className={styles.token}>{color.token}</code>
              <span className={styles.hex}>{color.value}</span>
              <span className={styles.usage}>{color.usage}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>圆角</h2>
        <div className={styles.radiusRow}>
          {radii.map((radius) => (
            <div className={styles.radiusItem} key={radius.token}>
              <div
                className={styles.radiusBox}
                style={{ borderRadius: `var(${radius.token})` }}
              />
              <span className={styles.radiusLabel}>{radius.label}</span>
              <code className={styles.token}>{radius.token}</code>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>阴影</h2>
        <div className={styles.shadowDemo}>--shadow-card</div>
        <code className={styles.token}>
          0 4px 16px rgba(61, 58, 56, 0.06)
        </code>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>按钮</h2>
        <div className={styles.buttonRow}>
          <button type="button" className={styles.primaryButton}>
            主按钮
          </button>
          <button type="button" className={styles.ghostButton}>
            次按钮
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>卡片示例</h2>
        <article className={styles.card}>
          <span className={styles.cardIcon} aria-hidden="true" />
          <div>
            <h3 className={styles.cardTitle}>小人国</h3>
            <p className={styles.cardTagline}>波纹的小小世界</p>
          </div>
          <span className={styles.badge}>可进入</span>
        </article>
      </section>
    </main>
  );
}
