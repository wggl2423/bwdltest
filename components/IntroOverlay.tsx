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

/** canvas 绘制星空：80–120 个白点，随机位置/透明度，缓慢闪烁 */
function drawStars(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  const isMobile = w < 640;
  const count = isMobile ? 50 : 100;

  // 预生成星星参数（位置、基础透明度、闪烁相位）
  const stars = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.2 + 0.3,
    baseAlpha: Math.random() * 0.6 + 0.2,
    phase: Math.random() * Math.PI * 2,
  }));

  let raf = 0;

  const render = (t: number) => {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const alpha = s.baseAlpha + Math.sin(t * 0.001 + s.phase) * 0.2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.05, Math.min(0.9, alpha))})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(render);
  };

  raf = requestAnimationFrame(render);
  return () => cancelAnimationFrame(raf);
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
  const starsCanvasRef = useRef<HTMLCanvasElement>(null);

  // canvas 星空
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const cleanup = drawStars(canvas);

    const handleResize = () => {
      cleanup?.();
      const next = drawStars(canvas);
      // 重新绘制；清理函数在 effect 清理时统一处理
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cleanup?.();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const trimmedName = name.trim();
  const canEnter = trimmedName.length > 0 && trimmedName.length <= NAME_MAX;

  // 点击星球：播放音乐并进入名字输入
  const handlePlanetClick = () => {
    if (phase !== "idle") return;
    setPhase("playing");

    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.6;
    // 必须在点击事件的同步调用栈里触发 play()，否则会被浏览器自动播放策略拦截
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch((error) => {
        // 播放失败静默降级：星球照常、名字照填、仍可进入
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

  // 以点击坐标为圆心计算波纹尺寸，scale 0 → 6 爆发
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
      <canvas ref={starsCanvasRef} className={styles.stars} aria-hidden="true" />

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
          className={styles.planetButton}
          onClick={handlePlanetClick}
          aria-label="点击星球，听见波纹大陆"
        >
          <span className={styles.planet} data-phase={phase} />
          <span className={styles.rings} aria-hidden="true">
            <span className={`${styles.ring} ${styles.ringOuter}`} />
            <span className={`${styles.ring} ${styles.ringInner}`} />
          </span>
        </button>

        {/* 波纹震荡环：仅 idle / playing 显示 */}
        {(phase === "idle" || phase === "playing") && (
          <div className={styles.rippleRings} data-phase={phase} aria-hidden="true">
            <span className={styles.rippleRing} />
            <span className={styles.rippleRing} />
            <span className={styles.rippleRing} />
            <span className={styles.rippleRing} />
          </div>
        )}

        <p className={styles.copy}>
          {phase === "idle"
            ? "点击星球，听见波纹大陆"
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
