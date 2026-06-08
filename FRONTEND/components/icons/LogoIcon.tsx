import React from 'react';

export const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"/>
    <path d="M8 6V4"/><path d="M16 6V4"/><path d="M12 11h.01"/><path d="M12 16h.01"/>
    <path d="M8 11h.01"/><path d="M8 16h.01"/><path d="M16 11h.01"/><path d="M16 16h.01"/>
  </svg>
);