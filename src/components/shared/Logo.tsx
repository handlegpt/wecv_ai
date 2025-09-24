"use client";
import React from "react";
import { useTheme } from "next-themes";

interface LogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
  startColor?: string;
  endColor?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 100,
  className = "",
  onClick,
  startColor,
  endColor,
}) => {
  const { theme } = useTheme();

  // 默认使用主题色
  const defaultStartColor = theme === "dark" ? "#A700FF" : "#000000";
  const defaultEndColor = theme === "dark" ? "#4F46E5" : "#171717";

  // 使用传入的颜色或默认颜色
  const gradientStartColor = startColor || defaultStartColor;
  const gradientEndColor = endColor || defaultEndColor;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="WeCV Logo"
      onClick={onClick}
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradientStartColor} />
          <stop offset="100%" stopColor={gradientEndColor} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 背景圆角矩形 */}
      <rect
        x="5"
        y="5"
        width="90"
        height="90"
        rx="24"
        fill="url(#gradient)"
        filter="url(#glow)"
      />

      {/* WeCV 图标 - 文档和简历的抽象设计 */}
      <g transform="translate(25, 25)">
        {/* 文档主体 */}
        <rect
          x="0"
          y="8"
          width="30"
          height="35"
          rx="2"
          fill="white"
          opacity="0.9"
        />
        
        {/* 文档折角 */}
        <path
          d="M25 8 L35 8 L35 18 L25 8"
          fill="white"
          opacity="0.7"
        />
        
        {/* 文档内容线条 */}
        <rect x="6" y="18" width="18" height="2" rx="1" fill={gradientStartColor} opacity="0.6" />
        <rect x="6" y="22" width="15" height="2" rx="1" fill={gradientStartColor} opacity="0.4" />
        <rect x="6" y="26" width="12" height="2" rx="1" fill={gradientStartColor} opacity="0.3" />
        <rect x="6" y="30" width="16" height="2" rx="1" fill={gradientStartColor} opacity="0.5" />
        
        {/* 装饰性元素 - 代表AI/智能 */}
        <circle cx="40" cy="15" r="3" fill="white" opacity="0.8" />
        <circle cx="40" cy="15" r="1.5" fill={gradientStartColor} />
      </g>
    </svg>
  );
};

export default Logo;
