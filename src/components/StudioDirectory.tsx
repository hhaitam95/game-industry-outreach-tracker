import {Fragment,useMemo,useState} from "react";
import studios from "../data/speculative-route-directory.json" with {type:"json"};
import profilesJson from "../data/studio-profiles.json" with {type:"json"};
import StudioLogo from "./StudioLogo";
import type {TrackedApplication} from "./studio.types";
import "./directory.css";

type Studio=typeof studios[number];
type Profile={
  description:string;
  headquarters:{city:string|null;country:string;countryCode:string;label:string}|null;
  otherLocations:string[];
  companyType:string[];
  ownership:string;
  parentCompany:string|null;
  industryScale:string;
  teamSize:string;
  teamSizeAsOf:string|null;
  focus:string[];
  popularGames:{title:string;appId:number|null;stage?:string}[];
  profileSources:string[];
  applicationLocation?:string;
  reachHighlights?:string;
};
const profiles=profilesJson as Record<string,Profile>;
const countryCodes:Record<string,string>={
  "Australia":"AU","Bulgaria":"BG","Canada":"CA","Czech Republic":"CZ","Denmark":"DK","Estonia":"EE","Finland":"FI","France":"FR","Germany":"DE","Hungary":"HU","Iceland":"IS","Italy":"IT","Poland":"PL","Portugal":"PT","Saudi Arabia":"SA","Thailand":"TH","Türkiye":"TR","Turkey":"TR","United Kingdom":"GB","United States":"US","United Arab Emirates":"AE","Netherlands":"NL","Spain":"ES"
};
function flag(code?:string){return code&&code.length===2?String.fromCodePoint(...code.toUpperCase().split("").map(c=>127397+c.charCodeAt(0))):"🌍";}
function hqFor(studio:Studio,profile?:Profile){
  const hq=profile?.headquarters;
  if(hq)return {emoji:flag(hq.countryCode),label:[hq.city,hq.country].filter(Boolean).join(", ")||hq.country,tag:hq.label||"HQ"};
  if(studio.country!=="Not stated")return {emoji:flag(countryCodes[studio.country]),label:studio.country,tag:"HQ · city unconfirmed"};
  return {emoji:"🌍",label:"Not publicly stated",tag:"HQ unknown"};
}
function gameArtUrl(appId:number){return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;}
function trackerLocation(studio:Studio,profile?:Profile){
  const hq=profile?.headquarters;
  const hqLabel=hq?.city?`${hq.city} · HQ`:hq?.label||"HQ not disclosed";
  return {country:hq?.country||studio.country,hqLabel,applicationLocation:profile?.applicationLocation||"Not specified · HQ shown as reference"};
}

function GameCard({game}:{game:Profile["popularGames"][number]}){
  const [failed,setFailed]=useState(false);
  return <div className="game-card">
    {game.appId&&!failed?<img src={gameArtUrl(game.appId)} alt="" loading="lazy" onError={()=>setFailed(true)}/>:<div className="game-art-placeholder">GAME</div>}
    <div><strong>{game.title}</strong>{game.stage?<small>{game.stage}</small>:null}</div>
  </div>;
}

