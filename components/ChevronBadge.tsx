import React from 'react';
import styles from './ChevronBadge.module.css';

interface ChevronBadgeProps {
  label: string;
  variant?: 'cyan' | 'magenta';
  size?: 'small' | 'large';
}

export default function ChevronBadge({ label, variant = 'magenta', size = 'large' }: ChevronBadgeProps) {
  const sizeConfig = {
    small: { fontSize: 14, padding: 20 },
    large: { fontSize: 18, padding: 30 }
  };

  const colors = {
    cyan: '#00e1ff',
    magenta: '#d400ff'
  };

  const config = sizeConfig[size];
  const textColor = colors[variant];
  
  // Calculate dimensions based on text and padding
  const baseWidth = 131;
  const baseHeight = 42;
  const strokeCount = 2; // yellow + red
  const strokeWidth = 2;
  const totalStrokeWidth = strokeCount * strokeWidth;
  
  const svgWidth = baseWidth + (totalStrokeWidth * 2);
  const svgHeight = baseHeight + (totalStrokeWidth * 2);
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  return (
    <div className={`${styles.hexagon} ${styles[size]}`}>
      <svg 
        width={svgWidth} 
        height={svgHeight} 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        fill="none"
      >
        {/* Base hexagon with yellow stroke */}
        <path 
          d={`M${15.5 + totalStrokeWidth} ${41 + totalStrokeWidth}L${1 + totalStrokeWidth} ${20 + totalStrokeWidth}L${14.5 + totalStrokeWidth} ${1 + totalStrokeWidth}H${115 + totalStrokeWidth}L${129.5 + totalStrokeWidth} ${20 + totalStrokeWidth}L${114 + totalStrokeWidth} ${41 + totalStrokeWidth}H${15.5 + totalStrokeWidth}Z`}
          fill="#1a237e"
          stroke="#FFFF00"
          strokeWidth="2"
        />
        
        {/* Red outer stroke */}
        <path 
          d={`M${13.5 + totalStrokeWidth} ${43 + totalStrokeWidth}L${-1 + totalStrokeWidth} ${20 + totalStrokeWidth}L${12.5 + totalStrokeWidth} ${-1 + totalStrokeWidth}H${117 + totalStrokeWidth}L${131.5 + totalStrokeWidth} ${20 + totalStrokeWidth}L${116 + totalStrokeWidth} ${43 + totalStrokeWidth}H${13.5 + totalStrokeWidth}Z`}
          fill="none"
          stroke="#FF0000"
          strokeWidth="2"
        />
        
        {/* Text */}
        <text 
          x={centerX} 
          y={centerY} 
          textAnchor="middle" 
          dominantBaseline="middle"
          fill={textColor}
          fontSize={config.fontSize}
          fontFamily="Inter, sans-serif"
          fontWeight="700"
          letterSpacing="0.05em"
          style={{ textTransform: 'uppercase' }}
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
