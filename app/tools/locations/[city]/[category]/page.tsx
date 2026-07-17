import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NearbyPlacesTool } from "@/components/tools/nearby-places-tool";
import {
  LOCATION_CATEGORIES,
  LOCATION_CITIES,
  PLACE_CATEGORY_META,
  getCityBySlug,
  type PlaceCategory,
} from "@/lib/tools/places";
import { buildMetadata } from "@/lib/seo";
import { TOOLS_HUB_PATH } from "@/lib/tools/registry";

type Props = { params: Promise<{ city: string; category: string }> };

export function generateStaticParams() {
  return LOCATION_CITIES.flatMap((city) =>
    LOCATION_CATEGORIES.map((category) => ({
      city: city.slug,
      category,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, category } = await params;
  const cityDef = getCityBySlug(city);
  const cat = category as PlaceCategory;
  if (!cityDef || !LOCATION_CATEGORIES.includes(cat as (typeof LOCATION_CATEGORIES)[number])) {
    return {};
  }
  const label = PLACE_CATEGORY_META[cat].label;
  const title = `Nearby ${label} in ${cityDef.name} India`;
  return buildMetadata({
    title,
    description: `Find ${label.toLowerCase()} near ${cityDef.name}, India. Free nearby search with ratings and map links.`,
    path: `${TOOLS_HUB_PATH}/locations/${city}/${category}`,
    keywords: [
      `${label.toLowerCase()} near ${cityDef.name}`,
      `nearby ${label.toLowerCase()} ${cityDef.name}`,
      `${cityDef.name} ${category}`,
    ],
  });
}

export default async function LocationPlacesPage({ params }: Props) {
  const { city, category } = await params;
  const cityDef = getCityBySlug(city);
  const cat = category as PlaceCategory;
  if (!cityDef || !LOCATION_CATEGORIES.includes(cat as (typeof LOCATION_CATEGORIES)[number])) {
    notFound();
  }

  const label = PLACE_CATEGORY_META[cat].label;

  return (
    <div className="container space-y-6 py-8 md:py-10">
      <header className="max-w-3xl space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">India Tools · Locations</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Nearby {label} in {cityDef.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Search {label.toLowerCase()} around {cityDef.name}. You can also use &quot;Near me&quot; on the
          tool for GPS-based results.
        </p>
        <p className="text-sm">
          <Link href={`${TOOLS_HUB_PATH}/nearby-${category}`} className="text-primary hover:underline">
            Open full {label} finder
          </Link>
          {" · "}
          <Link href={TOOLS_HUB_PATH} className="text-primary hover:underline">
            All tools
          </Link>
        </p>
      </header>
      <NearbyPlacesTool defaultCategory={cat} defaultCity={cityDef.name} autoSearch />
      <section className="max-w-3xl text-sm text-muted-foreground">
        <p className="font-medium text-foreground">More cities</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {LOCATION_CITIES.filter((c) => c.slug !== city).map((c) => (
            <li key={c.slug}>
              <Link
                href={`${TOOLS_HUB_PATH}/locations/${c.slug}/${category}`}
                className="text-primary hover:underline"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