export default function StudioDirectory({applications,onSave,onMarkApplied}:{applications:TrackedApplication[];onSave:(studio:Studio,location:{country:string;hqLabel:string;applicationLocation:string})=>void;onMarkApplied:(studio:Studio,location:{country:string;hqLabel:string;applicationLocation:string})=>void}){
  const [query,setQuery]=useState("");
  const [scale,setScale]=useState("All sizes");
  const [kind,setKind]=useState("All types");
  const [expanded,setExpanded]=useState<string|null>(null);
  const [sort,setSort]=useState("name");
  const countries=useMemo(()=>new Set(studios.map(s=>profiles[s.name]?.headquarters?.country||s.country).filter(c=>c!=="Not stated")),[]);
  const filtered=useMemo(()=>{
    const term=query.trim().toLowerCase();
    return studios.filter((studio:Studio)=>{
      const p=profiles[studio.name];
      const fields=[studio.name,studio.country,studio.notes,p?.description,p?.ownership,p?.parentCompany,p?.companyType.join(" "),p?.focus.join(" "),p?.popularGames.map(g=>g.title).join(" ")].filter(Boolean).join(" ").toLowerCase();
      const matches= !term||fields.includes(term);
      const sizeMatch=scale==="All sizes"||p?.industryScale===scale;
      const kindMatch=kind==="All types"||p?.companyType.includes(kind);
      return matches&&sizeMatch&&kindMatch;
    }).sort((a,b)=>sort==="name"?a.name.localeCompare(b.name):((profiles[b.name]?.popularGames.length||0)-(profiles[a.name]?.popularGames.length||0)));
  },[query,scale,kind,sort]);
  const types=["All types","Developer","Publisher","Co-development","Mobile","Services"];
  const scales=["All sizes","AAA","AA","AA / AAA","Indie","Indie / AA","AAA co-development","AA · Mobile"];
  const statusMap=new Map(applications.map(a=>[a.studioName,a.status]));
  return <section className="directory-page">
    <div className="directory-hero">
      <div className="hero-copy"><span className="eyebrow">THE GAME INDUSTRY INDEX</span><h2>Find your next studio.</h2><p>Explore teams, worlds, ownership and career routes across the game industry.</p></div>
      <div className="hero-stat"><strong>{studios.length}</strong><span>verified speculative routes</span><small>{countries.size} represented countries</small></div>
      <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
    </div>
    <div className="directory-toolbar">
      <label className="search-box"><span>⌕</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search studios, games, publishers, countries…"/></label>
      <select aria-label="Filter by studio type" value={kind} onChange={e=>setKind(e.target.value)}>{types.map(x=><option key={x}>{x}</option>)}</select>
      <select aria-label="Filter by industry scale" value={scale} onChange={e=>setScale(e.target.value)}>{scales.map(x=><option key={x}>{x}</option>)}</select>
      <select aria-label="Sort studios" value={sort} onChange={e=>setSort(e.target.value)}><option value="name">A–Z</option><option value="games">Most known titles</option></select>
      <span className="result-count">{filtered.length} studios</span>
    </div>
    <div className="directory-note"><span>✦</span> HQ is shown when a speculative route does not name a hiring location. Remote eligibility and branch offices are shown in each profile.</div>
    <div className="studio-table-wrap">
      <table className="studio-table">
        <thead><tr><th>Studio</th><th>HQ / Location</th><th>Known for</th><th>Scale</th><th>Ownership</th><th>Team</th><th>Career route</th></tr></thead>
        <tbody>
        {filtered.map((studio:Studio)=>{
          const p=profiles[studio.name];
          const location=hqFor(studio,p);
          const active=expanded===studio.name;
          const tracked=statusMap.get(studio.name);
          const games=p?.popularGames||[];
          const type=p?.companyType?.slice(0,2).join(" · ")||"Classification pending";
          return <Fragment key={studio.name}><tr className={active?"studio-row is-expanded":"studio-row"}>
            <td><button className="studio-expand" type="button" onClick={()=>setExpanded(active?null:studio.name)} aria-expanded={active}><span className="expand-chevron">{active?"⌄":"›"}</span><StudioLogo name={studio.name} websiteUrl={studio.websiteUrl}/><span className="studio-name-cell"><strong>{studio.name}</strong><small>{type}</small></span></button></td>
            <td><span className="location-cell"><span className="country-flag">{location.emoji}</span><span><strong>{location.label}</strong><small>{p?.applicationLocation||location.tag}</small></span></span></td>
            <td><div className="game-chips">{games.length?games.slice(0,2).map(g=><span className="game-chip" key={g.title}>{g.title}</span>):<span className="muted">{(p?.description||studio.notes).slice(0,72)}…</span>}</div></td>
            <td><span className={`scale-tag ${(p?.industryScale||"").toLowerCase().replace(/[^a-z]+/g,"-")}`}>{p?.industryScale||"Unclassified"}</span></td>
            <td><span className="ownership-cell">{p?.parentCompany||p?.ownership||"Not yet researched"}</span></td>
            <td><span className="team-cell">{p?.teamSize||"Not disclosed"}</span></td>
            <td><div className="route-cell"><a href={studio.applicationUrl} target="_blank" rel="noopener noreferrer" className="route-link">Open route ↗</a><button type="button" className={tracked?"save-studio is-saved":"save-studio"} onClick={()=>onSave(studio,trackerLocation(studio,p))} disabled={Boolean(tracked)}>{tracked? "✓ In tracker":"＋ Save"}</button></div></td>
          </tr>
          {active?<tr className="detail-row" key={studio.name+"-details"}><td colSpan={7}>
            <div className="studio-detail">
              <div className="detail-main">
                <div className="detail-heading"><StudioLogo name={studio.name} websiteUrl={studio.websiteUrl} size="lg"/><div><span className="eyebrow">STUDIO PROFILE</span><h3>{studio.name}</h3><p>{p?.description||studio.notes}</p></div></div>
                <div className="tag-list">{(p?.companyType||["Company role to verify"]).map(t=><span className="profile-tag" key={t}>{t}</span>)}{(p?.focus||[]).map(t=><span className="profile-tag subtle" key={t}>{t}</span>)}</div>
                <h4>Selected work</h4>
                {games.length?<div className="game-grid">{games.map(g=><GameCard game={g} key={g.title}/>)}</div>:<p className="detail-muted">Notable titles are being researched. Check the studio's official website for its portfolio.</p>}
                <p className="route-conditions"><strong>Application notes:</strong> {studio.notes}</p>
              </div>
              <div className="detail-facts">
                <div className="fact"><span>Headquarters</span><strong>{location.emoji} {location.label}</strong><small>{location.tag}</small></div>
                <div className="fact"><span>Application location</span><strong>{p?.applicationLocation||"Not specified · HQ shown as reference"}</strong></div>
                <div className="fact"><span>Other branches</span><strong>{p?.otherLocations?.length?p.otherLocations.join(" · "):"Not publicly confirmed"}</strong></div>
                <div className="fact"><span>Ownership</span><strong>{p?.ownership||"Not yet researched"}</strong>{p?.parentCompany?<small>Parent: {p.parentCompany}</small>:null}</div>
                <div className="fact"><span>Industry scale</span><strong>{p?.industryScale||"Not yet assessed"}</strong><small>Indicative portfolio / production profile, not an official rating</small></div>
                <div className="fact"><span>Team size</span><strong>{p?.teamSize||"Not publicly disclosed"}</strong>{p?.teamSizeAsOf?<small>Reference period: {p.teamSizeAsOf}</small>:null}</div>
                {p?.reachHighlights?<div className="fact fact-wide"><span>Reach & recognition</span><strong>{p.reachHighlights}</strong></div>:null}
                <div className="fact"><span>Company role</span><strong>{type}</strong></div>
                <div className="detail-links"><a href={studio.websiteUrl} target="_blank" rel="noopener noreferrer">Official website ↗</a><a href={studio.evidenceUrl} target="_blank" rel="noopener noreferrer">Application evidence ↗</a>{p?.profileSources?.map((u,i)=><a key={u} href={u} target="_blank" rel="noopener noreferrer">{i===0?"Studio profile": "Additional source"} ↗</a>)}</div>
                <div className="detail-actions"><a className="primary-action" href={studio.applicationUrl} target="_blank" rel="noopener noreferrer">Visit application page ↗</a><button className="secondary-action" type="button" onClick={()=>onSave(studio,trackerLocation(studio,p))} disabled={Boolean(tracked)}>{tracked?"Already in tracker":"Save studio"}</button><button className="applied-action" type="button" onClick={()=>onMarkApplied(studio,trackerLocation(studio,p))} disabled={tracked==="applied"}>{tracked==="applied"?"✓ Already marked Applied":"✓ Confirm application sent"}</button></div>
                {tracked?<p className="tracked-hint">Already in your tracker · {tracked.replace("_"," ")}</p>:null}
              </div>
            </div>
          </td></tr>:null}</Fragment>;
        })}
        {filtered.length===0?<tr><td colSpan={7} className="empty-table">No studios match those filters. Try a broader search.</td></tr>:null}
        </tbody>
      </table>
    </div>
    <div className="directory-footnote">Company and workforce details are indicative, date-stamped and linked to sources where available. “Not disclosed” means a reliable public figure was not found.</div>
  </section>;
}
