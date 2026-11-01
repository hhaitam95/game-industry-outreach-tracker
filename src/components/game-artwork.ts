export type ArtworkLayout = "portrait" | "landscape" | "square";

export type PopularGameArtworkMetadata = {
  title: string;
  appId?: number | null;
  stage?: string;
  igdbGameId?: number;
  igdbSlug?: string;
  igdbCoverId?: string;
  steamHeaderUrl?: string;
  steamCapsuleUrl?: string;
  officialUrl?: string;
  officialArtworkUrl?: string;
  officialArtworkLayout?: ArtworkLayout;
};

export type GameArtworkSource = {
  source: "Steam" | "IGDB" | "Official site";
  url: string;
  layout: ArtworkLayout;
};

function uniqueSources(sources: GameArtworkSource[]): GameArtworkSource[] {
  const seen = new Set<string>();
  return sources.filter(source => {
    if (seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

/**
 * Prefer portrait key art, then verified IGDB / official art, and only then
 * use a wide Steam header. A wide header must never displace a real cover.
 */
export function getGameArtworkSources(game: PopularGameArtworkMetadata): GameArtworkSource[] {
  const steamPortraitSources: GameArtworkSource[] = game.appId
    ? [
        {
          source: "Steam",
          layout: "portrait",
          url: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appId}/library_600x900.jpg`,
        },
        {
          source: "Steam",
          layout: "portrait",
          url: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appId}/library_600x900_2x.jpg`,
        },
        {
          source: "Steam",
          layout: "portrait",
          url: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId}/library_600x900.jpg`,
        },
      ]
    : [];

  const igdbSources: GameArtworkSource[] = game.igdbCoverId
    ? [
        {
          source: "IGDB",
          layout: "portrait",
          url: `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.igdbCoverId}.jpg`,
        },
      ]
    : [];

  const officialSources: GameArtworkSource[] = game.officialArtworkUrl
    ? [
        {
          source: "Official site",
          layout: game.officialArtworkLayout || "portrait",
          url: game.officialArtworkUrl,
        },
      ]
    : [];

  const steamHeaderSources: GameArtworkSource[] = game.appId
    ? [
        ...(game.steamHeaderUrl
          ? [
              {
                source: "Steam" as const,
                layout: "landscape" as const,
                url: game.steamHeaderUrl,
              },
            ]
          : []),
        ...(game.steamCapsuleUrl
          ? [
              {
                source: "Steam" as const,
                layout: "landscape" as const,
                url: game.steamCapsuleUrl,
              },
            ]
          : []),
        {
          source: "Steam",
          layout: "landscape",
          url: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId}/header.jpg`,
        },
      ]
    : [];

  return uniqueSources([
    ...steamPortraitSources,
    ...igdbSources,
    ...officialSources,
    ...steamHeaderSources,
  ]);
}

export function gameDestination(game: PopularGameArtworkMetadata): string | null {
  if (game.appId) return `https://store.steampowered.com/app/${game.appId}/`;
  if (game.officialUrl) return game.officialUrl;
  if (game.igdbSlug) return `https://www.igdb.com/games/${encodeURIComponent(game.igdbSlug)}`;
  return null;
}

export function gameLinkLabel(game: PopularGameArtworkMetadata): string | null {
  if (game.appId) return `Open ${game.title} on Steam`;
  if (game.officialUrl) return `Open ${game.title} on the official website`;
  if (game.igdbSlug) return `Open ${game.title} on IGDB`;
  return null;
}
