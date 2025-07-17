import React from 'react';
import clsx from 'clsx';
import styles from './ChevronBadge.module.css';

/**
 * ChevronBadge – neon chevron label usable as small cyan tag or large magenta nameplate
 *
 * @param {string}  label   Text inside the badge
 * @param {'cyan'|'magenta'} variant Color preset (defaults to magenta)
 * @param {'small'|'large'}  size    Dimension preset (defaults to large)
 */
interface ChevronBadgeProps {
  label: string;
  variant?: 'cyan' | 'magenta';
  size?: 'small' | 'large';
}

export default function ChevronBadge({ label, variant = 'magenta', size = 'large' }: ChevronBadgeProps) {
  return (
    <span className={clsx(styles.chevronBadge, styles[variant], styles[size])}>
      {label}
    </span>
  );
}
