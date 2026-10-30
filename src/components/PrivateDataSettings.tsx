import {useCallback,useEffect,useRef,useState,type ChangeEvent,type FormEvent} from "react";
import {createEncryptedSession,MAX_ENCRYPTED_BACKUP_BYTES,openEncryptedSession} from "../lib/private-data/crypto-vault.mjs";
import {createIndexedDbVaultStore} from "../lib/private-data/indexed-db.mjs";
import {validateWorkspaceData} from "../lib/private-data/schema.mjs";
import type {RoleLeadPrefill} from "./workspace.types";
import ApplicationsWorkspace from "./ApplicationsWorkspace";
import "./private-settings.css";

type Workspace=ReturnType<typeof validateWorkspaceData>;
type Session=Awaited<ReturnType<typeof createEncryptedSession>>["session"];
function downloadBackup(contents:string){
 const url=URL.createObjectURL(new Blob([contents],{type:"application/json;charset=utf-8"}));
 const link=document.createElement("a");link.href=url;link.download="studio-outreach-encrypted-backup.json";
 document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function PrivateDataSettings({activePageId,initialLead=null,onLeadPrefillConsumed=()=>undefined}:{
 activePageId:string;initialLead?:RoleLeadPrefill|null;onLeadPrefillConsumed?:()=>void;
}){
 const storeRef=useRef<ReturnType<typeof createIndexedDbVaultStore>|null>(null);
 if(!storeRef.current)storeRef.current=createIndexedDbVaultStore();
 const store=storeRef.current;
 const [storageReady,setStorageReady]=useState<boolean|null>(null);
 const [vaultExists,setVaultExists]=useState(false);
 const [session,setSession]=useState<Session|null>(null);
 const [workspace,setWorkspace]=useState<Workspace|null>(null);
 const [passphrase,setPassphrase]=useState("");
 const [backupPassphrase,setBackupPassphrase]=useState("");
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 const [error,setError]=useState("");
 useEffect(()=>{
  let cancelled=false;
  void store.load().then(envelope=>{if(!cancelled){setVaultExists(Boolean(envelope));setStorageReady(true);}})
   .catch((loadError:unknown)=>{if(!cancelled){setError(loadError instanceof Error?loadError.message:"Local storage is unavailable.");setStorageReady(false);}});
  return ()=>{cancelled=true;};
 },[store]);
 const persistWorkspace=useCallback(async(next:Workspace,successMessage:string)=>{
  if(!session){setError("Unlock the tracker before saving.");return false;}
  setBusy(true);setError("");setNotice("");
  try{
   const updated=validateWorkspaceData({...next,updatedAt:new Date().toISOString()});
   await store.save(await session.encrypt(updated));setWorkspace(updated);setVaultExists(true);setNotice(successMessage);return true;
  }catch(saveError){setError(saveError instanceof Error?saveError.message:"Could not save the tracker.");return false;}
  finally{setBusy(false);}
 },[session,store]);
 async function createOrUnlock(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");setNotice("");
  try{
   if(vaultExists){
    const envelope=await store.load();if(!envelope)throw new Error("No local tracker was found. Refresh and try again.");
    const opened=await openEncryptedSession(envelope,passphrase);setSession(opened.session);setWorkspace(opened.data);
   }else{
    const created=await createEncryptedSession(passphrase);await store.save(created.envelope);
    setSession(created.session);setWorkspace(created.data);setVaultExists(true);
   }
   setPassphrase("");setNotice("Tracker unlocked. Your records stay in this browser.");
  }catch(e){setPassphrase("");setError(e instanceof Error?e.message:"Could not unlock the tracker.");}
  finally{setBusy(false);}
 }
 async function exportBackup(){
  if(!workspace||!session)return;
  setBusy(true);setError("");setNotice("");
  try{
   const updated=validateWorkspaceData({...workspace,updatedAt:new Date().toISOString()});
   const encrypted=await session.encrypt(updated);await store.save(encrypted);downloadBackup(encrypted);
   setWorkspace(updated);setNotice("Encrypted backup downloaded. Keep the file and passphrase safe.");
  }catch(e){setError(e instanceof Error?e.message:"Could not export a backup.");}
  finally{setBusy(false);}
 }
 async function importBackup(event:ChangeEvent<HTMLInputElement>){
  const file=event.target.files?.[0];event.target.value="";
  if(!file||!session)return;
  if(file.size>MAX_ENCRYPTED_BACKUP_BYTES){setError("Choose an encrypted backup no larger than 5 MiB.");return;}
  if(!window.confirm("Importing this backup replaces the tracker in this browser. Continue?"))return;
  setBusy(true);setError("");setNotice("");
  try{
   const serialized=await file.text();const restored=await openEncryptedSession(serialized,backupPassphrase);
   const validated=validateWorkspaceData(restored.data);await store.save(serialized);
   setSession(restored.session);setWorkspace(validated);setBackupPassphrase("");setVaultExists(true);setNotice("Backup restored.");
  }catch(e){setBackupPassphrase("");setError(e instanceof Error?e.message:"Could not restore the backup.");}
  finally{setBusy(false);}
 }
 function lockTracker(){setSession(null);setWorkspace(null);setPassphrase("");setBackupPassphrase("");setNotice("Tracker locked.");setError("");}
 async function deleteTracker(){
  if(!window.confirm("Delete the encrypted tracker from this browser? This cannot be undone."))return;
  setBusy(true);
  try{await store.clear();setSession(null);setWorkspace(null);setVaultExists(false);setNotice("Local tracker deleted.");setError("");}
  catch(e){setError(e instanceof Error?e.message:"Could not delete the tracker.");}
  finally{setBusy(false);}
 }
 const unlocked=Boolean(session&&workspace);
 return <div className="private-settings">
  <header className="private-settings-header"><span className="eyebrow">{activePageId==="settings"?"LOCAL STORAGE":"PRIVATE TRACKER"}</span>
   <h2>{activePageId==="settings"?"Your tracker stays on this device":"Your application tracker"}</h2>
   <p>{activePageId==="settings"?"Your saved applications are encrypted in this browser. Nothing is uploaded or synced.":"Save studios you plan to contact and update each status yourself."}</p>
  </header>
  {error?<p className="private-settings-message error" role="alert">{error}</p>:null}
  {notice?<p className="private-settings-message" role="status">{notice}</p>:null}
  {storageReady===null?<p>Opening local storage…</p>:storageReady===false?<p>Local browser storage is unavailable. Open this website in a current browser.</p>:
   !unlocked?<form className="private-settings-card private-settings-form" onSubmit={event=>void createOrUnlock(event)}>
    <h3>{vaultExists?"Unlock your tracker":"Create your private tracker"}</h3>
    <p>{vaultExists?"Enter your passphrase to open the applications saved in this browser.":"Choose a passphrase of at least 12 characters. It cannot be recovered if you forget it."}</p>
    <label htmlFor="tracker-passphrase">Passphrase</label>
    <input id="tracker-passphrase" type="password" value={passphrase} onChange={event=>setPassphrase(event.target.value)} minLength={vaultExists?undefined:12} required/>
    <button className="button button-primary" type="submit" disabled={busy||!passphrase}>{busy?"Please wait…":vaultExists?"Unlock tracker":"Create tracker"}</button>
    <small>Your records stay in this browser. Export an encrypted backup from Settings.</small>
   </form>:activePageId==="applications"&&workspace?
    <ApplicationsWorkspace workspace={workspace} onSaveWorkspace={persistWorkspace} initialLead={initialLead} onLeadPrefillConsumed={onLeadPrefillConsumed}/>:
    workspace?<section className="private-settings-card">
     <h3>Backup and security</h3><p>Your records are encrypted before they are saved to this browser. Your passphrase is not stored.</p>
     <div className="private-settings-actions">
      <button className="button button-primary" type="button" disabled={busy} onClick={()=>void exportBackup()}>Download encrypted backup</button>
      <button className="button button-secondary" type="button" disabled={busy} onClick={lockTracker}>Lock tracker</button>
      <button className="button button-danger" type="button" disabled={busy} onClick={()=>void deleteTracker()}>Delete local tracker</button>
     </div>
     <label htmlFor="tracker-backup-passphrase">Backup passphrase</label><input id="tracker-backup-passphrase" type="password" value={backupPassphrase} onChange={event=>setBackupPassphrase(event.target.value)}/>
     <label htmlFor="tracker-backup-file">Restore encrypted backup (max 5 MiB)</label><input id="tracker-backup-file" type="file" accept="application/json,.json" onChange={event=>void importBackup(event)}/>
     <small>Importing a backup replaces the current tracker. Keep a copy of the file and its passphrase.</small>
    </section>:null}
 </div>;
}
