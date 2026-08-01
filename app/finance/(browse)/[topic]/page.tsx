import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MoneyTopicView } from "@/components/finance/money-topic-view";
import {
  getMoneyTopic,
  MONEY_TOPIC_SLUGS,
  moneyTopicPath,
} from "@/lib/finance/money-topics";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export function generateStaticParams() {
  return MONEY_TOPIC_SLUGS.map((topic) => ({ topic }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic: slug } = await params;
  const topic = getMoneyTopic(slug);
  if (!topic) return buildMetadata({ title: "Not found", noIndex: true });

  return buildMetadata({
    title: topic.title,
    description: topic.description,
    path: moneyTopicPath(topic.slug),
    keywords: topic.keywords,
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1600",
  });
}

export default async function FinanceMoneyTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = await params;
  const topic = getMoneyTopic(slug);
  if (!topic) notFound();

  return <MoneyTopicView topic={topic} />;
}
