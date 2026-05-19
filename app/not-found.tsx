import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-neon-cyan">
        404
      </p>
      <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight mt-3">
        <span className="text-gradient">Page slipped</span> into the void.
      </h1>
      <p className="text-muted-foreground mt-4 max-w-md mx-auto">
        We can&apos;t find the page you were looking for. It may have moved, or never existed in this timeline.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link href="/">
          <Button variant="gradient" size="lg">Back home</Button>
        </Link>
        <Link href="/blogs">
          <Button variant="outline" size="lg">Browse articles</Button>
        </Link>
      </div>
    </div>
  );
}
