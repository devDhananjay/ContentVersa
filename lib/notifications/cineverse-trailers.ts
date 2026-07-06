import { NotificationType } from "@prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { fetchMovieTrailers, trailerFingerprint } from "@/lib/cineverse/tmdb-extras";
import { createUserNotificationsBulk } from "@/lib/notifications/create";
import { getAppUrl } from "@/lib/app-url";

/** Notify users when a new trailer drops for a watchlisted title. */
export async function sendCineverseTrailerAlerts() {
  if (!isDatabaseConfigured()) return { checked: 0, notified: 0 };

  const items = await prisma.movieWatchlistItem.findMany({
    where: { trailerNotify: true },
    select: {
      id: true,
      userId: true,
      tmdbId: true,
      lastNotifiedTrailerKey: true,
    },
    take: 200,
  });

  if (!items.length) return { checked: 0, notified: 0 };

  const trailersByMovie = new Map<string, Awaited<ReturnType<typeof fetchMovieTrailers>>>();
  for (const tmdbId of [...new Set(items.map((i) => i.tmdbId))]) {
    trailersByMovie.set(tmdbId, await fetchMovieTrailers(tmdbId));
  }

  const site = getAppUrl();
  const payloads: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link: string;
  }[] = [];
  const updates: { id: string; key: string }[] = [];

  for (const item of items) {
    const trailers = trailersByMovie.get(item.tmdbId) ?? [];
    const fp = trailerFingerprint(trailers);
    if (!fp || fp === item.lastNotifiedTrailerKey) continue;

    const trailer = trailers[0]!;
    payloads.push({
      userId: item.userId,
      type: NotificationType.CINEVERSE_TRAILER,
      title: "New trailer on your watchlist",
      message: `${trailer.name} — tap to watch`,
      link: `${site}/cineverse/movie/${item.tmdbId}`,
    });
    updates.push({ id: item.id, key: fp });
  }

  const notified = await createUserNotificationsBulk(payloads);

  await Promise.all(
    updates.map((u) =>
      prisma.movieWatchlistItem.update({
        where: { id: u.id },
        data: { lastNotifiedTrailerKey: u.key },
      })
    )
  );

  return { checked: items.length, notified };
}
