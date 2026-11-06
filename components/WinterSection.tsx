import { WINTER_SELL_URL } from "@/lib/data";
import styles from "./WinterSection.module.css";

// 仅做跳转卡片，不内嵌商品。贩售链接在 lib/data.ts 的 WINTER_SELL_URL 配置。

export default function WinterSection() {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>爱在冬令时</h2>
      <p className={styles.desc}>冬日限定贩售，点击前往</p>
      <a
        className={styles.button}
        href={WINTER_SELL_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        前往贩售
      </a>
    </div>
  );
}
