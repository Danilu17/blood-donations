import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; import api from "../../ui/api";
export default function CampaignDetail(){
  const { id } = useParams(); const [c,setC]=useState(null);
  const [status,setStatus]=useState("");
  useEffect(()=>{ api.get(`/campaigns/${id}`).then(r=>setC(r.data)); },[id]);
  const join=async()=>{
    const {data}=await api.post(`/registrations/${id}`); setStatus(data.status);
  };
  if(!c) return null;
  const full = c.stats?.regs >= c.capacity;
  return <div>
    <h1>Detalle de campaña</h1>
    <h2>{c.title}</h2>
    <div>{new Date(c.start).toLocaleString()} - {new Date(c.end).toLocaleTimeString()}</div>
    <div>Requisitos solicitados:</div>
    <ul>{(JSON.parse(c.requirements||"[]")).map((r,i)=><li key={i}>{r}</li>)}</ul>
    <div>{c.address}</div>
    <div>{c.stats?.regs}/{c.capacity} cupos</div>
    <button onClick={join}>{full?"Unirme a la lista":"Inscribirme"}</button>
    {status && <div>Estado: {status}</div>}
  </div>;
}
