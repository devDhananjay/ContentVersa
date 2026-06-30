import Link from "next/link";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";

/** Server-rendered editorial copy on the homepage for crawlers and quality review. */
export function HomeEditorialSection() {
  return (
    <section className="container py-12 md:py-16">
      <HubEditorialIntro title="What is ContentVerse?">
        <p>
          ContentVerse is an India-first publishing platform where writers, journalists, and
          creators publish long-form articles, tutorials, and opinion pieces in English and Hindi.
          Unlike short-form feeds built only for scrolling, we focus on depth: thoughtful essays,
          explainers, and reporting that readers bookmark and share.
        </p>
        <p>
          Our editorial team and community moderators review submissions before they go live.
          We remove plagiarism, spam, and low-effort AI dumps. Creators who meet our quality bar
          can join the{" "}
          <Link href="/creator-program" className="text-primary underline-offset-4 hover:underline">
            Creator Program
          </Link>{" "}
          and earn through tips, featured placement, and transparent analytics.
        </p>
        <p>
          Browse{" "}
          <Link href="/blogs" className="text-primary underline-offset-4 hover:underline">
            original articles
          </Link>{" "}
          across technology, finance, lifestyle, sports, and careers. Live cricket scores, market
          data, and job listings complement our writing — they are utilities for readers, not
          standalone pages we ask search engines to rank. Our{" "}
          <Link href="/policy" className="text-primary underline-offset-4 hover:underline">
            Content Policy
          </Link>{" "}
          explains what we publish and what we do not.
        </p>
      </HubEditorialIntro>
    </section>
  );
}
