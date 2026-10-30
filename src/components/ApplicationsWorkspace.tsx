import {useEffect,useState,type FormEvent} from "react";
import type {RoleLeadPrefill} from "./workspace.types";
import {APPLICATION_STATUSES,validateWorkspaceData} from "../lib/private-data/schema.mjs";
import "./applications.css";

type Workspace=ReturnType<typeof validateWorkspaceData>;
type Application=Workspace["applications"][number];
type Props={workspace:Workspace;onSaveWorkspace:(next:Workspace,message:string)=>Promise<boolean>;initialLead?:RoleLeadPrefill|null;onLeadPrefillConsumed?:()=>void};
const LABELS:Record<string,string>={interested:"Interested",applied:"Applied",interview:"Interview",offered:"Offer",rejected:"Rejected",withdrawn:"Withdrawn"};
const now=()=>new Date().toISOString();

export default function ApplicationsWorkspace({workspace,onSaveWorkspace,initialLead=null,onLeadPrefillConsumed=()=>undefined}:Props){
 const [studioName,setStudioName]=useState("");
 const [applicationUrl,setApplicationUrl]=useState("");
 const [notes,setNotes]=useState("");
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");

 useEffect(()=>{
  if(!initialLead)return;
  setStudioName(initialLead.studioName);
  setApplicationUrl(initialLead.applicationUrl);
  setNotes("");
  setMessage("Studio details added. Save it when you are ready to track this application.");
  setError("");
  onLeadPrefillConsumed();
 },[initialLead,onLeadPrefillConsumed]);

 async function addApplication(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setError("");
  const name=studioName.trim();
  if(!name){setError("Enter a studio name.");return;}
  const timestamp=now();
  const record:Application={
   id:crypto.randomUUID(),studioName:name,roleTitle:"Speculative application",status:"interested",
   applicationUrl:applicationUrl.trim(),notes:notes.trim(),createdAt:timestamp,updatedAt:timestamp,
   studioId:"",opportunityId:"",outreachDraftId:"",nextFollowUpAt:null,
   history:[{id:crypto.randomUUID(),type:"note",occurredAt:timestamp,note:"Added to the private tracker. No application submission is implied."}],
  };
  if(await onSaveWorkspace({...workspace,applications:[record,...workspace.applications]},"Application saved.")){
   setStudioName("");setApplicationUrl("");setNotes("");setMessage("Saved to your private tracker.");
  }
 }

 async function changeStatus(application:Application,rawStatus:string){
  if(!(APPLICATION_STATUSES as readonly string[]).includes(rawStatus)||rawStatus===application.status)return;
  const status=rawStatus as Application["status"];
  const timestamp=now();
  const event:Application["history"][number]={
   id:crypto.randomUUID(),type:status==="applied"?"submitted":"status-change",occurredAt:timestamp,
   note:status==="applied"?"User marked the application as personally submitted.":"Status changed to "+status+".",
  };
  const applications=workspace.applications.map(item=>item.id===application.id?{...item,status,updatedAt:timestamp,history:[...item.history,event].slice(-200)}:item);
  await onSaveWorkspace({...workspace,applications},"Application status updated.");
 }

 async function removeApplication(application:Application){
  if(!window.confirm("Remove "+application.studioName+" from your tracker?"))return;
  const applications=workspace.applications.filter(item=>item.id!==application.id);
  await onSaveWorkspace({...workspace,applications},"Application removed from the tracker.");
 }

 const applications=[...workspace.applications].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
 return <section className="applications-simple">
  <header><span className="eyebrow">YOUR PRIVATE LIST</span><h2>Application tracker</h2><p>Save studios you plan to contact, then update the status yourself.</p></header>
  <form className="applications-simple-form" onSubmit={event=>void addApplication(event)}>
   <h3>Add a studio</h3>
   <label>Studio<input value={studioName} onChange={event=>setStudioName(event.target.value)} maxLength={180} required placeholder="Studio name"/></label>
   <label>Official application page<input type="url" value={applicationUrl} onChange={event=>setApplicationUrl(event.target.value)} maxLength={2000} placeholder="https://…"/></label>
   <label>Private note (optional)<textarea value={notes} onChange={event=>setNotes(event.target.value)} maxLength={4000} rows={2} placeholder="What you plan to send or the next step…"/></label>
   <button className="button button-primary" type="submit" disabled={!studioName.trim()}>Save to tracker</button>
  </form>
  {error?<p className="applications-simple-message" role="alert">{error}</p>:null}
  {message?<p className="applications-simple-message" role="status">{message}</p>:null}
  <div className="applications-simple-list">
   <div className="applications-simple-list-heading"><h3>Saved applications</h3><span>{applications.length}</span></div>
   {applications.length?applications.map(application=><article className="applications-simple-card" key={application.id}>
    <div className="applications-simple-card-top">
     <div><h4>{application.studioName}</h4><small>Added {new Date(application.createdAt).toLocaleDateString()}</small></div>
     <label>Status<select value={application.status} onChange={event=>void changeStatus(application,event.target.value)}>
      {APPLICATION_STATUSES.map((status:string)=><option key={status} value={status}>{LABELS[status]??status}</option>)}
     </select></label>
    </div>
    {application.applicationUrl?<a href={application.applicationUrl} target="_blank" rel="noopener noreferrer">Open application page ↗</a>:null}
    {application.notes?<p>{application.notes}</p>:null}
    <button className="applications-simple-remove" type="button" onClick={()=>void removeApplication(application)}>Remove</button>
   </article>):<p className="applications-simple-empty">Nothing saved yet. Add a studio from the directory or above.</p>}
  </div>
 </section>;
}
