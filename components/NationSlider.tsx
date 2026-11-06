"use client";

import { useEffect, useRef, useState } from "react";
import { nations, FRAME_BY_VARIANT, type Nation } from "@/lib/data";
import { NationIcon, LockIcon } from "./Icons";
import styles from "./NationSlider.module.css";

type NationSliderProps = {
  onSelect: (nation: Nation) => void;
};

export default function NationSlider({ onSelect }: NationSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // 桌面端鼠标滚轮：把纵向滚动映射为横向滑动（触控板横向手势保持原生行为）
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return; // 原生横向滚动
      if (event.deltaY === 0) return;
      event.preventDefault();
      track.scrollLeft += event.deltaY;
    };

    track.addEventListener("wheel", handleWheel, { passive: false });
    return () => track.removeEventListener("wheel", handleWheel);
  }, []);

  // 根据滚动位置找到居中的卡片索引
  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;

    const viewportCenter = track.scrollLeft + track.clientWidth / 2;
    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-nation-card]")
    );

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - viewportCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(nearestIndex);
  };

  return (
    <div className={styles.slider}>
      <div className={styles.track} ref={trackRef} onScroll={handleScroll}>
        {nations.map((nation) => {
          const locked = nation.id === "mystery";
          return (
            <button
              key={nation.id}
              type="button"
              data-nation-card
              className={`${styles.card} ${locked ? styles.cardLocked : ""}`}
              aria-label={
                nation.enterable
                  ? `进入${nation.name}`
                  : `${nation.name}，惊喜待解锁`
              }
              onClick={() => onSelect(nation)}
            >
              <span className={styles.cardSurface} aria-hidden="true" />

              <span
                className={styles.frame}
                style={{
                  backgroundImage: `url(${FRAME_BY_VARIANT[nation.frameVariant]})`,
                }}
                aria-hidden="true"
              />

              <span className={styles.content}>
                {locked ? (
                  <span className={styles.lockIcon} aria-hidden="true">
                    <LockIcon />
                  </span>
                ) : (
                  <span className={styles.icon} aria-hidden="true">
                    <NationIcon id={nation.id} />
                  </span>
                )}
                <span className={styles.name}>{nation.name}</span>
                <span className={styles.tagline}>{nation.tagline}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className={styles.counter} aria-live="polite">
        {activeIndex + 1} / {nations.length}
      </p>
    </div>
  );
}
