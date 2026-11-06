"use client";

import { useEffect, useMemo, useState } from "react";
import { MESSAGES_KEY, type Message } from "@/lib/data";
import styles from "./ListenSection.module.css";

const MAX_LENGTH = 200;
const MAX_LIST = 20;

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

export default function ListenSection() {
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAll, setShowAll] = useState(false);

  // 挂载时从 localStorage 读取留言
  // 正式版需接入后端或表单服务
  useEffect(() => {
    setMessages(loadMessages());
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
  };

  const charCount = content.length;
  const overLimit = charCount > MAX_LENGTH;

  const sorted = useMemo(
    () => [...messages].sort((a, b) => b.createdAt - a.createdAt),
    [messages]
  );

  const visible = showAll ? sorted : sorted.slice(0, MAX_LIST);
  const hasMore = sorted.length > MAX_LIST;

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

      {sorted.length === 0 ? (
        <div className={styles.empty}>还没有留言，来说点什么吧</div>
      ) : (
        <ul className={styles.list}>
          {visible.map((message) => (
            <li key={message.id} className={styles.item}>
              <div className={styles.itemHead}>
                <span className={styles.name}>{message.name}</span>
                <span className={styles.time}>{formatTime(message.createdAt)}</span>
              </div>
              {/* 用 React 文本插值渲染，禁止 dangerouslySetInnerHTML */}
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

      {hasMore && (
        <button
          type="button"
          className={styles.viewAll}
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? "收起" : `查看全部留言（${sorted.length}）`}
        </button>
      )}
    </div>
  );
}
