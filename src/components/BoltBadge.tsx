import React from 'react';

export function BoltBadge() {
  return (
    <div className="fixed top-20 right-4 z-40 hover:scale-105 transition-transform duration-200">
      <a
        href="https://github.com/kickiniteasy/bolt-hackathon-badge"
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        title="Built with Bolt"
      >
        <svg
          width="60"
          height="60"
          viewBox="0 0 360 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg hover:drop-shadow-xl transition-all duration-200"
        >
          <circle cx="180" cy="180" r="180" fill="#000000"/>
          <path
            d="M180 60C263.529 60 330 126.471 330 210C330 293.529 263.529 360 180 360C96.4711 360 30 293.529 30 210C30 126.471 96.4711 60 180 60Z"
            fill="#000000"
          />
          <path
            d="M180 80C252.091 80 310 137.909 310 210C310 282.091 252.091 340 180 340C107.909 340 50 282.091 50 210C50 137.909 107.909 80 180 80Z"
            fill="#FFFFFF"
          />
          <g transform="translate(90, 120)">
            {/* Bolt Lightning Icon */}
            <path
              d="M100 0L60 60H80L40 120L80 60H60L100 0Z"
              fill="#000000"
            />
            <path
              d="M95 5L65 55H75L45 105L75 65H65L95 5Z"
              fill="#FFD700"
            />
          </g>
          <text
            x="180"
            y="250"
            textAnchor="middle"
            className="fill-black font-bold text-lg"
            fontSize="24"
            fontFamily="Arial, sans-serif"
          >
            BOLT
          </text>
          <text
            x="180"
            y="280"
            textAnchor="middle"
            className="fill-black font-medium text-sm"
            fontSize="16"
            fontFamily="Arial, sans-serif"
          >
            HACKATHON
          </text>
        </svg>
      </a>
    </div>
  );
}