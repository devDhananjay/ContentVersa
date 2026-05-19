import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        gradient:
          "border-transparent bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-white",
        neon: "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan",
        pink: "border-neon-pink/40 bg-neon-pink/10 text-neon-pink",
        orange: "border-neon-orange/40 bg-neon-orange/10 text-neon-orange",
        success: "border-green-500/40 bg-green-500/10 text-green-500",
        warning: "border-yellow-500/40 bg-yellow-500/10 text-yellow-500",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
