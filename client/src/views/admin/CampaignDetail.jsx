import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; import api from "../../ui/api";
export default function AdminCampDetail(){
  const { id } = useParams(); const [c,setC]=useState(null);
  useEffect(()=>{ api.get(`/campaigns/${id}`).then(r=>setC(r.data)); },[id]);
  if(!c) return null;
  return <div>
    <h1>Detalle de campaña</h1>
    <div><b>{c.title}</b></div>
    <div>{c.address}</div>
    <div>{new Date(c.start).toLocaleString()} - {new Date(c.end).toLocaleTimeString()}</div>
    <div>Inscritos: {c.stats?.regs}/{c.capacity}</div>
    <button onClick={()=>api.post(`/campaigns/${id}/finalize`).then(()=>alert("Finalizada"))}>Finalizar</button>
    <button onClick={()=>api.post(`/campaigns/${id}/cancel`).then(()=>alert("Cancelada"))}>Cancelar</button>
  </div>;
}