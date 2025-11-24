import React, { useEffect, useState } from "react";
import api from "../../ui/api"; import { Link } from "react-router-dom";
export default function Campaigns(){
  const [rows,setRows]=useState([]);
  useEffect(()=>{ api.get("/campaigns").then(r=>setRows(r.data)); },[]);
  return <div>
    <h1>Campañas</h1>
    <ul style={{display:"grid", gap:10}}>
      {rows.map(r=><li key={r.id} style={{border:"1px solid #eee",padding:8,borderRadius:8}}>
        <div style={{fontWeight:"bold"}}>{r.title}</div>
        <div>{r.center_name} — {r.address}</div>
        <div>{new Date(r.start).toLocaleString()} - {new Date(r.end).toLocaleTimeString()}</div>
        <div>{r.enrolled}/{r.capacity} cupos</div>
        <Link to={`/donor/campaigns/${r.id}`}>Ver más…</Link>
      </li>)}
    </ul>
  </div>;
}
