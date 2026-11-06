"use client";

import { useEffect, useMemo, useState } from "react";
import { MESSAGES_KEY, type Message } from "@/lib/data";
import styles from "./ListenSection.module.css";

const MAX_LENGTH = 200;
const MAX_METEORS = 20; // 同时显示的流星上限
const MOBILE_MAX_METEORS = 12;
const PREVIEW_CHARS = 60;

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

/** 为每条留言生成固定的流星漂移参数（useMemo 锁定，避免 re-render 跳动） */
type MeteorParams = {
  top: number;
  left: number;
  dx: number;
  dy: number;
  duration: number;
  delay: number;
};

function makeMeteorParams(messages: Message[], max: number): MeteorParams[] {
  return messages.slice(0, max).map(() => ({
    top: 10 + Math.random() * 75,
    left: 10 + Math.random() * 75,
    dx: (Math.random() - 0.5) * 160,
    dy: (Math.random() - 0.5) * 160,
    duration: 20 + Math.random() * 20,
    delay: Math.random() * 10,
  }));
}

export default function ListenSection() {
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 挂载时从 localStorage 读取留言（正式版需替换为后端接口）
  useEffect(() => {
    setMessages(loadMessages());
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const trimmed = content.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= MAX_LENGTH;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    const name = localStorage.getItem("visitorName") || "旅人";
    const message: Message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      content: trimmed,
      createdAt: Date.now(),
    };

    const next = [message, ...messages];
    setMessages(next);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(next));
    setContent("");
  };

  const handleDelete = (id: string) => {
    const next = messages.filter((message) => message.id !== id);
    setMessages(next);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(next));
    if (activeId === id) setActiveId(null);
  };

  const charCount = content.length;
  const overLimit = charCount > MAX_LENGTH;

  // 按时间倒序
  const sorted = useMemo(
    () => [...messages].sort((a, b) => b.createdAt - a.createdAt),
    [messages]
  );

  const maxMeteors = isMobile ? MOBILE_MAX_METEORS : MAX_METEORS;
  const visible = sorted.slice(0, maxMeteors);
  const overflow = sorted.slice(maxMeteors);

  // 流星参数固定
  const meteors = useMemo(
    () => makeMeteorParams(visible, maxMeteors),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible.map((m) => m.id).join(","), isMobile]
  );

  // 新提交的留言 id（用于飞入动画）
  const newestId = sorted[0]?.id;

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="写下你想说的话"
          maxLength={MAX_LENGTH}
          rows={4}
        />

        <div className={styles.formRow}>
          <span className={`${styles.counter} ${overLimit ? styles.over : ""}`}>
            {charCount} / {MAX_LENGTH}
          </span>

          <button
            type="submit"
            className={styles.submit}
            disabled={!canSubmit}
          >
            留下留言
          </button>
        </div>
      </form>

      <div className={styles.starField} onClick={() => setActiveId(null)}>
        {sorted.length === 0 && (
          <div className={styles.emptyHint}>还没有留言，来说点什么吧</div>
        )}

        {visible.map((message, i) => {
          const params = meteors[i];
          if (!params) return null;
          const isNew = message.id === newestId;
          const isActive = activeId === message.id;
          const preview =
            message.content.length > PREVIEW_CHARS
              ? message.content.slice(0, PREVIEW_CHARS) + "…"
              : message.content;

          return (
            <div
              key={message.id}
              className={`${styles.meteor} ${isNew ? styles.meteorNew : ""}`}
              style={{
                top: `${params.top}%`,
                left: `${params.left}%`,
                ["--dx" as string]: `${params.dx}px`,
                ["--dy" as string]: `${params.dy}px`,
                ["--dur" as string]: `${params.duration}s`,
                ["--delay" as string]: `${params.delay}s`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveId(isActive ? null : message.id);
              }}
              onMouseEnter={() => !isMobile && setActiveId(message.id)}
              onMouseLeave={() => !isMobile && setActiveId(null)}
            >
              <span className={styles.meteorCore} />
              <span className={styles.meteorTail} />

              {isActive && (
                <div className={styles.bubble} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.bubbleHead}>
                    <span className={styles.bubbleName}>{message.name}</span>
                    <span className={styles.bubbleTime}>
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  {/* 用 React 文本插值渲染，禁止 dangerouslySetInnerHTML */}
                  <p className={styles.bubbleContent}>{preview}</p>
                  <button
                    type="button"
                    className={styles.bubbleDelete}
                    onClick={() => handleDelete(message.id)}
                  >
                    删除
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {overflow.length > 0 && (
          <button
            type="button"
            className={styles.viewAll}
            onClick={(e) => {
              e.stopPropagation();
              setShowAll((v) => !v);
            }}
          >
            {showAll ? "收起" : `查看全部留言（${overflow.length}）`}
          </button>
        )}
      </div>

      {showAll && overflow.length > 0 && (
        <ul className={styles.overflowList}>
          {overflow.map((message) => (
            <li key={message.id} className={styles.item}>
              <div className={styles.itemHead}>
                <span className={styles.name}>{message.name}</span>
                <span className={styles.time}>{formatTime(message.createdAt)}</span>
              </div>
              <p className={styles.itemContent}>{message.content}</p>
              <button
                type="button"
                className={styles.delete}
                onClick={() => handleDelete(message.id)}
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
