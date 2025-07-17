import React from 'react';
import styles from './ChevronBadge.module.css';

interface ChevronBadgeProps {
  label: string;
  variant?: 'cyan' | 'magenta';
  size?: 'small' | 'large';
}

export default function ChevronBadge({ label, variant = 'magenta', size = 'large' }: ChevronBadgeProps) {
  return (
    <div className={`${styles.hexagon} ${styles[variant]} ${styles[size]}`}>
      {label}
    </div>
  );
}
