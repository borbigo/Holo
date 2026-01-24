// src/components/common/HoloLogo.js
import React from 'react';
import { Box } from '@mui/material';

const HoloLogo = ({ size = 32 }) => {
  const scale = size / 40; // Base size is 40
  
  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Large sparkle - center */}
        <g transform="translate(20, 18)" filter="url(#glow)">
          <path d="M0 -6L0 6" stroke="url(#silverGrad1)" strokeWidth="2" strokeLinecap="round"/>
          <path d="M-6 0L6 0" stroke="url(#silverGrad1)" strokeWidth="2" strokeLinecap="round"/>
          <path d="M-4.2 -4.2L4.2 4.2" stroke="url(#silverGrad1)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M4.2 -4.2L-4.2 4.2" stroke="url(#silverGrad1)" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="0" cy="0" r="2" fill="url(#centerSilver)"/>
        </g>

        {/* Small sparkle - top right */}
        <g transform="translate(30, 8)" filter="url(#glow)">
          <path d="M0 -3L0 3" stroke="url(#silverGrad2)" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M-3 0L3 0" stroke="url(#silverGrad2)" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M-2 -2L2 2" stroke="url(#silverGrad2)" strokeWidth="0.9" strokeLinecap="round"/>
          <path d="M2 -2L-2 2" stroke="url(#silverGrad2)" strokeWidth="0.9" strokeLinecap="round"/>
          <circle cx="0" cy="0" r="1" fill="url(#centerSilver)"/>
        </g>

        {/* Medium sparkle - bottom left */}
        <g transform="translate(9, 30)" filter="url(#glow)">
          <path d="M0 -4.5L0 4.5" stroke="url(#silverGrad3)" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M-4.5 0L4.5 0" stroke="url(#silverGrad3)" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M-3 -3L3 3" stroke="url(#silverGrad3)" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M3 -3L-3 3" stroke="url(#silverGrad3)" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="0" cy="0" r="1.5" fill="url(#centerSilver)"/>
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="silverGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#E5E5E5" />
            <stop offset="100%" stopColor="#C0C0C0" />
          </linearGradient>
          <linearGradient id="silverGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5E5E5" />
            <stop offset="50%" stopColor="#D0D0D0" />
            <stop offset="100%" stopColor="#B8B8B8" />
          </linearGradient>
          <linearGradient id="silverGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0F0F0" />
            <stop offset="50%" stopColor="#D8D8D8" />
            <stop offset="100%" stopColor="#C0C0C0" />
          </linearGradient>
          <radialGradient id="centerSilver">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E8E8E8" />
            <stop offset="100%" stopColor="#C0C0C0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </Box>
  );
};

export default HoloLogo;