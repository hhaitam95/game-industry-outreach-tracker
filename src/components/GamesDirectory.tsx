import { useEffect, useMemo, useState } from "react";
import profilesJson from "../data/studio-profiles.json" with { type: "json" };
import GamePoster from "./GamePosters";
import type { PopularGame } from "./GamePosters";
import "./directory.css";

type ProfileRecord = { studioRoles?: string[]; popularGames?: PopularGame[] };
type CatalogueGame = PopularGame & {
  studios: string[];
  associatedDevelopers: string[];
  associatedPublishers: string[];
};
const profiles = profilesJson as Record<string, ProfileRecord>;

function normalizeTitle(value: string): string {
  return value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function buildCatalogue(): CatalogueGame[] {
  const byTitle = new Map<string, CatalogueGame>();
  for (const [studio, profile] of Object.entries(profiles)) {
    for (const game of profile.popularGames || []) {
      const key = normalizeTitle(game.title);
      if (!key) continue;
      const record = byTitle.get(key) || { ...game, studios: [], associatedDevelopers: [], associatedPublishers: [] };
      if (!record.studios.includes(studio)) record.studios.push(studio);
      for (const role of profile.studioRoles || []) {
        if ((role === "Developer" || role === "Co-dev") && !record.associatedDevelopers.includes(studio)) record.associatedDevelopers.push(studio);
        if (role === "Publisher" && !record.associatedPublishers.includes(studio)) record.associatedPublishers.push(studio);
      }
      const metadata = record as Record<string, unknown>;
      for (const field of [
        "appId", "releaseYear", "releaseYearSourceUrl", "steamReleaseDate", "steamDetailsCheckedAt",
        "steamHeaderUrl", "steamCapsuleUrl", "igdbGameId", "igdbSlug", "igdbCoverId", "igdbCoverUrl",
        "officialUrl", "officialArtworkUrl", "officialArtworkLayout", "appStoreUrl", "appStoreArtworkUrl",
        "steamReviewCount", "steamPositiveReviewCount", "steamNegativeReviewCount",
        "steamReviewScoreDesc", "steamReviewsUpdatedAt",
      ]) {
        if ((metadata[field] === undefined || metadata[field] === null || metadata[field] === "") && game[field as keyof PopularGame] !== undefined) {
          metadata[field] = game[field as keyof PopularGame];
        }
      }
      for (const field of ["steamDevelopers", "steamPublishers"] as const) {
        metadata[field] = [...new Set([...(metadata[field] as string[] | undefined || []), ...(game[field] || [])])];
      }
      byTitle.set(key, record);
    }
  }
  return [...byTitle.values()];
}
function formatCount(value?: number): string {
  return Number.isInteger(value) && (value || 0) >= 0 ? new Intl.NumberFormat().format(value || 0) : "—";
}
function releaseLabel(game: CatalogueGame): string {
  if (game.stage?.toLowerCase() === "in development") return "In development";
  return game.steamReleaseDate || (game.releaseYear ? String(game.releaseYear) : "Not stated");
}
function listLabel(values: string[]): string { return values.length ? values.join(", ") : "Not recorded"; }

export default function GamesDirectory({ onCountChange }: { onCountChange: (count: number) => void }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState<"popularity" | "release" | "title">("popularity");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const games = useMemo(() => buildCatalogue(), []);
  useEffect(() => { onCountChange(games.length); }, [games.length, onCountChange]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const result = games.filter(game => [
      game.title, ...game.studios, ...(game.steamDevelopers || []), ...(game.steamPublishers || []),
      ...game.associatedDevelopers, ...game.associatedPublishers,
    ].join(" ").toLowerCase().includes(term));
    const direction = sortDirection === "asc" ? 1 : -1;
    return result.sort((a, b) => {
      let comparison = sortBy === "popularity"
        ? (a.steamReviewCount ?? -1) - (b.steamReviewCount ?? -1)
        : sortBy === "release"
          ? (a.releaseYear ?? -1) - (b.releaseYear ?? -1)
          : a.title.localeCompare(b.title, undefined, { sensitivity: "base", numeric: true });
      if (!comparison) comparison = a.title.localeCompare(b.title, undefined, { sensitivity: "base", numeric: true });
      return comparison * direction;
    });
  }, [games, query, sortBy, sortDirection]);

  useEffect(() => { setPage(1); }, [query, sortBy, sortDirection]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const first = filtered.length ? (page - 1) * pageSize + 1 : 0;
  const last = Math.min(page * pageSize, filtered.length);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const withPopularity = games.filter(game => Number.isInteger(game.steamReviewCount)).length;

  return (
    <section className="directory-page games-directory">
      <div className="page-heading">
        <div><h1>Games</h1><p>Browse notable games associated with the studios in the directory.</p></div>
        <div className="page-count"><strong>{filtered.length}</strong><span>of {games.length} games</span></div>
      </div>
      <div className="games-toolbar">
        <label className="form-field games-search" htmlFor="games-search">
          <span>Search games</span>
          <input id="games-search" className="form-control" type="search" value={query}
            onChange={event => setQuery(event.target.value)} placeholder="Game, studio, developer or publisher" />
        </label>
        <label className="form-field" htmlFor="games-sort">
          <span>Sort by</span>
          <select id="games-sort" className="form-select" value={sortBy} onChange={event => {
            const next = event.target.value as "popularity" | "release" | "title";
            setSortBy(next); setSortDirection(next === "title" ? "asc" : "desc");
          }}>
            <option value="popularity">Popularity · Steam reviews</option>
            <option value="release">Release date</option><option value="title">Title</option>
          </select>
        </label>
      </div>
      <div className="games-data-note">
        <span><strong>{withPopularity}</strong> of {games.length} titles have Steam review-volume data.</span>
        <span>Popularity uses total Steam user reviews as a public signal, not sales or player counts. Titles without Steam data appear last.</span>
      </div>
      <div className="table-meta">
        <span>Developer and publisher names prefer verified Steam store metadata; studio profile associations are shown when unavailable.</span>
        <span>{filtered.length} results</span>
      </div>
      <div className="table-wrap">
        <table className="table table-sm table-hover align-middle games-table mb-0">
          <thead><tr>
            <th scope="col">Game</th><th scope="col">Popularity</th><th scope="col">Release date</th>
            <th scope="col">Developer</th><th scope="col">Publisher</th><th scope="col">Steam reviews</th>
          </tr></thead>
          <tbody>
            {visible.map(game => {
              const developers = game.steamDevelopers?.length ? game.steamDevelopers : game.associatedDevelopers;
              const publishers = game.steamPublishers?.length ? game.steamPublishers : game.associatedPublishers;
              const total = game.steamReviewCount;
              const positive = game.steamPositiveReviewCount;
              const positiveRate = Number.isInteger(total) && (total || 0) > 0 && Number.isInteger(positive)
                ? Math.round(((positive || 0) / (total || 1)) * 100) : null;
              const reviewLabel = game.steamReviewScoreDesc || (positiveRate === null ? "No Steam review data" : positiveRate + "% positive");
              return <tr key={normalizeTitle(game.title)}>
                <td><div className="games-table-identity"><GamePoster game={game} /></div></td>
                <td className="games-popularity">
                  {Number.isInteger(total) ? <strong>{formatCount(total)}</strong> : <span className="detail-muted">Not available</span>}
                  <small>Steam reviews</small>
                </td>
                <td>{releaseLabel(game)}</td><td>{listLabel(developers)}</td><td>{listLabel(publishers)}</td>
                <td><span className="games-review-score">{reviewLabel}</span>
                  {Number.isInteger(positive) && Number.isInteger(game.steamNegativeReviewCount)
                    ? <small className="games-review-detail">{formatCount(positive)} positive · {formatCount(game.steamNegativeReviewCount)} negative</small>
                    : null}
                </td>
              </tr>;
            })}
            {filtered.length === 0 ? <tr><td className="empty-table" colSpan={6}>No games match this search.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <div className="directory-pagination" aria-label="Game result pages">
        <span className="directory-pagination-summary">Showing <strong>{first}–{last}</strong> of <strong>{filtered.length}</strong> games</span>
        <label className="directory-page-size"><span>Rows</span>
          <select className="form-select form-select-sm" aria-label="Games per page" value={pageSize}
            onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}>
            <option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
          </select><span>per page</span>
        </label>
        <div className="directory-page-controls">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPage(1)} disabled={page <= 1} aria-label="First page">«</button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page <= 1}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={page >= totalPages}>Next</button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPage(totalPages)} disabled={page >= totalPages} aria-label="Last page">»</button>
        </div>
      </div>
      <p className="directory-note">Steam reviews and store metadata are shown only when matched to a verified Steam app ID. Missing values mean verified data is unavailable, not that a game has no reviews.</p>
    </section>
  );
}
