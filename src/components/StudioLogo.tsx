import {useState} from "react";

function getLogoSources(websiteUrl:string){
  try{
    const domain=new URL(websiteUrl).hostname.replace(/^www\./,"");
    return [
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
      `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`
    ];
  }catch{return [];}
}

export default function StudioLogo({name,websiteUrl,size="md"}:{name:string;websiteUrl:string;size?:"sm"|"md"|"lg"}){
  const [sourceIndex,setSourceIndex]=useState(0);
  const sources=getLogoSources(websiteUrl);
  const initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join("").toUpperCase();
  const source=sources[sourceIndex];
  return <span className={`studio-logo studio-logo-${size}`} role="img" aria-label={name+" logo"} title={name}>
    {source?<img src={source} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={()=>setSourceIndex(current=>current+1)}/>:<span>{initials}</span>}
  </span>;
}
