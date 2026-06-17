"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  username: string;
  /** DB user id — follow only works when set */
  targetUserId?: string | null;
  initialFollowerCount?: number;
  className?: string;
};

export function FollowButton({
  username,
  targetUserId,
  initialFollowerCount = 0,
  className,
}: Props) {
  const router = useRouter();
  const [following, setFollowing] = React.useState(false);
  const [followerCount, setFollowerCount] = React.useState(initialFollowerCount);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [signedIn, setSignedIn] = React.useState(true);
  const [isSelf, setIsSelf] = React.useState(false);

  React.useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }
    fetch(`/api/users/${encodeURIComponent(username)}/follow`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(
        (data: {
          following?: boolean;
          followerCount?: number;
          signedIn?: boolean;
          isSelf?: boolean;
        }) => {
          if (typeof data.following === "boolean") setFollowing(data.following);
          if (typeof data.followerCount === "number") {
            setFollowerCount(data.followerCount);
          }
          if (data.signedIn === false) setSignedIn(false);
          if (data.isSelf) setIsSelf(true);
        }
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username, targetUserId]);

  const toggle = async () => {
    if (!targetUserId) return;
    if (!signedIn) {
      router.push(`/sign-in?next=/profile/${encodeURIComponent(username)}`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        `/api/users/${encodeURIComponent(username)}/follow`,
        { method: "POST", credentials: "include" }
      );
      const data = (await res.json()) as {
        following?: boolean;
        followerCount?: number;
        error?: string;
      };
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/sign-in?next=/profile/${encodeURIComponent(username)}`);
        }
        return;
      }
      if (typeof data.following === "boolean") setFollowing(data.following);
      if (typeof data.followerCount === "number") {
        setFollowerCount(data.followerCount);
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  if (!targetUserId) {
    return (
      <Button variant="gradient" className={className} disabled title="Demo profile">
        Follow
      </Button>
    );
  }

  if (isSelf) return null;

  return (
    <div className={className}>
      <Button
        type="button"
        variant={following ? "outline" : "gradient"}
        className="gap-2 min-w-[120px]"
        disabled={loading || busy}
        onClick={toggle}
      >
        {busy || loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : following ? (
          <>
            <UserCheck className="h-4 w-4" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Follow
          </>
        )}
      </Button>
      <p className="text-[10px] text-muted-foreground mt-1 text-center sr-only">
        {followerCount} followers
      </p>
    </div>
  );
}
