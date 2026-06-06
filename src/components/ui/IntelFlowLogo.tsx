import React from 'react';

interface IntelFlowLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function IntelFlowLogo({ size = 24, className = "", ...props }: IntelFlowLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Modern, premium geometric 'iF' emblem representing IntelFlow */}
      {/* Dot of the 'i' */}
      <circle cx="7" cy="4.5" r="2" fill="currentColor" />
      
      {/* Stem of the 'i' */}
      <path
        d="M5 9C5 7.9 5.9 7 7 7H7C8.1 7 9 7.9 9 9V19C9 20.1 8.1 21 7 21H7C5.9 21 5 20.1 5 19V9Z"
        fill="currentColor"
      />
      
      {/* Top bar of 'F' */}
      <path
        d="M12 9C12 7.9 12.9 7 14 7H19.5C20.33 7 21 7.67 21 8.5V8.5C21 9.33 20.33 10 19.5 10H12V9Z"
        fill="currentColor"
        opacity="0.9"
      />
      
      {/* Middle bar of 'F' */}
      <path
        d="M12 13.5C12 12.4 12.9 11.5 14 11.5H17.5C18.33 11.5 19 12.17 19 13V13C19 13.83 18.33 14.5 17.5 14.5H12V13.5Z"
        fill="currentColor"
        opacity="0.75"
      />
    </svg>
  );
}
