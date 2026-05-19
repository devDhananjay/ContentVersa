import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, Globe, Twitter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/blog-card";
import { AUTHORS, BLOGS } from "@/lib/data/blogs";
import { formatNumber, getInitials } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return AUTHORS.map((a) => ({ username: a.username }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = AUTHORS.find((a) => a.username === username);
  return buildMetadata({
    title: user ? `@${user.username}` : "Profile",
    description: user?.bio,
    path: `/profile/${username}`,
    image: user?.avatar,
  });
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = AUTHORS.find((a) => a.username === username);
  if (!user) return notFound();
  const blogs = BLOGS.filter((b) => b.author.username === user.username);

  return (
    <div>
      <div className="relative h-56 md:h-72 overflow-hidden bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-pink/20">
        <div className="absolute inset-0 grid-noise opacity-30" />
      </div>
      <div className="container -mt-20 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex items-end gap-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink blur opacity-40" />
              <Avatar className="relative h-32 w-32 border-4 border-background">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="pb-2">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
                  {user.name}
                </h1>
                {user.verified && <BadgeCheck className="h-6 w-6 text-neon-cyan" />}
              </div>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Message</Button>
            <Button variant="gradient">Follow</Button>
          </div>
        </div>

        <div className="mt-6 max-w-2xl">
          <p className="text-lg text-foreground/90">{user.bio}</p>
        </div>

        <div className="mt-6 grid grid-cols-3 max-w-md gap-4">
          <div>
            <p className="font-display text-2xl font-extrabold">
              {formatNumber(user.followers)}
            </p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold">{user.blogs}</p>
            <p className="text-xs text-muted-foreground">Blogs</p>
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold">
              {formatNumber(blogs.reduce((s, b) => s + b.views, 0))}
            </p>
            <p className="text-xs text-muted-foreground">Total views</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Badge variant="neon" className="gap-1.5">
            <Twitter className="h-3 w-3" /> @{user.username}
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <Globe className="h-3 w-3" /> {user.username}.dev
          </Badge>
        </div>

        <div className="mt-12">
          <h2 className="font-display text-2xl font-extrabold tracking-tight mb-6">
            Posts by {user.name.split(" ")[0]}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {blogs.length > 0 ? (
              blogs.map((b, i) => <BlogCard key={b.id} blog={b} index={i} />)
            ) : (
              <p className="text-muted-foreground col-span-3">
                {user.name} hasn&apos;t published anything yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
