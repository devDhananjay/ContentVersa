"use client";

import * as React from "react";
import Image from "next/image";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/data/categories";
import { BLOGS } from "@/lib/data/blogs";

export default function AdminCategoriesPage() {
  const [q, setQ] = React.useState("");
  const filtered = CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Categories
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage taxonomy and subcategories for the platform.
          </p>
        </div>
        <Button variant="gradient" className="gap-1.5">
          <Plus className="h-4 w-4" /> New category
        </Button>
      </div>

      <Input
        placeholder="Search categories…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-6 max-w-sm"
      />

      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground bg-muted/40">
            <tr>
              <th className="p-4">Category</th>
              <th className="p-4">Subcategories</th>
              <th className="p-4">Posts</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const count = BLOGS.filter((b) => b.category === c.slug).length;
              return (
                <tr key={c.slug} className="border-t border-border/40 text-sm">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-14 rounded-md overflow-hidden">
                        <Image src={c.banner} alt={c.name} fill sizes="56px" className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-xs text-muted-foreground">/{c.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {c.subcategories.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                      {c.subcategories.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{c.subcategories.length - 3}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-semibold">{count}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
