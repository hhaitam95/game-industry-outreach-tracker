import { useState } from "react";
import {
  gameDestination,
  gameLinkLabel,
  getGameArtworkSources,
} from "./game-artwork";
import type { PopularGameArtworkMetadata } from "./game-artwork";

export type PopularGame = PopularGameArtworkMetadata;

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
        data-artwork-layout={currentSource.layout}
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

function PosterContents({ game }: { game: PopularGame }) {
  return (
    <>
      <span className="game-poster-art">
        <GameCoverArtwork game={game} compact={false} />
        {game.stage ? <span className="game-stage-badge">{game.stage}</span> : null}
      </span>
      <span className="game-poster-caption">
        <strong>{game.title}</strong>
        {game.releaseYear ? (
          <small title={game.releaseYearSourceUrl ? "Release year source: " + game.releaseYearSourceUrl : undefined}>{game.releaseYear}</small>
        ) : null}
      </span>
    </>
  );
}

export default function GamePoster({ game }: { game: PopularGame }) {
  const destination = gameDestination(game);
  const linkLabel = gameLinkLabel(game);

  if (!destination || !linkLabel) {
    return (
      <span
        className="game-poster-card"
        role="group"
        data-game-title={game.title}
        aria-label={game.title + (game.releaseYear ? " · " + game.releaseYear : "") + " · no verified game page"}
        data-release-year={game.releaseYear || ""}
      >
        <PosterContents game={game} />
      </span>
    );
  }

  return (
    <a
      className="game-poster-card"
      href={destination}
      target="_blank"
      rel="noopener noreferrer"
      title={linkLabel}
      aria-label={linkLabel + (game.releaseYear ? " · " + game.releaseYear : "")}
      data-game-title={game.title}
      data-release-year={game.releaseYear || ""}
    >
      <PosterContents game={game} />
    </a>
  );
}

export function GamePosterStrip({ games }: { games: PopularGame[] }) {
  return (
    <span className="popular-work-list" aria-label={games.map(game => game.title + (game.releaseYear ? " " + game.releaseYear : "")).join(", ")}>
      {games.map(game => {
        const destination = gameDestination(game);
        const linkLabel = gameLinkLabel(game);
        const content = (
          <span className="popular-game-cover-art">
            <GameCoverArtwork game={game} compact />
          </span>
        );

        return destination && linkLabel ? (
          <a
            className="popular-game-cover"
            href={destination}
            key={game.title}
            target="_blank"
            rel="noopener noreferrer"
            title={game.title + (game.releaseYear ? " · " + game.releaseYear : "")}
            aria-label={linkLabel + (game.releaseYear ? " · " + game.releaseYear : "")}
            data-game-title={game.title}
            data-release-year={game.releaseYear || ""}
          >
            {content}
          </a>
        ) : (
          <span
            className="popular-game-cover"
            key={game.title}
            role="group"
            aria-label={game.title + (game.releaseYear ? " · " + game.releaseYear : "") + " · no verified game page"}
            data-game-title={game.title}
            data-release-year={game.releaseYear || ""}
          >
            {content}
          </span>
        );
      })}
    </span>
  );
}
