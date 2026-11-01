export const SCALE_ORDER = ["Indie", "AA", "AAA"] as const;
export type StudioScale = (typeof SCALE_ORDER)[number];

export const PLATFORM_ORDER = ["PC", "Console", "Mobile", "VR", "XR", "Web"] as const;
export type StudioPlatform = (typeof PLATFORM_ORDER)[number];

export const PLATFORM_EMOJI: Record<StudioPlatform, string> = {
  PC: "💻", Console: "🎮", Mobile: "📱", VR: "🥽", XR: "🕶️", Web: "🌐",
};

export const FOCUS_ORDER = [
  "Action", "Adventure", "RPG", "Shooter", "Horror", "Strategy", "Simulation",
  "Narrative", "Co-op", "Multiplayer", "Survival", "Puzzle", "Casual", "Racing",
  "Arcade", "Fighting", "Stealth", "Roguelike", "Sandbox", "Open world",
  "Card games", "Sports", "Management", "Fantasy", "Sci-fi", "Historical",
  "Platformer", "Tactical", "MMO", "Family-friendly", "Serious games", "Social games",
] as const;

export const FOCUS_EMOJI: Record<string, string> = {
  Action: "⚔️", Adventure: "🧭", RPG: "🛡️", Shooter: "🎯", Horror: "👻",
  Strategy: "♟️", Simulation: "⚙️", Narrative: "📖", "Co-op": "🤝",
  Multiplayer: "👥", Survival: "🪓", Puzzle: "🧩", Casual: "✨", Racing: "🏁",
  Arcade: "🕹️", Fighting: "🥊", Stealth: "🕵️", Roguelike: "🎲", Sandbox: "🏗️",
  "Open world": "🌍", "Card games": "🃏", Sports: "🏅", Management: "📊",
  Fantasy: "🧙", "Sci-fi": "🚀", Historical: "🏛️", Platformer: "🎮",
  Tactical: "🧠", MMO: "🌐", "Family-friendly": "👨‍👩‍👧",
  "Serious games": "🎓", "Social games": "💬",
};

export const ROLE_ORDER = ["Developer", "Publisher", "Co-dev"] as const;
export type StudioRole = (typeof ROLE_ORDER)[number];

export function platformEmoji(value: string): string {
  return PLATFORM_EMOJI[value as StudioPlatform] || "🎮";
}
export function focusEmoji(value: string): string {
  return FOCUS_EMOJI[value] || "🎮";
}
export function orderedTags(values: string[], order: readonly string[]): string[] {
  return [...values].sort((a, b) => {
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    return (aIndex < 0 ? order.length : aIndex) - (bIndex < 0 ? order.length : bIndex) || a.localeCompare(b);
  });
}
