import React from 'react';
import styles from './ChevronBadge.module.css';

interface ChevronBadgeProps {
  label: string;
  variant?: 'cyan' | 'magenta';
  size?: 'small' | 'large';
}

export default function ChevronBadge({ label, variant = 'magenta', size = 'large' }: ChevronBadgeProps) {
  const sizeConfig = {
    small: { fontSize: 20, padding: 20 },
    large: { fontSize: 26, padding: 30 }
  };

  const colorConfig = {
    cyan: {
      text: '#00e1ff',
      background: '#182C5B',
      stroke1: '#225398',
      stroke2: '#85E7F7',
      stroke3: '#1A4293'
    },
    magenta: {
      text: '#FFFFFF',
      background: '#8819A2',
      stroke1: '#BF29E0',
      stroke2: '#E97AF8',
      stroke3: '#B929DC'
    }
  };

  const config = sizeConfig[size];
  const colors = colorConfig[variant];
  
  // Calculate dimensions based on text and padding
  const baseWidth = 131;
  const baseHeight = 42;
  const strokeCount = 3; // three strokes
  const stroke1Width = 4; // +2 thicker
  const stroke2Width = 7; // +5 thicker  
  const stroke3Width = 5; // +3 thicker
  const totalStrokeWidth = stroke1Width + stroke2Width + stroke3Width;
  
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
        {/* Stroke 3 (outermost) */}
        <path 
          d={`M${10 + totalStrokeWidth} ${46 + totalStrokeWidth}L${-6 + totalStrokeWidth} ${20 + totalStrokeWidth}L${9 + totalStrokeWidth} ${-6 + totalStrokeWidth}H${122 + totalStrokeWidth}L${137 + totalStrokeWidth} ${20 + totalStrokeWidth}L${121 + totalStrokeWidth} ${46 + totalStrokeWidth}H${10 + totalStrokeWidth}Z`}
          fill="none"
          stroke={colors.stroke3}
          strokeWidth={stroke3Width}
        />
        
        {/* Stroke 2 */}
        <path 
          d={`M${12.5 + totalStrokeWidth} ${44 + totalStrokeWidth}L${-2 + totalStrokeWidth} ${20 + totalStrokeWidth}L${11.5 + totalStrokeWidth} ${-2 + totalStrokeWidth}H${119.5 + totalStrokeWidth}L${133 + totalStrokeWidth} ${20 + totalStrokeWidth}L${118.5 + totalStrokeWidth} ${44 + totalStrokeWidth}H${12.5 + totalStrokeWidth}Z`}
          fill="none"
          stroke={colors.stroke2}
          strokeWidth={stroke2Width}
        />
        
        {/* Stroke 1 with background */}
        <path 
          d={`M${15.5 + totalStrokeWidth} ${41 + totalStrokeWidth}L${1 + totalStrokeWidth} ${20 + totalStrokeWidth}L${14.5 + totalStrokeWidth} ${1 + totalStrokeWidth}H${115 + totalStrokeWidth}L${129.5 + totalStrokeWidth} ${20 + totalStrokeWidth}L${114 + totalStrokeWidth} ${41 + totalStrokeWidth}H${15.5 + totalStrokeWidth}Z`}
          fill={colors.background}
          stroke={colors.stroke1}
          strokeWidth={stroke1Width}
        />
        
        {/* Text with neon glow */}
        <defs>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <text 
          x={centerX} 
          y={centerY} 
          textAnchor="middle" 
          dominantBaseline="middle"
          fill={colors.text}
          fontSize={config.fontSize}
          fontFamily="Inter, sans-serif"
          fontWeight="700"
          letterSpacing="0.05em"
          style={{ textTransform: 'uppercase' }}
          filter="url(#neonGlow)"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
