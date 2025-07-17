"use client";

import { useEffect, useRef } from "react";
import styles from "./MobileWarning.module.css";

export default function MobileWarning() {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Same dynamic scaling as mogcam.com text
  useEffect(() => {
    const updateScale = () => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      // Reset scale to 1 to measure natural width
      overlay.style.setProperty("--overlay-scale", "1");
      const parentWidth = window.innerWidth;
      const textWidth = overlay.scrollWidth;
      if (textWidth > 0) {
        const scale = parentWidth / textWidth;
        overlay.style.setProperty("--overlay-scale", scale.toString());
      }
    };

    updateScale(); // Initial run
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div className={styles.container}>
      <div
        ref={overlayRef}
        className={styles.warningText}
      >
        vision too big for your screen
      </div>
    </div>
  );
}
