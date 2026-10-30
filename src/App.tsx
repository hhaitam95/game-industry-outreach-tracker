import {useEffect,useMemo,useState} from "react";
import type {TrackedApplication,TrackerStatus} from "./components/studio.types";
import StudioDirectory from "./components/StudioDirectory";
import ApplicationTracker from "./components/ApplicationTracker";

const STORAGE_KEY="studio-outreach-tracker-v1";
const nav=[{id:"studios",label:"Studio directory",icon:"▦"},{id:"applications",label:"My applications",icon:"▤"}] as const;

function readApplications():TrackedApplication[]{
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return [];
    const parsed=JSON.parse(raw);
    if(!Array.isArray(parsed))return [];
    return parsed.filter((item):item is TrackedApplication=>item&&typeof item.id==="string"&&typeof item.studioName==="string"&&typeof item.status==="string");
  }catch{return [];}
}

export default function App(){
  const [page,setPage]=useState<"studios"|"applications">("studios");
  const [applications,setApplications]=useState<TrackedApplication[]>([]);
  const [loaded,setLoaded]=useState(false);

  useEffect(()=>{setApplications(readApplications());setLoaded(true);},[]);
  useEffect(()=>{
    if(!loaded)return;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(applications));}
    catch{window.alert("The browser could not save your tracker. Check available site storage.");}
  },[applications,loaded]);

  const counts=useMemo(()=>({
    saved:applications.filter(a=>a.status==="saved").length,
    active:applications.filter(a=>["in_progress","applied","interview","offer"].includes(a.status)).length
  }),[applications]);

  function trackStudio(studio:{name:string;websiteUrl:string;applicationUrl:string;country:string},status:TrackerStatus){
    const timestamp=new Date().toISOString();
    setApplications(previous=>{
      const existing=previous.find(item=>item.studioName===studio.name);
      if(existing&&status==="saved")return previous;
      const next:TrackedApplication={
        id:existing?.id||studio.name.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
        studioName:studio.name,
        websiteUrl:studio.websiteUrl,
        applicationUrl:studio.applicationUrl,
        country:studio.country,
        hqLabel:"HQ",
        status,
        createdAt:existing?.createdAt||timestamp,
        updatedAt:timestamp,
        appliedAt:status==="applied"?(existing?.appliedAt||timestamp):existing?.appliedAt||null,
        note:existing?.note||""
      };
      return [next,...previous.filter(item=>item.studioName!==studio.name)];
    });
  }

  function markApplied(studio:{name:string;websiteUrl:string;applicationUrl:string;country:string}){
    const confirmed=window.confirm("Confirm that you have submitted an application to "+studio.name+"? This will add it to My Applications as Applied.");
    if(!confirmed)return;
    trackStudio(studio,"applied");
    setPage("applications");
  }

  function changeStatus(id:string,status:TrackerStatus){
    setApplications(previous=>previous.map(item=>item.id!==id?item:{
      ...item,status,updatedAt:new Date().toISOString(),
      appliedAt:status==="applied"?(item.appliedAt||new Date().toISOString()):item.appliedAt
    }));
  }

  function removeApplication(id:string){
    const item=applications.find(a=>a.id===id);
    if(!item||!window.confirm("Remove "+item.studioName+" from My Applications?"))return;
    setApplications(previous=>previous.filter(a=>a.id!==id));
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#studios" onClick={e=>{e.preventDefault();setPage("studios");}}>
        <span className="brand-mark">✦</span><span><strong>STUDIO<span>SCOUT</span></strong><small>GAME INDUSTRY DIRECTORY</small></span>
      </a>
      <div className="sidebar-section-label">WORKSPACE</div>
      <nav className="main-navigation" aria-label="Main navigation">
        {nav.map(item=><button key={item.id} className={page===item.id?"nav-link active":"nav-link"} type="button" onClick={()=>setPage(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span>{item.id==="applications"?<b>{applications.length}</b>:null}</button>)}
      </nav>
      <div className="sidebar-spacer"/>
      <div className="sidebar-mini-card"><span className="mini-card-icon">◈</span><strong>{applications.length} tracked studios</strong><p>{counts.saved} saved · {counts.active} active</p><button type="button" onClick={()=>setPage("applications")}>View tracker →</button></div>
      <div className="sidebar-footer"><span className="online-dot"/> Personal workspace <span>·</span> Local only</div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <div className="breadcrumb">STUDIOSCOUT <span>/</span> {page==="studios"?"DISCOVER":"MY APPLICATIONS"}</div>
        <div className="topbar-right"><span className="topbar-tag">PERSONAL RESEARCH</span><span className="avatar">H</span></div>
      </header>
      <div className="page-content">
        {page==="studios"?<StudioDirectory applications={applications} onSave={studio=>trackStudio(studio,"saved")} onMarkApplied={markApplied}/>:<ApplicationTracker applications={applications} onChangeStatus={changeStatus} onRemove={removeApplication} onOpenDirectory={()=>setPage("studios")}/>}
      </div>
      <footer className="app-footer"><span>STUDIOSCOUT</span><span>Studio profiles · Official application routes · Manual tracking</span><span>© 2026</span></footer>
    </main>
  </div>;
}
