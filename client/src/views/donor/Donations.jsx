import React, { useEffect, useState } from "react";
import api from "../../ui/api";
export default function Donations(){
  const [rows,setRows]=useState([]);
  useEffect(()=>{ api.get("/donations/mine").then(r=>setRows(r.data)); },[]);
  return <div>
    <h1>Historial de donaciones</h1>
    {rows.map(r=><div key={r.id} style={{border:"1px solid #eee",padding:8,margin:"8px 0"}}>
      <div><b>{r.center_name}</b></div>
      <div>{new Date(r.date).toLocaleDateString()} — Tipo: {r.blood_group}{r.rh_factor} — Cantidad: {r.volume_ml}ml</div>
      <div>{r.notes}</div>
      <a href={`http://localhost:4000/api/certificates/${r.id}`} target="_blank">Descargar certificado</a>
    </div>)}
  </div>;
}