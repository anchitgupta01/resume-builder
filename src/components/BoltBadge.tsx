import React from 'react';
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
      badge: 'h-14 w-14',
      innerCircle: 'h-12 w-12',
      svg: 'h-8 w-8'
    },
    medium: {
      badge: 'h-20 w-20',
      innerCircle: 'h-16 w-16',
      svg: 'h-12 w-12'
    },
    large: {
      badge: 'h-24 w-24',
      innerCircle: 'h-20 w-20',
      svg: 'h-16 w-16'
    }
  };

  // Position mappings
  const positionClasses = {
    'top-right': 'top-12 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4'
  };

  // Theme-based SVG selection
  const svgPath = theme === 'dark' ? '/src/assets/botl-white.svg' : '/src/assets/bolt-black.svg';

  return (
    <a 
      href="https://bolt.new/" 
      target="_blank" 
      rel="noopener noreferrer"
      className={`fixed ${positionClasses[position]} ${sizeClasses[size].badge} rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 z-50 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700`}
      title="Built with Bolt"
    >
      <div className={`${sizeClasses[size].innerCircle} rounded-full flex items-center justify-center`}>
        <img 
          src={svgPath} 
          alt="Bolt Logo" 
          className={`${sizeClasses[size].svg} object-contain`}
        />
      </div>
    </a>
  );
}