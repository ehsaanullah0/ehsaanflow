import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number | string;
  onClick?: () => void;
  title?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'w-full h-full',
  size,
  onClick,
  title = 'Ehsaan Flow',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
      width={size}
      height={size}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label={title}
    >
      {/* Background: Deep solid brown squircle */}
      <rect width="512" height="512" rx="136" fill="#823b28" />

      {/* Inner peach squircle / circular container */}
      <rect x="72" y="72" width="368" height="368" rx="150" fill="#df734c" />

      {/* Exact Brand Leaf Sprig: 5-leaflet sprig with lime stem and bold black outlines */}
      <g transform="translate(256, 260) rotate(42) scale(1.22)">
        {/* 1. Five Pointed Green Leaflets with Bold Black Outlines */}
        {/* Lower Left Leaf */}
        <g transform="translate(-26, 26) rotate(-55)">
          <path
            d="M 0,0 C -26,-20 -26,-58 0,-82 C 26,-58 26,-20 0,0 Z"
            fill="#0cb62c"
            stroke="#000000"
            strokeWidth="16"
            strokeLinejoin="round"
          />
          {/* Lime base junction */}
          <path d="M 0,0 C -12,-8 -12,-20 0,-30 C 12,-20 12,-8 0,0 Z" fill="#b4ea17" />
        </g>

        {/* Lower Right Leaf */}
        <g transform="translate(26, 26) rotate(68)">
          <path
            d="M 0,0 C -26,-20 -26,-58 0,-82 C 26,-58 26,-20 0,0 Z"
            fill="#0cb62c"
            stroke="#000000"
            strokeWidth="16"
            strokeLinejoin="round"
          />
          {/* Lime base junction */}
          <path d="M 0,0 C -12,-8 -12,-20 0,-30 C 12,-20 12,-8 0,0 Z" fill="#b4ea17" />
        </g>

        {/* Upper Left Leaf */}
        <g transform="translate(-24, -38) rotate(-42)">
          <path
            d="M 0,0 C -26,-21 -26,-60 0,-84 C 26,-60 26,-21 0,0 Z"
            fill="#0cb62c"
            stroke="#000000"
            strokeWidth="16"
            strokeLinejoin="round"
          />
          {/* Lime base junction */}
          <path d="M 0,0 C -12,-8 -12,-20 0,-30 C 12,-20 12,-8 0,0 Z" fill="#b4ea17" />
        </g>

        {/* Upper Right Leaf */}
        <g transform="translate(24, -38) rotate(45)">
          <path
            d="M 0,0 C -26,-21 -26,-60 0,-84 C 26,-60 26,-21 0,0 Z"
            fill="#0cb62c"
            stroke="#000000"
            strokeWidth="16"
            strokeLinejoin="round"
          />
          {/* Lime base junction */}
          <path d="M 0,0 C -12,-8 -12,-20 0,-30 C 12,-20 12,-8 0,0 Z" fill="#b4ea17" />
        </g>

        {/* Top Terminal Leaf */}
        <g transform="translate(0, -90) rotate(0)">
          <path
            d="M 0,0 C -27,-22 -27,-63 0,-88 C 27,-63 27,-22 0,0 Z"
            fill="#0cb62c"
            stroke="#000000"
            strokeWidth="16"
            strokeLinejoin="round"
          />
          {/* Lime base junction */}
          <path d="M 0,0 C -12,-8 -12,-22 0,-32 C 12,-22 12,-8 0,0 Z" fill="#b4ea17" />
        </g>

        {/* 2. Bold Black Outline of Stem & Side Branches */}
        {/* Main stem with natural curved base hook */}
        <path
          d="M -18,122 C -12,112 0,90 0,65 L 0,-92"
          fill="none"
          stroke="#000000"
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lower side branches */}
        <path
          d="M 0,35 L -35,20"
          fill="none"
          stroke="#000000"
          strokeWidth="26"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 0,35 L 35,22"
          fill="none"
          stroke="#000000"
          strokeWidth="26"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Upper side branches */}
        <path
          d="M 0,-25 L -32,-42"
          fill="none"
          stroke="#000000"
          strokeWidth="26"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 0,-25 L 32,-42"
          fill="none"
          stroke="#000000"
          strokeWidth="26"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3. Inner Vibrant Lime Stem Layered on Top */}
        <path
          d="M -18,122 C -12,112 0,90 0,65 L 0,-92"
          fill="none"
          stroke="#b4ea17"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 0,35 L -35,20"
          fill="none"
          stroke="#b4ea17"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 0,35 L 35,22"
          fill="none"
          stroke="#b4ea17"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 0,-25 L -32,-42"
          fill="none"
          stroke="#b4ea17"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 0,-25 L 32,-42"
          fill="none"
          stroke="#b4ea17"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
