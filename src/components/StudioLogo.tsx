import {useState} from "react";

export function getStudioLogoUrl(websiteUrl:string){
  try{
    const domain=new URL(websiteUrl).hostname.replace(/^www\./,"");
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  }catch{return "";}
}

export default function StudioLogo({name,websiteUrl,size="md"}:{name:string;websiteUrl:string;size?:"sm"|"md"|"lg"}){
  const [failed,setFailed]=useState(false);
  const src=getStudioLogoUrl(websiteUrl);
  const initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join("").toUpperCase();
  return <span className={`studio-logo studio-logo-${size}`} aria-label={name}>
    {src&&!failed?<img src={src} alt="" loading="lazy" onError={()=>setFailed(true)}/>:<span>{initials}</span>}
  </span>;
}
