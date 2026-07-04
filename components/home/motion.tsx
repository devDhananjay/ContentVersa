"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: easeOut } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.65, ease: easeOut },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

/** Scroll-triggered reveal for homepage sections. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 40,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

/** Stagger children on scroll. */
export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}

/** Soft floating orbs behind hero / sections. */
export function FloatingOrbs({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn("absolute inset-0 -z-10 overflow-hidden pointer-events-none", className)}
      aria-hidden
    >
      <motion.div
        className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-neon-blue/30 via-neon-purple/25 to-neon-pink/20 blur-3xl"
        animate={
          reduce
            ? undefined
            : { scale: [1, 1.08, 1], opacity: [0.45, 0.7, 0.45] }
        }
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-32 left-[5%] h-64 w-64 rounded-full bg-neon-purple/25 blur-3xl"
        animate={reduce ? undefined : { y: [0, -24, 0], x: [0, 12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-20 right-[8%] h-72 w-72 rounded-full bg-neon-cyan/20 blur-3xl"
        animate={reduce ? undefined : { y: [0, 20, 0], x: [0, -16, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-0 left-[20%] h-48 w-48 rounded-full bg-neon-pink/15 blur-3xl"
        animate={reduce ? undefined : { scale: [1, 1.15, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}

/** Subtle grid that drifts for depth. */
export function AnimatedGrid({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={cn(
        "absolute inset-0 -z-10 grid-noise opacity-25 pointer-events-none",
        className
      )}
      animate={reduce ? undefined : { backgroundPosition: ["0px 0px", "40px 40px"] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
  );
}
