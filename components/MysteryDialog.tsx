"use client";

import { useEffect, useRef } from "react";
import type { Nation } from "@/lib/data";
import { LockIcon } from "./Icons";
import styles from "./MysteryDialog.module.css";

type MysteryDialogProps = {
  nation: Nation;
  onClose: () => void;
};

export default function MysteryDialog({ nation, onClose }: MysteryDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className={styles.overlay}>
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mystery-title"
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="关闭浮层"
        >
          ×
        </button>

        <p className={styles.eyebrow}>{nation.name}</p>

        <div className={styles.lockBox} aria-hidden="true">
          <LockIcon />
        </div>

        <h2 className={styles.title} id="mystery-title">
          惊喜待解锁
        </h2>

        {nation.id === "mystery" && (
          <p className={styles.copy}>这里还藏着什么？敬请期待</p>
        )}
      </div>
    </div>
  );
}
