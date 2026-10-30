import {useMemo,useState} from "react";
import StudioLogo from "./StudioLogo";
import type {TrackedApplication,TrackerStatus} from "./studio.types";
import "./tracker.css";

const tabs:{id:string;label:string;statuses:TrackerStatus[]}[]=[
  {id:"saved",label:"Saved",statuses:["saved"]},
  {id:"in_progress",label:"In Progress",statuses:["in_progress"]},
  {id:"applied",label:"Applied",statuses:["applied"]},
  {id:"interview",label:"Interview",statuses:["interview"]},
  {id:"offer",label:"Offer",statuses:["offer"]},
  {id:"archived",label:"Archived",statuses:["archived"]}
];
const statusLabels:Record<TrackerStatus,string>={
  saved:"Saved",
  in_progress:"In Progress",
  applied:"Applied",
  interview:"Interview",
  offer:"Offer",
  archived:"Not moving forward"
};

export default function ApplicationTracker({applications,onChangeStatus,onRemove,onOpenDirectory}:{applications:TrackedApplication[];onChangeStatus:(id:string,status:TrackerStatus)=>void;onRemove:(id:string)=>void;onOpenDirectory:()=>void}){
  const [activeTab,setActiveTab]=useState("saved");
  const [query,setQuery]=useState("");
  const active=tabs.find(t=>t.id===activeTab)||tabs[0];
  const counts=useMemo(()=>Object.fromEntries(tabs.map(t=>[t.id,applications.filter(a=>t.statuses.includes(a.status)).length])),[applications]);
  const visible=applications.filter(a=>active.statuses.includes(a.status)&&[a.studioName,a.country,a.hqLabel].join(" ").toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
  return <section className="tracker-page">
    <div className="tracker-header"><div><span className="eyebrow">YOUR JOB SEARCH</span><h2>My applications</h2><p>Keep track of studios you’re considering and the applications you’ve sent.</p></div><button className="primary-action" onClick={onOpenDirectory} type="button">＋ Explore studios</button></div>
    <div className="tracker-summary">
      <div><strong>{applications.length}</strong><span>Total tracked</span></div>
      <div><strong>{counts.applied+counts.interview+counts.offer}</strong><span>Applications sent</span></div>
      <div><strong>{counts.interview}</strong><span>In interview</span></div>
      <div><strong>{counts.offer}</strong><span>Offers</span></div>
    </div>
    <div className="tracker-tabs" role="tablist" aria-label="Application statuses">
      {tabs.map(tab=><button className={activeTab===tab.id?"tracker-tab active":"tracker-tab"} type="button" key={tab.id} role="tab" aria-selected={activeTab===tab.id} onClick={()=>setActiveTab(tab.id)}><span>{tab.label}</span><b>{counts[tab.id]||0}</b></button>)}
    </div>
    <div className="tracker-list-toolbar"><div><strong>{active.label}</strong><span>{visible.length} {visible.length===1?"studio":"studios"}</span></div><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your tracker…"/></div>
    {visible.length?<div className="application-cards">{visible.map(item=><article className="application-card" key={item.id}>
      <StudioLogo name={item.studioName} websiteUrl={item.websiteUrl} size="lg"/>
      <div className="application-card-main"><div className="application-card-title"><h3>{item.studioName}</h3><span className={"application-status status-"+item.status}>{statusLabels[item.status]}</span></div>
        <p>{item.country==="Not stated"?"🌍 Location not disclosed":item.country} {item.hqLabel?"· "+item.hqLabel:""}</p>
        <div className="application-meta"><span>Added {new Date(item.createdAt).toLocaleDateString()}</span>{item.appliedAt?<span>Applied {new Date(item.appliedAt).toLocaleDateString()}</span>:null}</div>
        <div className="application-card-actions">{item.applicationUrl?<a href={item.applicationUrl} target="_blank" rel="noopener noreferrer">Application page ↗</a>:null}<a href={item.websiteUrl} target="_blank" rel="noopener noreferrer">Studio website ↗</a></div>
      </div>
      <div className="application-card-controls"><label>Update status<select aria-label={"Update "+item.studioName+" status"} value={item.status} onChange={e=>onChangeStatus(item.id,e.target.value as TrackerStatus)}>{tabs.map(t=><option key={t.id} value={t.statuses[0]}>{statusLabels[t.statuses[0]]}</option>)}</select></label><button className="remove-application" type="button" onClick={()=>onRemove(item.id)}>Remove</button></div>
    </article>)}</div>:<div className="tracker-empty"><div className="empty-mark">✳</div><h3>{query?"No matching studios":"Nothing here yet"}</h3><p>{query?"Try another studio name or clear your search.":activeTab==="saved"?"Save studios from the directory to build your shortlist.":"Studios will appear here when you update their application status."}</p>{!query?<button type="button" className="secondary-action" onClick={onOpenDirectory}>Browse studio directory</button>:null}</div>}
    <p className="tracker-storage-note">Your tracker is stored in this browser only. No account or server sync is used.</p>
  </section>;
}
