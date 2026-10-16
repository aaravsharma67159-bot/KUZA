import React from 'react';

export interface KuzaMonogramProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  fillColor?: string; // defaults to 'currentColor'
  title?: string;
}

/**
 * Official KŪZA Monogram SVG Component
 * Vector geometry: 233.9 × 203.39 (Adobe Illustrator 30.8.1 official export)
 */
export const KuzaMonogram: React.FC<KuzaMonogramProps> = ({
  className = 'w-6 h-6',
  fillColor = 'currentColor',
  title = 'KŪZA Monogramme Officiel',
  ...props
}) => {
  return (
    <svg
      id="Calque_1"
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 233.9 203.39"
      className={className}
      role="img"
      aria-label={title}
      {...props}
    >
      {title && <title>{title}</title>}
      <line
        stroke={fillColor}
        strokeWidth="1.2"
        x1="101.03"
        y1="79.94"
        x2="100.08"
        y2="80.83"
      />
      <path
        fill={fillColor}
        d="M101.03,79.94c-.25.36-.57.66-.95.89l.95-.89Z"
      />
      <path
        fill={fillColor}
        d="M166.53,73.12v2.8c.48-.12.98-.18,1.49-.18,3.81,0,6.9,3.35,6.9,7.48v49.06c0,22.36-26.95,33.65-42.88,17.97l-48.44-47.66,25.56-23.98c4.04-3.79,10.65-.92,10.65,4.61v46.74l13.93,13.7v-61.15c0-3.83,3.1-6.93,6.93-6.93.16,0,.31,0,.46.02v-2.52h-41.4v2.23c1.09.49,1.85,1.58,1.85,2.85,0,.67-.21,1.28-.56,1.79-.25.36-.57.66-.95.89,0,0,0,0,0,0l-30.85,28.9v-46.84c0-.8.18-1.59.57-2.29,0,0,0,0,0-.01,1.56-2.84,4.59-4.76,8.06-4.76.44,0,.88.03,1.3.09v-2.81h-34.53v2.81c.42-.06.86-.09,1.3-.09,3.47,0,6.49,1.92,8.06,4.76,0,0,0,0,0,.01.39.7.57,1.49.57,2.29v80.38c0,.78-.2,1.55-.58,2.23-1.56,2.84-4.59,4.76-8.06,4.76-.44,0-.88-.03-1.3-.09v2.81h34.53v-2.81c-.42.06-.86.09-1.3.09-1.74,0-3.36-.48-4.75-1.32-1.38-.83-2.53-2.02-3.31-3.44-.38-.68-.58-1.45-.58-2.23v-27.21l5.06-4.75h0s43.58,42.87,43.58,42.87c23.26,22.88,62.59,6.4,62.59-26.23v-44.75c0-4.13,3.09-7.48,6.9-7.48.51,0,1.01.06,1.49.18v-2.8h-22.32Z"
      />
      <rect
        fill={fillColor}
        x="99.74"
        y="53.11"
        width="89.12"
        height="5.53"
      />
    </svg>
  );
};
