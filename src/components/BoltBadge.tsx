import React from 'react';
import { Zap } from 'lucide-react';

interface BoltBadgeProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  size?: 'small' | 'medium' | 'large';
  theme?: 'light' | 'dark';
}

export function BoltBadge({ 
  position = 'top-right', 
  size = 'medium',
  theme = 'light'
}: BoltBadgeProps) {
  // Size mappings
  const sizeClasses = {
    small: {
      badge: 'h-14 w-14',
      innerCircle: 'h-12 w-12',
      text: 'text-[6px]',
      icon: 'h-3 w-3'
    },
    medium: {
      badge: 'h-20 w-20',
      innerCircle: 'h-16 w-16',
      text: 'text-[8px]',
      icon: 'h-5 w-5'
    },
    large: {
      badge: 'h-24 w-24',
      innerCircle: 'h-20 w-20',
      text: 'text-[10px]',
      icon: 'h-6 w-6'
    }
  };

  // Position mappings
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4'
  };

  // Theme mappings
  const themeClasses = {
    light: {
      outerCircle: 'bg-black',
      innerCircle: 'bg-white',
      text: 'text-black',
      icon: 'text-amber-500'
    },
    dark: {
      outerCircle: 'bg-white',
      innerCircle: 'bg-gray-900',
      text: 'text-white',
      icon: 'text-amber-400'
    }
  };

  return (
    <a 
      href="https://github.com/kickiniteasy/bolt-hackathon-badge" 
      target="_blank" 
      rel="noopener noreferrer"
      className={`fixed ${positionClasses[position]} ${sizeClasses[size].badge} rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 z-50 ${themeClasses[theme].outerCircle}`}
      title="Built with Bolt - Hackathon Project"
    >
      <div className={`${sizeClasses[size].innerCircle} rounded-full flex flex-col items-center justify-center ${themeClasses[theme].innerCircle}`}>
        <Zap className={`${sizeClasses[size].icon} ${themeClasses[theme].icon}`} />
        <div className={`${sizeClasses[size].text} font-bold tracking-wider mt-1 ${themeClasses[theme].text}`}>
          BOLT HACKATHON
        </div>
      </div>
    </a>
  );
}