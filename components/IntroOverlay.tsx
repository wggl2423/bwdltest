"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MESSAGES_KEY, type Message } from "@/lib/data";
import styles from "./IntroOverlay.module.css";

type Phase = "idle" | "playing" | "entering" | "done";

type IntroOverlayProps = {
  onDone: () => void;
};

const NAME_MAX = 12;
const RIPPLE_MS = 800;
const FADE_MS = 300;
const MAX_METEORS = 12;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Message[]) : [];
  } catch {
    return [];
  }
}

function formatTime(ts: number) {
  const date = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** canvas 绘制浅色星空：白 + 粉色小点，低透明度，缓慢闪烁 */
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
  const count = isMobile ? 40 : 70;

  const stars = Array.from({ length: count }, () => {
    const usePink = Math.random() > 0.5;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.1 + 0.3,
      baseAlpha: Math.random() * 0.25 + 0.15,
      phase: Math.random() * Math.PI * 2,
      pink: usePink,
    };
  });

  let raf = 0;

  const render = (t: number) => {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const alpha = s.baseAlpha + Math.sin(t * 0.0008 + s.phase) * 0.12;
      const a = Math.max(0.05, Math.min(0.4, alpha));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.pink
        ? `rgba(232, 180, 184, ${a})`
        : `rgba(255, 255, 255, ${a})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(render);
  };

  raf = requestAnimationFrame(render);
  return () => cancelAnimationFrame(raf);
}

type MeteorParams = {
  angle: number; // 极角（弧度），限制在上半圆 + 两侧
  radius: number; // 距星球中心的倍数（1.4–2.2）
  dx: number;
  dy: number;
  duration: number;
  delay: number;
};

/** 流星位置用极坐标：距星球中心 1.4–2.2 倍半径，角度限制在上半圆和左右两侧 */
function makeMeteorParams(count: number): MeteorParams[] {
  return Array.from({ length: count }, () => {
    // 角度范围：-225° 到 45°（即上半圆 + 左右两侧，下半圆留空）
    const angleDeg = -225 + Math.random() * 270;
    const angle = (angleDeg * Math.PI) / 180;
    return {
      angle,
      radius: 1.4 + Math.random() * 0.8,
      dx: (Math.random() - 0.5) * 80,
      dy: (Math.random() - 0.5) * 80,
      duration: 24 + Math.random() * 16,
      delay: Math.random() * 8,
    };
  });
}

export default function IntroOverlay({ onDone }: IntroOverlayProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [name, setName] = useState("");
  const [ripple, setRipple] = useState<{
    x: number;
    y: number;
    size: number;
  } | null>(null);
  const [activeMeteor, setActiveMeteor] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const enterButtonRef = useRef<HTMLButtonElement>(null);
  const starsCanvasRef = useRef<HTMLCanvasElement>(null);

  // 读取 localStorage 留言（与你说我听共享同一份数据）
  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  // canvas 星空
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const cleanup = drawStars(canvas);
    const handleResize = () => {
      cleanup?.();
      drawStars(canvas);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cleanup?.();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const trimmedName = name.trim();
  const canEnter = trimmedName.length > 0 && trimmedName.length <= NAME_MAX;

  // 流星数据：取最新 12 条；无留言时用 4–6 颗装饰流星
  const visibleMessages = useMemo(
    () => [...messages].sort((a, b) => b.createdAt - a.createdAt).slice(0, MAX_METEORS),
    [messages]
  );

  const meteorCount = visibleMessages.length > 0 ? visibleMessages.length : 5;
  const meteorParams = useMemo(
    () => makeMeteorParams(meteorCount),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [meteorCount]
  );

  const handlePlanetClick = () => {
    if (phase !== "idle") return;
    setPhase("playing");
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.6;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch((error) => {
        console.error("背景音乐播放失败，已降级为静音模式", error);
      });
    }
  };

  const handleSkip = () => {
    if (phase === "entering" || phase === "done") return;
    audioRef.current?.pause();
    setPhase("playing");
  };

  const handleAudioError = () => {
    console.error("背景音乐加载失败，已降级为静音模式");
  };

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const rect = enterButtonRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    beginEntering(x, y);
  };

  useEffect(() => {
    if (phase !== "entering") return;
    const timer = window.setTimeout(
      () => setPhase("done"),
      prefersReducedMotion() ? 0 : RIPPLE_MS
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

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
      onClick={() => setActiveMeteor(null)}
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

        {/* 流星环绕区：相对星球定位 */}
        <div className={styles.planetStage}>
          {/* 流星 */}
          <div className={styles.meteorField} aria-hidden={activeMeteor === null}>
            {meteorParams.map((p, i) => {
              const msg = visibleMessages[i];
              const isActive = activeMeteor === (msg?.id ?? `decor-${i}`);
              const preview = msg
                ? msg.content.length > 60
                  ? msg.content.slice(0, 60) + "…"
                  : msg.content
                : "";
              return (
                <div
                  key={msg?.id ?? `decor-${i}`}
                  className={`${styles.meteor} ${msg ? "" : styles.meteorDecor}`}
                  style={{
                    ["--angle" as string]: `${p.angle}rad`,
                    ["--radius" as string]: `${p.radius}`,
                    ["--dx" as string]: `${p.dx}px`,
                    ["--dy" as string]: `${p.dy}px`,
                    ["--dur" as string]: `${p.duration}s`,
                    ["--delay" as string]: `${p.delay}s`,
                  }}
                  onClick={(e) => {
                    if (!msg) return;
                    e.stopPropagation();
                    setActiveMeteor(isActive ? null : msg.id);
                  }}
                >
                  <span className={styles.meteorCore} />
                  <span className={styles.meteorTail} />
                  {msg && isActive && (
                    <div className={styles.bubble} onClick={(e) => e.stopPropagation()}>
                      <div className={styles.bubbleHead}>
                        <span className={styles.bubbleName}>{msg.name}</span>
                        <span className={styles.bubbleTime}>{formatTime(msg.createdAt)}</span>
                      </div>
                      <p className={styles.bubbleContent}>{preview}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className={styles.planetButton}
            onClick={handlePlanetClick}
            aria-label="点击星球，听见波纹大陆"
          >
            <span className={styles.planetWrap} data-phase={phase}>
              {/* 星环后半段（在星球之下）：SVG 上半弧 */}
              <svg
                className={styles.ringsSvg}
                data-side="back"
                viewBox="0 0 200 200"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="ringBackGrad"
                    x1="0"
                    y1="0"
                    x2="200"
                    y2="0"
                    gradientUnits="userSpaceOnUse"
                    className={styles.gradFlow}
                  >
                    <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
                    <stop offset="50%" stopColor="rgba(232,180,184,0.22)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.16)" />
                  </linearGradient>
                </defs>
                <path
                  d="M -32 100 A 132 42 0 0 0 232 100"
                  transform="rotate(-18 100 100)"
                  fill="none"
                  stroke="url(#ringBackGrad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  className={styles.ringBack}
                />
                <path
                  d="M -22 100 A 122 39 0 0 0 222 100"
                  transform="rotate(-14 100 100)"
                  fill="none"
                  stroke="url(#ringBackGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className={styles.ringBack}
                />
                <path
                  d="M -42 100 A 142 46 0 0 0 242 100"
                  transform="rotate(-22 100 100)"
                  fill="none"
                  stroke="url(#ringBackGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className={`${styles.ringBack} ${styles.ringThinPath}`}
                />
              </svg>

              {/* 星球本体：三层叠加 */}
              <span className={styles.planet}>
                {/* 第 1 层 球体底 */}
                <span className={styles.planetBase} />
                {/* 第 2 层 程序化噪声纹理（feTurbulence） */}
                <svg
                  className={styles.planetTexture}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <filter id="planet-texture">
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.008 0.015"
                        numOctaves="4"
                        seed="7"
                        result="noise"
                      />
                      <feColorMatrix
                        type="matrix"
                        values="0.91 0 0 0 0
                                0 0.55 0 0 0
                                0 0 0.60 0 0
                                0.5 0 0 0 0.15"
                        result="colored"
                      />
                      <feGaussianBlur stdDeviation="0.6" />
                    </filter>
                    <filter id="planet-texture-mobile">
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.008 0.015"
                        numOctaves="3"
                        seed="7"
                        result="noise"
                      />
                      <feColorMatrix
                        type="matrix"
                        values="0.91 0 0 0 0
                                0 0.55 0 0 0
                                0 0 0.60 0 0
                                0.5 0 0 0 0.15"
                        result="colored"
                      />
                      <feGaussianBlur stdDeviation="0.6" />
                    </filter>
                  </defs>
                  <rect
                    className={styles.textureRect}
                    width="100"
                    height="100"
                    fill="white"
                    filter="url(#planet-texture)"
                  />
                  <rect
                    className={styles.textureRectMobile}
                    width="100"
                    height="100"
                    fill="white"
                    filter="url(#planet-texture-mobile)"
                  />
                </svg>

                {/* 赤道带 */}
                <span className={styles.equatorBand} aria-hidden="true" />

                {/* 涡旋点 */}
                <span
                  className={styles.vortex}
                  style={{
                    top: "32%",
                    left: "30%",
                    width: "16%",
                    height: "14%",
                    borderRadius: "42% 58% 63% 37% / 45% 40% 60% 55%",
                  }}
                  aria-hidden="true"
                />
                <span
                  className={styles.vortex}
                  style={{
                    top: "55%",
                    left: "58%",
                    width: "14%",
                    height: "16%",
                    borderRadius: "58% 42% 37% 63% / 55% 60% 40% 45%",
                  }}
                  aria-hidden="true"
                />
                <span
                  className={styles.vortex}
                  style={{
                    top: "68%",
                    left: "28%",
                    width: "12%",
                    height: "13%",
                    borderRadius: "50% 50% 45% 55% / 60% 45% 55% 40%",
                  }}
                  aria-hidden="true"
                />
                {/* 第 3 层 星点 */}
                <span className={styles.planetStars} aria-hidden="true">
                  <span className={styles.starDot} style={{ top: "18%", left: "28%" }} />
                  <span className={`${styles.starDot} ${styles.starGlow}`} style={{ top: "24%", left: "58%" }} />
                  <span className={styles.starDot} style={{ top: "34%", left: "42%" }} />
                  <span className={styles.starDot} style={{ top: "42%", left: "72%" }} />
                  <span className={styles.starDot} style={{ top: "52%", left: "22%" }} />
                  <span className={`${styles.starDot} ${styles.starGlow}`} style={{ top: "58%", left: "50%" }} />
                  <span className={styles.starDot} style={{ top: "64%", left: "78%" }} />
                  <span className={styles.starDot} style={{ top: "70%", left: "34%" }} />
                  <span className={styles.starDot} style={{ top: "30%", left: "82%" }} />
                  <span className={`${styles.starDot} ${styles.starGlow}`} style={{ top: "76%", left: "60%" }} />
                  <span className={styles.starDot} style={{ top: "46%", left: "14%" }} />
                  <span className={styles.starDot} style={{ top: "82%", left: "44%" }} />
                  <span className={styles.starDot} style={{ top: "20%", left: "70%" }} />
                  <span className={styles.starDot} style={{ top: "60%", left: "12%" }} />
                  <span className={styles.starDot} style={{ top: "38%", left: "56%" }} />
                </span>
                {/* 云层 */}
                <span className={styles.cloud} style={{ top: "22%", left: "18%", ["--cd" as string]: "0s" }} />
                <span className={`${styles.cloud} ${styles.cloudAlt}`} style={{ top: "54%", left: "52%", ["--cd" as string]: "-4s" }} />
                <span className={styles.cloud} style={{ top: "72%", left: "28%", ["--cd" as string]: "-8s" }} />
              </span>

              {/* 星环前半段（在星球之上）：SVG 下半弧 + 环带阴影 */}
              <svg
                className={styles.ringsSvg}
                data-side="front"
                viewBox="0 0 200 200"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="ringFrontGrad"
                    x1="0"
                    y1="0"
                    x2="200"
                    y2="0"
                    gradientUnits="userSpaceOnUse"
                    className={styles.gradFlow}
                  >
                    <stop offset="0%" stopColor="rgba(212,138,143,0.35)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.55)" />
                    <stop offset="100%" stopColor="rgba(212,138,143,0.35)" />
                  </linearGradient>
                </defs>
                {/* 环带阴影：星球表面环带穿过区域的暗带，只在前半部分 */}
                <path
                  d="M -32 100 A 132 42 0 0 1 232 100"
                  transform="rotate(-18 100 100)"
                  fill="none"
                  stroke="rgba(160,90,100,0.12)"
                  strokeWidth="14"
                  className={styles.ringShadow}
                />
                {/* 前半环 */}
                <path
                  d="M -32 100 A 132 42 0 0 1 232 100"
                  transform="rotate(-18 100 100)"
                  fill="none"
                  stroke="url(#ringFrontGrad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  className={styles.ringFront}
                />
                <path
                  d="M -22 100 A 122 39 0 0 1 222 100"
                  transform="rotate(-14 100 100)"
                  fill="none"
                  stroke="url(#ringFrontGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className={styles.ringFront}
                />
                <path
                  d="M -42 100 A 142 46 0 0 1 242 100"
                  transform="rotate(-22 100 100)"
                  fill="none"
                  stroke="url(#ringFrontGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className={`${styles.ringFront} ${styles.ringThinPath}`}
                />
              </svg>
            </span>
          </button>
        </div>

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
