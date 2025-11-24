import React, { useEffect, useState } from "react";
import api from "../../ui/api";
export default function Volunteers(){
  const [rows,setRows]=useState([]);
  useEffect(()=>{ api.get("/volunteers/all").then(r=>setRows(r.data)); },[]);
  return <div>
    <h1>Voluntarios</h1>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
      {rows.map(v=><div key={v.id} style={{border:"1px solid #eee",padding:12,borderRadius:8}}>
        <div><b>{v.full_name||"Nombre"}</b></div>
        <div>Disponibilidad: {v.days} — {v.time_from} a {v.time_to}</div>
        <div>Tarea: {v.task}</div>
        <button>Agregar</button> <button>Enviar mensaje</button>
      </div>)}
    </div>
  </div>;
}