"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: number;
};

/** Inline SVG brand mark — brain + pen + orbit ring */
export function ContentVerseMark({ className, size = 36 }: Props) {
  const uid = useId().replace(/:/g, "");
  const ringId = `cv-ring-${uid}`;
  const brainId = `cv-brain-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect width="48" height="48" rx="12" fill="#0A0A0F" />
      <ellipse
        cx="24"
        cy="24.8"
        rx="18"
        ry="15"
        stroke={`url(#${ringId})`}
        strokeWidth="2"
        opacity="0.95"
      />
      <ellipse
        cx="24"
        cy="24.8"
        rx="12.5"
        ry="10.2"
        fill={`url(#${brainId})`}
        opacity="0.35"
      />
      <path
        d="M15.8 25.8c0-4.8 3.6-8.4 8.2-8.4"
        stroke="#60A5FA"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M32.2 25.8c0-4.8-3.6-8.4-8.2-8.4"
        stroke="#C084FC"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M24 11.7v24.3" stroke="#F8FAFC" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M24 11.7l-3.9 6.6h7.8L24 11.7Z" fill="#F8FAFC" />
      <circle cx="24" cy="20.4" r="1.6" fill="#0A0A0F" stroke="#F8FAFC" strokeWidth="1.1" />
      <path
        d="M10.5 17.2c3.8-3.3 8.7-5.1 13.5-5.1"
        stroke={`url(#${ringId})`}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
      />
      <defs>
        <linearGradient id={ringId} x1="6" y1="9" x2="42" y2="39" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id={brainId} x1="12" y1="15" x2="36" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
    </svg>
  );
}
