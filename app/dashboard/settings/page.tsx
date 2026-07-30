"use client";

import * as React from "react";
import { Loader2, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/components/auth/use-session";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ReferralCard } from "@/components/engagement/referral-card";

type MeUser = {
  name?: string;
  username?: string;
  email?: string;
  image?: string;
  payoutEmail?: string | null;
  currency?: string | null;
  profile?: {
    bio?: string | null;
    website?: string | null;
    twitter?: string | null;
  } | null;
};

const NOTIF_KEYS = [
  { k: "approvals", label: "Approvals", d: "When admins decide on your blogs." },
  { k: "comments", label: "Comments", d: "When someone replies to your work." },
  { k: "followers", label: "Followers", d: "When someone follows you." },
  { k: "tips", label: "Tips", d: "When a reader tips you." },
  { k: "weekly", label: "Weekly summary", d: "Friday digest of your performance." },
] as const;

type NotifKey = (typeof NOTIF_KEYS)[number]["k"];

function loadNotifPrefs(): Record<NotifKey, boolean> {
  const defaults = {
    approvals: true,
    comments: true,
    followers: true,
    tips: true,
    weekly: true,
  };
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem("cv_notif_prefs");
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export default function SettingsPage() {
  const { user, loading: sessionLoading } = useSession() as {
    user: MeUser | null;
    loading: boolean;
  };

  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [twitter, setTwitter] = React.useState("");
  const [image, setImage] = React.useState<string | null>(null);
  const [payoutEmail, setPayoutEmail] = React.useState("");
  const [currency, setCurrency] = React.useState("INR");
  const [notifs, setNotifs] = React.useState<Record<NotifKey, boolean>>(loadNotifPrefs);

  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [hydrated, setHydrated] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!user || hydrated) return;
    setName(user.name || "");
    setUsername(user.username || "");
    setBio(user.profile?.bio || "");
    setWebsite(user.profile?.website || "");
    setTwitter(user.profile?.twitter ? `@${user.profile.twitter.replace(/^@/, "")}` : "");
    setImage(user.image || null);
    setPayoutEmail(user.payoutEmail || user.email || "");
    setCurrency(user.currency || "INR");
    setHydrated(true);
  }, [user, hydrated]);

  React.useEffect(() => {
    setNotifs(loadNotifPrefs());
  }, []);

  const initials = (name || username || "YOU")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function onUpload(file: File) {
    setError(null);
    setMessage(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose a PNG or JPG image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }
      setImage(data.url);
      setMessage("Photo uploaded — click Save changes to keep it.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      localStorage.setItem("cv_notif_prefs", JSON.stringify(notifs));

      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          bio: bio.trim() || null,
          website: website.trim() || null,
          twitter: twitter.trim() || null,
          image,
          payoutEmail: payoutEmail.trim() || null,
          currency: currency === "USD" ? "USD" : "INR",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Could not save");
      }
      setMessage("Profile saved.");
      setHydrated(false);
      window.dispatchEvent(new Event("cv:session-refresh"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (sessionLoading && !user) {
    return (
      <div className="container py-16 max-w-3xl flex justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-16 max-w-3xl text-center">
        <h1 className="font-display text-2xl font-bold">Sign in required</h1>
        <p className="text-muted-foreground mt-2">
          Log in to manage your ContentVerse profile.
        </p>
        <Button asChild className="mt-6" variant="gradient">
          <a href="/auth/sign-in?next=/dashboard/settings">Sign in</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
        Settings
      </h1>
      <p className="text-muted-foreground mt-1">
        Manage your profile, payouts and platform preferences.
      </p>

      <div className="mt-8 space-y-6">
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-xl font-bold mb-5">Profile</h2>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              {image ? <AvatarImage src={image} alt={name || username} /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onUpload(file);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {uploading ? "Uploading…" : "Upload"}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">PNG/JPG · max 2MB</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="settings-name">Name</Label>
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-username">Username</Label>
              <Input
                id="settings-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="settings-bio">Bio</Label>
              <Textarea
                id="settings-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell readers about yourself…"
                maxLength={500}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-website">Website</Label>
              <Input
                id="settings-website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-twitter">Twitter / X</Label>
              <Input
                id="settings-twitter"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="@username"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-xl font-bold mb-5">Notifications</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Saved on this device for now.
          </p>
          {NOTIF_KEYS.map((row) => (
            <div
              key={row.k}
              className="flex items-center justify-between py-3 border-b last:border-0 border-border/40"
            >
              <div>
                <p className="text-sm font-medium">{row.label}</p>
                <p className="text-xs text-muted-foreground">{row.d}</p>
              </div>
              <Switch
                checked={notifs[row.k]}
                onCheckedChange={(v) =>
                  setNotifs((prev) => ({ ...prev, [row.k]: v }))
                }
              />
            </div>
          ))}
        </section>

        <ReferralCard />

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-xl font-bold mb-5">Payouts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="settings-payout-email">Payout email</Label>
              <Input
                id="settings-payout-email"
                type="email"
                value={payoutEmail}
                onChange={(e) => setPayoutEmail(e.target.value)}
                placeholder="payouts@yourbrand.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-currency">Default currency</Label>
              <Input
                id="settings-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-destructive/20 bg-card p-6">
          <h2 className="font-display text-xl font-bold mb-2">Account</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Sign out of ContentVerse on this device.
          </p>
          <SignOutButton
            variant="outline"
            className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
          />
        </section>

        {(error || message) && (
          <p
            className={`text-sm ${error ? "text-destructive" : "text-emerald-400"}`}
            role="status"
          >
            {error || message}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="gradient"
            className="gap-2"
            disabled={saving || uploading}
            onClick={() => void onSave()}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
