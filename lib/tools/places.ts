export type PlaceCategory =
  | "places"
  | "hotels"
  | "restaurants"
  | "hospitals"
  | "schools"
  | "atms";

export const PLACE_CATEGORY_META: Record<
  PlaceCategory,
  { label: string; googleType: string; keyword?: string }
> = {
  places: { label: "Places", googleType: "point_of_interest" },
  hotels: { label: "Hotels", googleType: "lodging" },
  restaurants: { label: "Restaurants", googleType: "restaurant" },
  hospitals: { label: "Hospitals", googleType: "hospital" },
  schools: { label: "Schools", googleType: "school" },
  atms: { label: "ATMs", googleType: "atm" },
};

export function categoryFromToolSlug(slug: string): PlaceCategory {
  if (slug === "nearby-hotels") return "hotels";
  if (slug === "nearby-restaurants") return "restaurants";
  if (slug === "nearby-hospitals") return "hospitals";
  if (slug === "nearby-schools") return "schools";
  if (slug === "nearby-atms") return "atms";
  return "places";
}

/** Major Indian cities for SEO location pages. */
export const LOCATION_CITIES = [
  { slug: "delhi", name: "Delhi", lat: 28.6139, lng: 77.209 },
  { slug: "mumbai", name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { slug: "bengaluru", name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { slug: "hyderabad", name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { slug: "chennai", name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { slug: "kolkata", name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { slug: "pune", name: "Pune", lat: 18.5204, lng: 73.8567 },
  { slug: "ahmedabad", name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { slug: "jaipur", name: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { slug: "lucknow", name: "Lucknow", lat: 26.8467, lng: 80.9462 },
  { slug: "chandigarh", name: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { slug: "indore", name: "Indore", lat: 22.7196, lng: 75.8577 },
  { slug: "bhopal", name: "Bhopal", lat: 23.2599, lng: 77.4126 },
  { slug: "patna", name: "Patna", lat: 25.5941, lng: 85.1376 },
  { slug: "kochi", name: "Kochi", lat: 9.9312, lng: 76.2673 },
  { slug: "bareilly", name: "Bareilly", lat: 28.367, lng: 79.4304 },
] as const;

export const LOCATION_CATEGORIES = [
  "hotels",
  "restaurants",
  "hospitals",
  "schools",
  "atms",
] as const satisfies readonly PlaceCategory[];

export function getCityBySlug(slug: string) {
  return LOCATION_CITIES.find((c) => c.slug === slug);
}
