"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function CMSSettingsPage() {
  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
        CMS settings
      </h1>
      <p className="text-muted-foreground mt-1">
        Control homepage sections, banners and trending logic.
      </p>

      <div className="mt-8 space-y-6">
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-xl font-bold mb-5">Site identity</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Site title</Label>
              <Input defaultValue="ContentVerse" />
            </div>
            <div className="space-y-1.5">
              <Label>Tagline</Label>
              <Input defaultValue="Read. Create. Grow." />
            </div>
            <div className="space-y-1.5">
              <Label>Default meta description</Label>
              <Textarea defaultValue="ContentVerse is the next-generation creator platform for blogs and content." />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-xl font-bold mb-5">Homepage sections</h2>
          {[
            "Hero",
            "Trending Articles",
            "Featured Creators",
            "Popular Categories",
            "AI Recommended Reads",
            "Latest Blogs",
            "Editor's Pick",
            "Community Posts",
            "Weekly Trending",
            "Newsletter",
            "Testimonials",
          ].map((s) => (
            <div key={s} className="flex items-center justify-between py-3 border-b last:border-0 border-border/40">
              <Label>{s}</Label>
              <Switch defaultChecked />
            </div>
          ))}
        </section>

        <section className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Trending logic</h2>
          <div className="space-y-1.5">
            <Label>Trending threshold (likes/24h)</Label>
            <Input type="number" defaultValue={500} />
          </div>
          <div className="space-y-1.5">
            <Label>Refresh interval (minutes)</Label>
            <Input type="number" defaultValue={15} />
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-xl font-bold mb-5">Announcement banner</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Banner message</Label>
              <Input placeholder="Drop a platform-wide announcement…" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show banner</Label>
              <Switch />
            </div>
          </div>
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
