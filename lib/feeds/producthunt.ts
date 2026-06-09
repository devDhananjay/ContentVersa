import type { FeedItem } from "./types";
import { getProductHuntToken } from "./producthunt-token";

type PhPost = {
  name: string;
  tagline: string;
  description: string;
  votesCount: number;
  website: string;
  thumbnail?: { url: string } | null;
};

export async function fetchProductHuntFeed(limit = 8): Promise<FeedItem[]> {
  const token = await getProductHuntToken();
  if (!token) return [];

  const res = await fetch("https://api.producthunt.com/v2/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `{
        posts(first: ${limit}, order: VOTES) {
          edges {
            node {
              id
              name
              tagline
              description
              votesCount
              website
              thumbnail { url }
            }
          }
        }
      }`,
    }),
    next: { revalidate: 900 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as {
    data?: { posts?: { edges?: { node: PhPost & { id: string } }[] } };
  };

  return (data.data?.posts?.edges ?? []).map(({ node }) => ({
    id: node.id,
    title: node.name,
    externalUrl: node.website || "https://www.producthunt.com",
    subtitle: node.tagline,
    description: node.description || node.tagline,
    meta: node.votesCount ? `${node.votesCount} votes` : undefined,
    image: node.thumbnail?.url,
  }));
}
