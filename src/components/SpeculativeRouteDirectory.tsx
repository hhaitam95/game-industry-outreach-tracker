import {useState} from "react";
import studios from "../data/speculative-route-directory.json" with { type: "json" };
import type {RoleLeadPrefillData} from "./workspace.types";
import "./speculative-route-directory.css";
type Studio=(typeof studios)[number];
export default function SpeculativeRouteDirectory({onTrackRoute}:{onTrackRoute:(lead:RoleLeadPrefillData)=>void}){
 const [query,setQuery]=useState("");
 const term=query.trim().toLocaleLowerCase();
 const filtered=studios.filter(s=>[s.name,s.country,s.notes].join(" ").toLocaleLowerCase().includes(term));
 return <section className="route-directory" aria-labelledby="route-directory-title">
  <header className="route-directory-header"><div><span className="eyebrow">WORLDWIDE STUDIO LIST</span><h2 id="route-directory-title">Studios accepting speculative applications</h2><p>Only studios with an official open, general, unsolicited or speculative application route are listed.</p></div><strong className="route-directory-count">{filtered.length} studios</strong></header>
  <label className="route-directory-search" htmlFor="route-search">Search by studio, country or discipline<input id="route-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g. Germany, art, programming…" autoComplete="off"/></label>
  {filtered.length?<div className="route-directory-list">{filtered.map((s:Studio)=><article className="route-directory-card" key={s.name}>
   <div className="route-directory-card-top"><div><h3>{s.name}</h3><p className="route-directory-country">{s.country}</p></div><span className="route-directory-checked">Checked {s.checkedAt}</span></div>
   <p className="route-directory-notes">{s.notes}</p>
   <div className="route-directory-actions"><a className="button button-primary" href={s.applicationUrl} target="_blank" rel="noopener noreferrer">Apply on studio site ↗</a><a className="route-directory-secondary-link" href={s.websiteUrl} target="_blank" rel="noopener noreferrer">Studio website</a><a className="route-directory-secondary-link" href={s.evidenceUrl} target="_blank" rel="noopener noreferrer">Application details</a><button className="button button-secondary" type="button" onClick={()=>onTrackRoute({studioId:"",studioName:s.name,roleTitle:"Speculative application",applicationUrl:s.applicationUrl})}>Track application</button></div>
  </article>)}</div>:<p className="route-directory-empty">No matching studios. Try a different search.</p>}
 </section>;
}