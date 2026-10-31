import { useState } from "react";

export type PopularGame = {
  title: string;
  appId?: number | null;
  stage?: string;
};

function steamArtworkSources(appId?: number | null): string[] {
  if (!appId) return [];
  return [
    `https://shared.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`,
    `https://shared.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900_2x.jpg`,
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`,
  ];
}

function gameInitials(title: string): string {
  return title
    .split(/\\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase() || "VG";
}

function GameCoverArtwork({ game, compact }: { game: PopularGame; compact: boolean }) {
  const sources = steamArtworkSources(game.appId);
  const [sourceIndex, setSourceIndex] = useState(0);

  if (sourceIndex < sources.length) {
    return (
      <img
        src={sources[sourceIndex]}
        alt={game.title + " game poster"}
        loading="lazy"
        decoding="async"
        onError={() => setSourceIndex(current => current + 1)}
      />
    );
  }

  return (
    <span
      className={compact ? "game-cover-fallback is-compact" : "game-cover-fallback"}
      role="img"
      aria-label={game.title + (game.appId ? " cover artwork unavailable" : " has no Steam cover listing")}
    >
      <span className="game-cover-monogram" aria-hidden="true">{gameInitials(game.title)}</span>
      {compact ? null : (
        <>
          <strong>{game.title}</strong>
          <small>{game.appId ? "Cover image unavailable" : "No Steam listing"}</small>
        </>
      )}
    </span>
  );
}

export default function GamePoster({ game }: { game: PopularGame }) {
  const hasSteamId = Boolean(game.appId);
  const storeUrl = hasSteamId
    ? `https://store.steampowered.com/app/${game.appId}/`
    : `https://store.steampowered.com/search/?term=${encodeURIComponent(game.title)}`;

  return (
    <a
      className="game-poster-card"
      href={storeUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={hasSteamId ? "View " + game.title + " on Steam" : "Search Steam for " + game.title}
      aria-label={hasSteamId ? "Open " + game.title + " on Steam" : "Search Steam for " + game.title}
      data-game-title={game.title}
    >
      <span className="game-poster-art">
        <GameCoverArtwork game={game} compact={false} />
        {game.stage ? <span className="game-stage-badge">{game.stage}</span> : null}
      </span>
      <span className="game-poster-caption">
        <strong>{game.title}</strong>
        <small>{game.stage || (hasSteamId ? "Steam library cover" : "Search Steam")}</small>
      </span>
    </a>
  );
}

export function GamePosterStrip({ games }: { games: PopularGame[] }) {
  return (
    <span className="popular-work-list" aria-label={games.map(game => game.title).join(", ")}>
      {games.map(game => {
        const hasSteamId = Boolean(game.appId);
        const storeUrl = hasSteamId
          ? `https://store.steampowered.com/app/${game.appId}/`
          : `https://store.steampowered.com/search/?term=${encodeURIComponent(game.title)}`;

        return (
          <a
            className="popular-game-cover"
            href={storeUrl}
            key={game.title}
            target="_blank"
            rel="noopener noreferrer"
            title={game.title}
            aria-label={hasSteamId ? "Open " + game.title + " on Steam" : "Search Steam for " + game.title}
            data-game-title={game.title}
          >
            <span className="popular-game-cover-art">
              <GameCoverArtwork game={game} compact />
            </span>
          </a>
        );
      })}
    </span>
  );
}
