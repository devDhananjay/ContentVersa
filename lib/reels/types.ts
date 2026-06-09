export type ReelAuthor = {
  id: string;
  name: string;
  username: string;
  image: string | null;
  isVerified: boolean;
};

export type ReelItem = {
  id: string;
  caption: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  mediaType: "IMAGE" | "VIDEO";
  durationSec: number | null;
  views: number;
  likesCount: number;
  commentsCount: number;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  author: ReelAuthor;
  categorySlug: string | null;
};

export type ReelDashboardRow = {
  id: string;
  caption: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  mediaType: "IMAGE" | "VIDEO";
  views: number;
  likesCount: number;
  status: string;
  publishedAt: string | null;
  createdAt: string;
};
