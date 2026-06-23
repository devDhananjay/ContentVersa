"use client";

import { forwardRef, type ReactNode } from "react";
import { Button, type ButtonProps } from "react-aria-components";
import { cn } from "@/lib/utils";

type A11yFabProps = ButtonProps & {
  isActive?: boolean;
  variant?: "screen-reader" | "color-vision";
  children: ReactNode;
};

export const A11yFab = forwardRef<HTMLButtonElement, A11yFabProps>(function A11yFab(
  { isActive = false, variant = "color-vision", className, children, ...props },
  ref
) {
  return (
    <Button
      {...props}
      ref={ref}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full text-white shadow-neon",
        "transition-transform hover:scale-105 pressed:scale-95",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variant === "color-vision"
          ? "bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink"
          : "bg-gradient-to-br from-neon-cyan via-neon-blue to-neon-purple",
        isActive && "ring-2 ring-white/80 ring-offset-2 ring-offset-background",
        className
      )}
    >
      {children}
    </Button>
  );
});
