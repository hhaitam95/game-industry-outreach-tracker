import { useState } from "react";

export type PopularGame = {
  title: string;
  appId?: number | null;
  stage?: string;
  igdbGameId?: number;
  igdbSlug?: string;
  igdbCoverId?: string;
};

export type GameArtworkSource = {
  source: "Steam" | "IGDB";
  url: string;
};

export function getGameArtworkSources(game: PopularGame): GameArtworkSource[] {
  const steamSources: GameArtworkSource[] = game.appId
    ? [
        {
          source: "Steam",
          url: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appId}/library_600x900.jpg`,
        },
        {
          source: "Steam",
          url: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appId}/library_600x900_2x.jpg`,
        },
        {
          source: "Steam",
          url: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId}/library_600x900.jpg`,
        },
      ]
    : [];

  const igdbSource: GameArtworkSource[] = game.igdbCoverId
    ? [
        {
          source: "IGDB",
          url: `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.igdbCoverId}.jpg`,
        },
      ]
    : [];

  return [...steamSources, ...igdbSource];
}

export function gameDestination(game: PopularGame): string {
  if (game.appId) return `https://store.steampowered.com/app/${game.appId}/`;
  if (game.igdbSlug) return `https://www.igdb.com/games/${encodeURIComponent(game.igdbSlug)}`;
  return `https://store.steampowered.com/search/?term=${encodeURIComponent(game.title)}`;
}

function gameLinkLabel(game: PopularGame): string {
  if (game.appId) return `Open ${game.title} on Steam`;
  if (game.igdbSlug) return `Open ${game.title} on IGDB`;
  return `Search Steam for ${game.title}`;
}

function gameInitials(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase() || "VG";
}

function GameCoverArtwork({ game, compact }: { game: PopularGame; compact: boolean }) {
  const sources = getGameArtworkSources(game);
  const [sourceIndex, setSourceIndex] = useState(0);
  const currentSource = sources[sourceIndex];

  if (currentSource) {
    return (
      <img
        src={currentSource.url}
        alt={game.title + " game cover"}
        data-artwork-source={currentSource.source}
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
      aria-label={game.title + " cover artwork unavailable"}
    >
      <span className="game-cover-monogram" aria-hidden="true">{gameInitials(game.title)}</span>
      {compact ? null : (
        <>
          <strong>{game.title}</strong>
          <small>No verified cover artwork</small>
        </>
      )}
    </span>
  );
}

function artworkCaption(game: PopularGame): string {
  if (game.stage) return game.stage;
  if (game.appId && game.igdbCoverId) return "Steam · IGDB fallback";
  if (game.appId) return "Steam cover";
  if (game.igdbCoverId) return "IGDB cover";
  return "No cover found";
}

export default function GamePoster({ game }: { game: PopularGame }) {
  const destination = gameDestination(game);
  const linkLabel = gameLinkLabel(game);

  return (
    <a
      className="game-poster-card"
      href={destination}
      target="_blank"
      rel="noopener noreferrer"
      title={linkLabel}
      aria-label={linkLabel}
      data-game-title={game.title}
    >
      <span className="game-poster-art">
        <GameCoverArtwork game={game} compact={false} />
        {game.stage ? <span className="game-stage-badge">{game.stage}</span> : null}
      </span>
      <span className="game-poster-caption">
        <strong>{game.title}</strong>
        <small>{artworkCaption(game)}</small>
      </span>
    </a>
  );
}

export function GamePosterStrip({ games }: { games: PopularGame[] }) {
  return (
    <span className="popular-work-list" aria-label={games.map(game => game.title).join(", ")}>
      {games.map(game => {
        const linkLabel = gameLinkLabel(game);
        return (
          <a
            className="popular-game-cover"
            href={gameDestination(game)}
            key={game.title}
            target="_blank"
            rel="noopener noreferrer"
            title={game.title}
            aria-label={linkLabel}
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
