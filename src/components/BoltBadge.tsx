import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface BoltBadgeProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  size?: 'small' | 'medium' | 'large';
}

export function BoltBadge({ 
  position = 'top-right', 
  size = 'medium'
}: BoltBadgeProps) {
  const { theme } = useTheme();
  
  // Size mappings
  const sizeClasses = {
    small: {
      badge: 'h-12 w-12',
      icon: 'h-6 w-6'
    },
    medium: {
      badge: 'h-16 w-16',
      icon: 'h-8 w-8'
    },
    large: {
      badge: 'h-20 w-20',
      icon: 'h-10 w-10'
    }
  };

  // Position mappings
  const positionClasses = {
    'top-right': 'top-20 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <a 
      href="https://bolt.new/" 
      target="_blank" 
      rel="noopener noreferrer"
      className={`fixed ${positionClasses[position]} ${sizeClasses[size].badge} rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700`}
      title="Built with Bolt - AI-powered full-stack development"
    >
      <div className={`${sizeClasses[size].icon} text-white`}>
        {theme === 'dark' ? (
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0.00 0.00 360.00 360.00">
            <g stroke-width="2.00" fill="none" stroke-linecap="butt">
              <path stroke="#808080" vector-effect="non-scaling-stroke" d="
                M 157.16 30.43
                Q 156.89 30.47 156.31 29.70
                Q 152.60 24.79 148.38 19.28
                A 0.44 0.43 65.9 0 0 147.97 19.12
                L 142.57 19.93
                A 0.10 0.10 0.0 0 0 142.51 20.10
                L 155.01 35.78
                A 2.13 2.05 22.5 0 1 155.45 36.79
                L 156.87 46.25
                A 0.68 0.68 0.0 0 0 157.53 46.82
                Q 157.54 46.82 159.54 46.53
                Q 161.54 46.23 161.55 46.23
                A 0.68 0.68 0.0 0 0 162.01 45.49
                L 160.64 36.02
                A 2.13 2.05 -39.3 0 1 160.77 34.93
                L 168.21 16.31
                A 0.10 0.10 0.0 0 0 168.11 16.16
                L 162.70 16.95
                A 0.44 0.43 -82.7 0 0 162.36 17.22
                Q 159.91 23.71 157.77 29.49
                Q 157.44 30.39 157.16 30.43"
              />
            </g>
            <path fill="#000000" d="
              M 185.47 0.00
              Q 186.22 0.33 186.77 0.00
              Q 186.85 0.01 186.93 0.00
              Q 254.56 3.48 302.60 48.15
              Q 347.77 90.14 357.94 152.33
              Q 358.56 156.13 359.08 161.91
              Q 359.51 166.72 360.00 171.51
              L 360.00 171.88
              Q 359.68 173.21 360.00 174.49
              L 360.00 185.40
              Q 358.14 236.68 331.13 277.88
              Q 307.38 314.11 271.23 335.24
              Q 239.27 353.92 202.45 358.47
              Q 195.38 359.34 188.25 360.00
              Q 188.18 359.99 188.12 360.00
              Q 186.79 359.68 185.52 360.00
              L 174.53 360.00
              Q 173.82 359.70 173.28 360.00
              L 172.86 360.00
              Q 161.01 359.10 157.75 358.68
              Q 107.13 352.11 67.79 320.70
              C 29.54 290.16 5.96 246.46 0.84 197.92
              C 0.56 195.26 0.47 191.33 0.00 188.06
              Q 0.00 187.97 0.00 187.88
              Q 0.33 186.65 0.00 185.51
              L 0.00 174.57
              Q 0.32 173.74 0.00 172.99
              L 0.00 172.62
              Q 0.23 172.50 0.15 172.25
              Q 2.47 122.74 28.97 81.98
              C 61.07 32.62 114.97 2.17 174.43 0.00
              L 185.47 0.00
              Z"
            />
          </svg>
        ) : (
          <Zap className="w-full h-full" />
        )}
      </div>
    </a>
  );
}