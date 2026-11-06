"use client";

import { useState } from "react";
import { tuanziGallery } from "@/lib/data";
import PlaceholderImage from "./PlaceholderImage";
import styles from "./TuanziSection.module.css";

export default function TuanziSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = () => setActiveIndex(null);
  const prev = () =>
    setActiveIndex((index) =>
      index === null ? index : (index - 1 + tuanziGallery.length) % tuanziGallery.length
    );
  const next = () =>
    setActiveIndex((index) =>
      index === null ? index : (index + 1) % tuanziGallery.length
    );

  return (
    <div className={styles.wrapper}>
      <ul className={styles.grid}>
        {tuanziGallery.map((src, index) => (
          <li key={src}>
            <button
              type="button"
              className={styles.thumb}
              onClick={() => setActiveIndex(index)}
              aria-label={`查看团子图片 ${index + 1}`}
            >
              <PlaceholderImage
                src={src}
                alt={`团子图片 ${index + 1}`}
                label="团子图片占位"
              />
            </button>
          </li>
        ))}
      </ul>

      {activeIndex !== null && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="团子图片放大查看"
          onClick={close}
        >
          <button
            type="button"
            className={`${styles.nav} ${styles.prev}`}
            onClick={(event) => {
              event.stopPropagation();
              prev();
            }}
            aria-label="上一张"
          >
            ‹
          </button>

          <div className={styles.stage} onClick={(event) => event.stopPropagation()}>
            <PlaceholderImage
              src={tuanziGallery[activeIndex]}
              alt={`团子图片 ${activeIndex + 1}`}
              label="团子图片占位"
            />
          </div>

          <button
            type="button"
            className={`${styles.nav} ${styles.next}`}
            onClick={(event) => {
              event.stopPropagation();
              next();
            }}
            aria-label="下一张"
          >
            ›
          </button>

          <button
            type="button"
            className={styles.close}
            onClick={(event) => {
              event.stopPropagation();
              close();
            }}
            aria-label="关闭"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
