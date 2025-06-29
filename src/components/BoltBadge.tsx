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
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${sizeClasses[size].icon} text-white`}>
        {/* PASTE YOUR BOLT-BLACK.SVG CONTENT HERE */}
        {/* Remove the outer <svg> tags and just paste the inner content */}
        
        {/* Placeholder bolt icon - replace with your SVG content */}
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    </a>
  );
}