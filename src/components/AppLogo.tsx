import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
  idPrefix?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  className = "w-full h-full", 
  size = 512,
  idPrefix = "app-logo"
}) => {
  const warmGradId = `${idPrefix}-warmGrad`;
  const darkFlowId = `${idPrefix}-darkFlow`;
  const amberGlowId = `${idPrefix}-amberGlow`;
  const squircleClipId = `${idPrefix}-squircleClip`;

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      width={size} 
      height={size}
      className={className}
      aria-label="Ehsaan Flow Brand Logo"
    >
      <defs>
        {/* Base diagonal background gradient matching brand colour science */}
        <linearGradient id={warmGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#562814" />
          <stop offset="25%" stopColor="#6d3319" />
          <stop offset="50%" stopColor="#99481d" />
          <stop offset="75%" stopColor="#cb6222" />
          <stop offset="100%" stopColor="#ea7d27" />
        </linearGradient>

        {/* Top-left deep mocha organic wave */}
        <radialGradient id={darkFlowId} cx="25%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#3e1a0b" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#4a200f" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#4a200f" stopOpacity="0" />
        </radialGradient>

        {/* Bottom luminous warm amber glow */}
        <radialGradient id={amberGlowId} cx="75%" cy="85%" r="60%">
          <stop offset="0%" stopColor="#f59436" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#eb7e27" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#cb6222" stopOpacity="0" />
        </radialGradient>

        {/* Squircle clip path */}
        <clipPath id={squircleClipId}>
          <rect width="512" height="512" rx="116" />
        </clipPath>
      </defs>

      {/* Squircle container with clipped organic layers */}
      <g clipPath={`url(#${squircleClipId})`}>
        {/* Base gradient */}
        <rect width="512" height="512" fill={`url(#${warmGradId})`} />

        {/* Organic curved flow shadows & luminous amber waves */}
        <path d="M -20,-20 L 532,-20 L 532,230 C 440,310 330,390 170,380 C 70,374 -20,310 -20,310 Z" fill={`url(#${darkFlowId})`} />
        
        <path d="M -20,270 C 80,320 180,410 340,350 C 420,320 480,250 532,240 L 532,532 L -20,532 Z" fill={`url(#${amberGlowId})`} />

        {/* Soft organic highlight curve */}
        <path d="M 0,380 Q 200,480 512,320 L 512,512 L 0,512 Z" fill="#eb7e27" opacity="0.25" />
      </g>

      {/* The Exact White Brand Emblem */}
      {/* 1. Stylized Tilted Leaf */}
      <path 
        d="M 218,272 C 197,240 200,196 238,180 C 265,168 293,167 314,174 C 315,175 315,177 313,179 C 306,211 298,252 227,273 Z" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="23" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* 2. Leaf Center Vein */}
      <path 
        d="M 224,252 C 238,230 256,214 274,206" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="22" 
        strokeLinecap="round" 
      />

      {/* 3. Bottom Flow Wave / Stem */}
      <path 
        d="M 175,326 C 182,308 196,277 221,273 C 248,269 275,301 300,323 C 316,336 333,336 346,327" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="23" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};
