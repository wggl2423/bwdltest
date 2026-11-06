"use client";

import { useState } from "react";
import { comicIssues, type ComicIssue } from "@/lib/data";
import PlaceholderImage from "./PlaceholderImage";
import styles from "./BubbleSection.module.css";

export default function BubbleSection() {
  const [activeIssue, setActiveIssue] = useState<ComicIssue | null>(null);

  if (activeIssue) {
    return (
      <div className={styles.reader}>
        <button
          type="button"
          className={styles.back}
          onClick={() => setActiveIssue(null)}
        >
          ← 返回列表
        </button>

        <h3 className={styles.issueTitle}>
          {activeIssue.week} · {activeIssue.title}
        </h3>

        <div className={styles.pages}>
          {activeIssue.pages.map((page, index) => (
            <div key={page} className={styles.page}>
              <PlaceholderImage
                src={page}
                alt={`${activeIssue.title} 第 ${index + 1} 页`}
                label="条漫占位"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {comicIssues.map((issue) => (
        <li key={issue.id}>
          <button
            type="button"
            className={styles.item}
            onClick={() => setActiveIssue(issue)}
          >
            <span className={styles.week}>{issue.week}</span>
            <span className={styles.title}>{issue.title}</span>
            <span className={styles.pageCount}>{issue.pages.length} 页</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
