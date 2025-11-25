// client/src/pages/Campaigns.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

export function CampaignList(){
  const [items,setItems]=useState([]);
  useEffect(()=>{ api.get("/campaigns").then(r=>setItems(r.data.data)); },[]);
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Campañas</h2><Bell/></div>
      <div className="list">{items.map(c=>
        <div key={c.id} className="card row" style={{justifyContent:"space-between"}}>
          <div><strong>{c.name}</strong><div className="muted">{c.center_name} — {c.date} {c.start_time}-{c.end_time}</div></div>
          <Link className="badge" to={`/campaigns/${c.id}`}>Ver más</Link>
        </div>
      )}</div>
    </main></>);
}
export function CampaignDetail(){
  const { id } = useParams();
  const [c,setC]=useState(null);
  const [status,setStatus]=useState("");
  useEffect(()=>{ api.get(`/campaigns/${id}`).then(r=>setC(r.data.data)); },[id]);
  const enroll=async()=>{ const {data}=await api.post(`/enroll/${id}`); setStatus(data.data.status); };
  if(!c) return <div>Cargando...</div>;
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Detalle de campaña</h2><Bell/></div>
      <div className="card">
        <h3>{c.name}</h3>
        <div>{c.center_name} — {c.center_address}</div>
        <div>{c.date} {c.start_time}-{c.end_time}</div>
        <div className="badge">Cupos: {c.capacity}</div>
        <button onClick={enroll}>Inscribirme</button>
        {status && <div className="badge">Resultado: {status}</div>}
      </div>
    </main></>);
}
