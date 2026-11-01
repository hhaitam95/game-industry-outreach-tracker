import { useEffect, useState } from "react";

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function faviconFor(websiteUrl: string): string | null {
  try {
    const url = new URL(websiteUrl);
    if (url.protocol !== "https:") return null;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url.hostname)}&sz=64`;
  } catch {
    return null;
  }
}

export default function StudioMark({ name, websiteUrl }: { name: string; websiteUrl: string }) {
  const faviconUrl = faviconFor(websiteUrl);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [faviconUrl]);

  return (
    <span className="studio-mark" title={name} aria-hidden="true">
      {faviconUrl && !failed ? (
        <img
          src={faviconUrl}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </span>
  );
}
