import { useState } from "react";

type ParentCompanyBrand = { name: string; domain: string; url: string; patterns: string[] };

const parentCompanyBrands: ParentCompanyBrand[] = [
  { name: "Microsoft", domain: "microsoft.com", url: "https://www.xbox.com/xbox-game-studios", patterns: ["microsoft"] },
  { name: "Xbox Game Studios", domain: "xbox.com", url: "https://www.xbox.com/xbox-game-studios", patterns: ["xbox game studios"] },
  { name: "PlayStation Studios", domain: "playstation.com", url: "https://www.playstation.com/en-us/corporate/playstation-studios/", patterns: ["playstation studios", "playstation"] },
  { name: "Sony Interactive Entertainment", domain: "sonyinteractive.com", url: "https://sonyinteractive.com/", patterns: ["sony interactive", "sony corporation"] },
  { name: "Activision", domain: "activision.com", url: "https://www.activision.com/", patterns: ["activision"] },
  { name: "Blizzard", domain: "blizzard.com", url: "https://www.blizzard.com/", patterns: ["blizzard"] },
  { name: "Nintendo", domain: "nintendo.com", url: "https://www.nintendo.com/", patterns: ["nintendo"] },
  { name: "Ubisoft", domain: "ubisoft.com", url: "https://www.ubisoft.com/", patterns: ["ubisoft"] },
  { name: "Tencent", domain: "tencent.com", url: "https://www.tencent.com/", patterns: ["tencent"] },
  { name: "THQ Nordic", domain: "thqnordic.com", url: "https://www.thqnordic.com/", patterns: ["thq nordic"] },
  { name: "Keywords Studios", domain: "keywordsstudios.com", url: "https://www.keywordsstudios.com/", patterns: ["keywords studios"] },
  { name: "Nacon", domain: "nacongaming.com", url: "https://www.nacongaming.com/", patterns: ["nacon"] },
  { name: "Embracer Group", domain: "embracer.com", url: "https://embracer.com/", patterns: ["embracer"] },
  { name: "Stillfront Group", domain: "stillfront.com", url: "https://www.stillfront.com/", patterns: ["stillfront"] },
  { name: "Com2uS", domain: "com2us.com", url: "https://www.com2us.com/", patterns: ["com2us"] },
  { name: "CyberAgent", domain: "cyberagent.co.jp", url: "https://www.cyberagent.co.jp/en/", patterns: ["cyberagent"] },
  { name: "DON'T NOD", domain: "dont-nod.com", url: "https://dont-nod.com/", patterns: ["don't nod", "dont nod"] },
  { name: "Aristocrat", domain: "aristocrat.com", url: "https://www.aristocrat.com/", patterns: ["aristocrat"] },
  { name: "Sea Limited", domain: "sea.com", url: "https://www.sea.com/", patterns: ["sea limited"] },
  { name: "Paradox Interactive", domain: "paradoxinteractive.com", url: "https://www.paradoxinteractive.com/", patterns: ["paradox interactive"] },
  { name: "Netmarble", domain: "netmarble.com", url: "https://www.netmarble.com/", patterns: ["netmarble"] },
  { name: "Plarium", domain: "plarium.com", url: "https://plarium.com/", patterns: ["plarium"] },
  { name: "Take-Two Interactive", domain: "take2games.com", url: "https://www.take2games.com/", patterns: ["take-two", "take two"] },
  { name: "Zynga", domain: "zynga.com", url: "https://www.zynga.com/", patterns: ["zynga"] },
  { name: "SEGA", domain: "sega.com", url: "https://www.sega.com/", patterns: ["sega"] },
  { name: "Square Enix", domain: "square-enix.com", url: "https://www.square-enix.com/", patterns: ["square enix"] },
  { name: "Nordisk Games", domain: "nordiskgames.com", url: "https://nordiskgames.com/", patterns: ["nordisk games"] },
  { name: "Virtuos", domain: "virtuosgames.com", url: "https://www.virtuosgames.com/", patterns: ["virtuos"] },
  { name: "Krafton", domain: "krafton.com", url: "https://www.krafton.com/", patterns: ["krafton"] },
  { name: "PLAION", domain: "plaion.com", url: "https://plaion.com/", patterns: ["plaion"] },
  { name: "Coffee Stain", domain: "coffeestain.com", url: "https://coffeestain.com/", patterns: ["coffee stain"] },
];

function CompanyMark({ brand }: { brand: ParentCompanyBrand }) {
  const [failed, setFailed] = useState(false);
  const src = "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(brand.domain) + "&sz=64";
  return (
    <a className="company-mark" href={brand.url} target="_blank" rel="noopener noreferrer"
      title={"Visit " + brand.name + " official website"} aria-label={"Visit " + brand.name + " official website"}>
      {!failed ? (
        <img src={src} alt={brand.name} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : <span aria-hidden="true">{brand.name.slice(0, 1)}</span>}
    </a>
  );
}

function matchingBrands(value?: string | null): ParentCompanyBrand[] {
  if (!value) return [];
  const normalized = value.toLowerCase();
  return parentCompanyBrands.filter(brand => brand.patterns.some(pattern => normalized.includes(pattern))).slice(0, 4);
}

export function hasKnownCompanyMark(value?: string | null): boolean {
  return matchingBrands(value).length > 0;
}

export default function CompanyMarks({ value }: { value?: string | null }) {
  const matches = matchingBrands(value);
  if (!matches.length) return null;
  return (
    <span className="company-mark-list" aria-label={"Corporate affiliation: " + value}>
      {matches.map(brand => <CompanyMark brand={brand} key={brand.name} />)}
    </span>
  );
}
