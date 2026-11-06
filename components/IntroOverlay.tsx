"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./IntroOverlay.module.css";

type Phase = "idle" | "playing" | "entering" | "done";

type IntroOverlayProps = {
  onDone: () => void;
};

const NAME_MAX = 12;
const RIPPLE_MS = 800;
const FADE_MS = 300;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function IntroOverlay({ onDone }: IntroOverlayProps) {
  // 状态机：idle → playing → entering → done
  const [phase, setPhase] = useState<Phase>("idle");
  const [name, setName] = useState("");
  const [ripple, setRipple] = useState<{
    x: number;
    y: number;
    size: number;
  } | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const enterButtonRef = useRef<HTMLButtonElement>(null);

  const trimmedName = name.trim();
  const canEnter = trimmedName.length > 0 && trimmedName.length <= NAME_MAX;

  // 点击唱片：播放音乐并进入名字输入
  const handleDiscClick = () => {
    if (phase !== "idle") return;
    setPhase("playing");

    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.6;
    // 必须在点击事件的同步调用栈里触发 play()，否则会被浏览器自动播放策略拦截
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch((error) => {
        // 播放失败静默降级：唱片照转、名字照填、仍可进入
        console.error("背景音乐播放失败，已降级为静音模式", error);
      });
    }
  };

  // 跳过音乐，直接到名字输入
  const handleSkip = () => {
    if (phase === "entering" || phase === "done") return;
    audioRef.current?.pause();
    setPhase("playing");
  };

  const handleAudioError = () => {
    console.error("背景音乐加载失败，已降级为静音模式");
  };

  // 以点击坐标为圆心计算波纹尺寸，scale 0 → 1 覆盖全屏
  const beginEntering = (x: number, y: number) => {
    if (phase !== "playing" || !canEnter) return;

    localStorage.setItem("visitorName", trimmedName);
    setPhase("entering");

    if (prefersReducedMotion()) {
      setRipple(null);
      return;
    }

    const maxX = Math.max(x, window.innerWidth - x);
    const maxY = Math.max(y, window.innerHeight - y);
    const size = Math.ceil(Math.sqrt(maxX ** 2 + maxY ** 2) * 2 + 40);
    setRipple({ x, y, size });
  };

  // 键盘回车提交时没有鼠标坐标，用按钮中心兜底
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const rect = enterButtonRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    beginEntering(x, y);
  };

  // 波纹扩散结束后进入 done
  useEffect(() => {
    if (phase !== "entering") return;
    const timer = window.setTimeout(
      () => setPhase("done"),
      prefersReducedMotion() ? 0 : RIPPLE_MS
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

  // done 状态开场层淡出，随后通知父组件
  useEffect(() => {
    if (phase !== "done") return;
    const timer = window.setTimeout(
      onDone,
      prefersReducedMotion() ? 0 : FADE_MS
    );
    return () => window.clearTimeout(timer);
  }, [phase, onDone]);

  return (
    <div
      className={styles.overlay}
      data-phase={phase}
      role="dialog"
      aria-modal="true"
      aria-label="波纹大陆开场"
    >
      <audio
        ref={audioRef}
        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/audio/baiwuliaolai.mp3`}
        preload="auto"
        onError={handleAudioError}
      />

      {(phase === "idle" || phase === "playing") && (
        <button type="button" className={styles.skip} onClick={handleSkip}>
          跳过
        </button>
      )}

      <div className={styles.center}>
        <span className={styles.brand}>波纹大陆</span>

        <button
          type="button"
          className={styles.discButton}
          onClick={handleDiscClick}
          aria-label="点击唱片，听见波纹大陆"
        >
          <span className={styles.disc} data-spinning={phase !== "idle"}>
            <span className={styles.discLabel} />
            <span className={styles.discHole} />
          </span>
        </button>

        <p className={styles.copy}>
          {phase === "idle"
            ? "点击唱片，听见波纹大陆"
            : "波纹大陆需要记住你的名字"}
        </p>

        {phase !== "idle" && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="你的名字"
              maxLength={NAME_MAX}
              aria-label="你的名字（1 到 12 个字符）"
            />
            <button
              ref={enterButtonRef}
              type="submit"
              className={styles.enter}
              disabled={!canEnter}
              onClick={(event) => {
                if (!canEnter) return;
                event.preventDefault();
                beginEntering(event.clientX, event.clientY);
              }}
            >
              进入
            </button>
          </form>
        )}
      </div>

      {ripple && (
        <span
          className={styles.ripple}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
