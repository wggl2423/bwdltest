"use client";

import { useCallback, useEffect, useState } from "react";
import IntroOverlay from "@/components/IntroOverlay";
import MysteryDialog from "@/components/MysteryDialog";
import NationSlider from "@/components/NationSlider";
import TinylandView from "@/components/TinylandView";
import type { Nation } from "@/lib/data";
import styles from "./page.module.css";

export default function Home() {
  const [introVisible, setIntroVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [visitorName, setVisitorName] = useState("");
  const [tinylandOpen, setTinylandOpen] = useState(false);
  const [mysteryNation, setMysteryNation] = useState<Nation | null>(null);

  // 首屏读取本地记录，避免服务端渲染时误判
  useEffect(() => {
    const introDone = localStorage.getItem("introDone");
    setIntroVisible(!introDone);
    setVisitorName(localStorage.getItem("visitorName") ?? "");
    setReady(true);
  }, []);

  const handleIntroDone = useCallback(() => {
    localStorage.setItem("introDone", "1");
    setVisitorName(localStorage.getItem("visitorName") ?? "");
    setIntroVisible(false);
  }, []);

  // 重看开场：清除记录并重新挂载开场层，不刷新页面
  const handleReplay = () => {
    localStorage.removeItem("introDone");
    setRunKey((key) => key + 1);
    setIntroVisible(true);
  };

  const showMain = ready && !introVisible;

  const handleSelectNation = (nation: Nation) => {
    if (nation.enterable) {
      setTinylandOpen(true);
      return;
    }
    setMysteryNation(nation);
  };

  return (
    <>
      <main
        className={`${styles.page} ${showMain ? styles.pageVisible : styles.pageHidden}`}
        aria-hidden={!showMain}
      >
        <header className={styles.header}>
          <p className={styles.welcome}>
            欢迎来到波纹大陆，{visitorName || "旅人"}
          </p>
          <h1 className={styles.title}>波纹大陆</h1>
          <p className={styles.subtitle}>六国拼图，滑着看</p>
          {showMain && (
            <button type="button" className={styles.replay} onClick={handleReplay}>
              重看开场
            </button>
          )}
        </header>

        <NationSlider onSelect={handleSelectNation} />

        {tinylandOpen && <TinylandView onClose={() => setTinylandOpen(false)} />}

        {mysteryNation && (
          <MysteryDialog
            nation={mysteryNation}
            onClose={() => setMysteryNation(null)}
          />
        )}
      </main>

      {ready && introVisible && (
        <IntroOverlay key={runKey} onDone={handleIntroDone} />
      )}
    </>
  );
}
