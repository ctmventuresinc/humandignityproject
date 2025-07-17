"use client";

import styles from "./MobileWarning.module.css";

export default function MobileWarning() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.warningText}>
          <div className={styles.line}>VISION</div>
          <div className={styles.line}>TOO BIG</div>
          <div className={styles.line}>FOR YOUR</div>
          <div className={styles.line}>SCREEN</div>
        </div>
        <div className={styles.subtitle}>
          please visit on a desktop or tablet. thank you.
        </div>
        <div className={styles.dangerText}>
          dangertesting.com
        </div>
      </div>
    </div>
  );
}
