"use client";

import { useEffect, useRef, useState } from "react";
import { TINYLAND_TABS, type TinylandTabId } from "@/lib/data";
import styles from "./TinylandView.module.css";
import IntroSection from "./IntroSection";
import TuanziSection from "./TuanziSection";
import BubbleSection from "./BubbleSection";
import WinterSection from "./WinterSection";
import ListenSection from "./ListenSection";

const TABS = TINYLAND_TABS;

type TabId = TinylandTabId;

type TinylandViewProps = {
  onClose: () => void;
};

export default function TinylandView({ onClose }: TinylandViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("intro");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // 移动端让当前选中 tab 自动滚入可视区
  useEffect(() => {
    const index = TABS.findIndex((tab) => tab.id === activeTab);
    const tab = tabRefs.current[index];
    if (!tab) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    tab.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeTab]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="小人国"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <button type="button" className={styles.back} onClick={onClose}>
            <span aria-hidden="true">←</span> 返回
          </button>
          <h2 className={styles.title}>小人国</h2>
          <span className={styles.headerSpacer} aria-hidden="true" />
        </header>

        <nav className={styles.tabs} role="tablist" aria-label="小人国板块">
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`tinyland-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`tinyland-panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.content}>
          {TABS.map((tab) => (
            <section
              key={tab.id}
              role="tabpanel"
              id={`tinyland-panel-${tab.id}`}
              aria-labelledby={`tinyland-tab-${tab.id}`}
              hidden={activeTab !== tab.id}
              className={styles.tabPanel}
            >
              {tab.id === "intro" && <IntroSection />}
              {tab.id === "tuanzi" && <TuanziSection />}
              {tab.id === "bubble" && <BubbleSection />}
              {tab.id === "winter" && <WinterSection />}
              {tab.id === "listen" && <ListenSection />}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
