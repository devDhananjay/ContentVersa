import type { FeedItemStats } from "./stats";

export interface FeedItem {
  id: string;
  title: string;
  externalUrl: string;
  subtitle?: string;
  description?: string;
  meta?: string;
  stats?: FeedItemStats;
  image?: string;
}

export type { FeedItemStats };

export interface FeedItemDetail extends FeedItem {
  category: string;
  gallery?: string[];
  topics?: string[];
}

export interface CategoryFeed {
  slug: string;
  title: string;
  subtitle: string;
  items: FeedItem[];
  updatedAt: string;
}
