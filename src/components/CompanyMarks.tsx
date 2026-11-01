import { useState } from "react";

type ParentCompanyBrand = { name: string; domain: string; patterns: string[] };

const parentCompanyBrands: ParentCompanyBrand[] = [
  { name: "Microsoft", domain: "microsoft.com", patterns: ["microsoft"] },
  { name: "Xbox", domain: "xbox.com", patterns: ["xbox game studios", "xbox"] },
  { name: "Activision", domain: "activision.com", patterns: ["activision"] },
  { name: "Blizzard", domain: "blizzard.com", patterns: ["blizzard"] },
  { name: "Nintendo", domain: "nintendo.com", patterns: ["nintendo"] },
  { name: "Ubisoft", domain: "ubisoft.com", patterns: ["ubisoft"] },
  { name: "Tencent", domain: "tencent.com", patterns: ["tencent"] },
  { name: "THQ Nordic", domain: "thqnordic.com", patterns: ["thq nordic"] },
  { name: "Keywords Studios", domain: "keywordsstudios.com", patterns: ["keywords studios"] },
  { name: "Nacon", domain: "nacongaming.com", patterns: ["nacon"] },
  { name: "Embracer Group", domain: "embracer.com", patterns: ["embracer"] },
  { name: "Stillfront Group", domain: "stillfront.com", patterns: ["stillfront"] },
  { name: "Com2uS", domain: "com2us.com", patterns: ["com2us"] },
  { name: "CyberAgent", domain: "cyberagent.co.jp", patterns: ["cyberagent"] },
  { name: "DON'T NOD", domain: "dont-nod.com", patterns: ["don't nod", "dont nod"] },
  { name: "Aristocrat", domain: "aristocrat.com", patterns: ["aristocrat"] },
  { name: "Sea Limited", domain: "sea.com", patterns: ["sea limited"] },
  { name: "Paradox Interactive", domain: "paradoxinteractive.com", patterns: ["paradox interactive"] },
  { name: "Netmarble", domain: "netmarble.com", patterns: ["netmarble"] },
  { name: "Plarium", domain: "plarium.com", patterns: ["plarium"] },
  { name: "Take-Two Interactive", domain: "take2games.com", patterns: ["take-two", "take two"] },
  { name: "Zynga", domain: "zynga.com", patterns: ["zynga"] },
  { name: "SEGA", domain: "sega.com", patterns: ["sega"] },
  { name: "Square Enix", domain: "square-enix.com", patterns: ["square enix"] },
  { name: "Nordisk Games", domain: "nordiskgames.com", patterns: ["nordisk games"] },
  { name: "Virtuos", domain: "virtuosgames.com", patterns: ["virtuos"] },
  { name: "Krafton", domain: "krafton.com", patterns: ["krafton"] },
  { name: "PLAION", domain: "plaion.com", patterns: ["plaion"] },
  { name: "Coffee Stain", domain: "coffeestain.com", patterns: ["coffee stain"] },
];

function CompanyMark({ brand }: { brand: ParentCompanyBrand }) {
  const [failed, setFailed] = useState(false);
  const src = "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(brand.domain) + "&sz=64";
  return (
    <span className="company-mark" title={brand.name}>
      {!failed ? (
        <img src={src} alt={brand.name} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{brand.name.slice(0, 1)}</span>
      )}
    </span>
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
