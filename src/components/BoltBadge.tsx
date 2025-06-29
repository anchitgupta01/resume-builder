import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function BoltBadge() {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Add a small delay before showing the badge for a smooth appearance
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`fixed top-20 right-4 z-40 transition-all duration-300 ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'
      }`}
    >
      <a
        href="https://github.com/kickiniteasy/bolt-hackathon-badge"
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:scale-105 transition-transform duration-200"
        title="Built with Bolt"
      >
        <div className="relative w-16 h-16 drop-shadow-lg hover:drop-shadow-xl transition-all duration-200">
          {/* Black circle background with white inner circle */}
          <svg
            width="60"
            height="60"
            viewBox="0 0 360 360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer black circle */}
            <circle cx="180" cy="180" r="180" fill="#000000"/>
            
            {/* White inner circle */}
            <circle cx="180" cy="180" r="150" fill="#FFFFFF"/>
            
            {/* Lightning bolt */}
            <path
              d="M180 80L120 180H160L140 280L200 180H160L180 80Z"
              fill="#000000"
            />
            <path
              d="M175 90L125 175H155L145 265L195 175H165L175 90Z"
              fill="#FFD700"
            />
            
            {/* Text */}
            <text
              x="180"
              y="250"
              textAnchor="middle"
              fill="#000000"
              fontFamily="Arial, sans-serif"
              fontSize="24"
              fontWeight="bold"
            >
              BOLT
            </text>
            <text
              x="180"
              y="280"
              textAnchor="middle"
              fill="#000000"
              fontFamily="Arial, sans-serif"
              fontSize="16"
            >
              HACKATHON
            </text>
          </svg>
        </div>
      </a>
    </div>
  );
}