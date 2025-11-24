import React, { useEffect, useState } from "react";
import api from "../../ui/api";
export default function MyRegistrations(){
  const [rows,setRows]=useState([]);
  useEffect(()=>{ api.get("/registrations/mine").then(r=>setRows(r.data)); },[]);
  return <div>
    <h1>Mis inscripciones</h1>
    <ul>{rows.map(r=><li key={r.id} style={{display:"flex",gap:8,alignItems:"center"}}>
      <span style={{minWidth:120}}>{new Date(r.start).toLocaleDateString()}</span>
      <span style={{flex:1}}>{r.title}</span>
      <span>{r.status}</span>
      <button onClick={()=>api.delete(`/registrations/${r.id}`).then(()=>setRows(rows.filter(x=>x.id!==r.id)))}>Darme de baja</button>
    </li>)}</ul>
  </div>;
}
