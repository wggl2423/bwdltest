"use client";

import { useEffect, useRef, useState } from "react";
import { nations, FRAME_BY_VARIANT, type Nation } from "@/lib/data";
import { LockIcon } from "./Icons";
import PixelIcon from "./PixelIcon";
import styles from "./NationSlider.module.css";

type NationSliderProps = {
  onSelect: (nation: Nation) => void;
};

export default function NationSlider({ onSelect }: NationSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // 桌面端鼠标滚轮：纵向 → 横向
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (event.deltaY === 0) return;
      event.preventDefault();
      track.scrollLeft += event.deltaY;
    };

    track.addEventListener("wheel", handleWheel, { passive: false });
    return () => track.removeEventListener("wheel", handleWheel);
  }, []);

  // 居中卡片索引
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

  // 点击圆点平滑滚动到对应卡片
  const scrollToCard = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>("[data-nation-card]");
    const card = cards[index];
    if (!card) return;
    const target = card.offsetLeft - track.clientWidth / 2 + card.offsetWidth / 2;
    track.scrollTo({ left: target, behavior: "smooth" });
  };

  return (
    <div className={styles.slider}>
      <div className={styles.track} ref={trackRef} onScroll={handleScroll}>
        {/* 滑动背景小方块 */}
        <div className={styles.bgSquares} aria-hidden="true" />

        {nations.map((nation, index) => {
          const locked = nation.id === "mystery";
          const isActive = index === activeIndex;
          return (
            <button
              key={nation.id}
              type="button"
              data-nation-card
              className={`${styles.card} ${locked ? styles.cardLocked : ""} ${
                isActive ? styles.cardActive : ""
              }`}
              style={{ animationDelay: `${index * 80}ms` }}
              aria-label={
                nation.enterable
                  ? `进入${nation.name}`
                  : `${nation.name}，惊喜待解锁`
              }
              onClick={() => onSelect(nation)}
            >
              {/* 1. 底层纹理 */}
              <span className={styles.cardTexture} aria-hidden="true" />

              {/* 2. 装饰光斑 */}
              <span className={styles.cardGlow} aria-hidden="true" />

              {/* 3. 像素元素层 */}
              <span className={styles.pixelLayer} aria-hidden="true">
                <span className={styles.pixelIconWrap}>
                  <PixelIcon type={nation.pixelIcon} size={56} />
                </span>
                {!locked && (
                  <span className={styles.pixelLabel}>{nation.name}居民</span>
                )}
              </span>

              {/* 4. 主体内容层 */}
              <span className={styles.content}>
                {locked ? (
                  <span className={styles.lockIcon} aria-hidden="true">
                    <LockIcon />
                  </span>
                ) : null}
                <span className={styles.name}>{nation.name}</span>
                <span className={styles.nameUnderline} aria-hidden="true" />
                <span className={styles.tagline}>{nation.tagline}</span>
              </span>

              {/* 5. 拼图边框层 */}
              <span
                className={styles.frame}
                style={{
                  backgroundImage: `url(${FRAME_BY_VARIANT[nation.frameVariant]})`,
                }}
                aria-hidden="true"
              />

              {/* 四角像素咬合点 */}
              <span className={styles.cornerDotTL} aria-hidden="true" />
              <span className={styles.cornerDotTR} aria-hidden="true" />
              <span className={styles.cornerDotBL} aria-hidden="true" />
              <span className={styles.cornerDotBR} aria-hidden="true" />
            </button>
          );
        })}

        {/* 底部渐变遮罩 */}
        <div className={styles.bottomMask} aria-hidden="true" />
      </div>

      {/* 索引指示器：圆点 + 文字 */}
      <div className={styles.indicator}>
        <div className={styles.dots}>
          {nations.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`}
              onClick={() => scrollToCard(index)}
              aria-label={`跳转到第 ${index + 1} 张卡片`}
            />
          ))}
        </div>
        <span className={styles.counter}>
          {activeIndex + 1}/{nations.length}
        </span>
      </div>
    </div>
  );
}
