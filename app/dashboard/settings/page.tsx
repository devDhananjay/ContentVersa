"use client";

import * as React from "react";
import { Save } from "lucide-react";
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
  profile?: { bio?: string | null } | null;
};

export default function SettingsPage() {
  const { user } = useSession() as { user: MeUser | null };
  const displayName = user?.name || user?.username || "";
  const displayUsername = user?.username || "";
  const displayImage = user?.image;
  const displayBio = user?.profile?.bio || "";
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
              {displayImage ? (
                <AvatarImage src={displayImage} alt={displayName} />
              ) : null}
              <AvatarFallback>YOU</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">Upload</Button>
              <p className="text-xs text-muted-foreground mt-1">PNG/JPG · max 2MB</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input defaultValue={displayName} />
            </div>
            <div className="space-y-1.5">
              <Label>Username</Label>
              <Input defaultValue={displayUsername} />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>Bio</Label>
              <Textarea defaultValue={displayBio} placeholder="Tell readers about yourself…" />
            </div>
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input placeholder="https://" />
            </div>
            <div className="space-y-1.5">
              <Label>Twitter / X</Label>
              <Input placeholder="@username" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-xl font-bold mb-5">Notifications</h2>
          {[
            { k: "Approvals", d: "When admins decide on your blogs." },
            { k: "Comments", d: "When someone replies to your work." },
            { k: "Followers", d: "When someone follows you." },
            { k: "Tips", d: "When a reader tips you." },
            { k: "Weekly summary", d: "Friday digest of your performance." },
          ].map((row) => (
            <div key={row.k} className="flex items-center justify-between py-3 border-b last:border-0 border-border/40">
              <div>
                <p className="text-sm font-medium">{row.k}</p>
                <p className="text-xs text-muted-foreground">{row.d}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </section>

        <ReferralCard />

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-xl font-bold mb-5">Payouts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Payout email</Label>
              <Input type="email" placeholder="payouts@yourbrand.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Default currency</Label>
              <Input defaultValue="INR" />
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

        <div className="flex justify-end">
          <Button variant="gradient" className="gap-2">
            <Save className="h-4 w-4" /> Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
