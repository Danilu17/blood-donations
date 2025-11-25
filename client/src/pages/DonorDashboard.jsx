// client/src/pages/DonorDashboard.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

export default function DonorDashboard() {
  const [campaigns,setCampaigns]=useState([]);
  const [rank,setRank]=useState({level:"Bronce", progress:0});
  useEffect(()=>{ api.get("/campaigns").then(r=>setCampaigns(r.data.data.slice(0,3))); api.get("/donations/history").then(()=>{}).catch(()=>{}); },[]);
  useEffect(()=>{ (async()=>{
    const {data} = await api.get("/donations/history");
    const count = data.data.length;
    const next = count<3?3:count<6?6:16;
    setRank({ level: count>=16?"Oro":count>=6?"Plata":count>=3?"Bronce":"Sin nivel", progress: Math.min(100, Math.round((count/(next||1))*100)) });
  })(); },[]);
  return (
    <>
      <Sidebar/>
      <main className="main">
        <div className="header"><h2>Inicio</h2><Bell/></div>
        <div className="grid grid2">
          <div className="card">
            <h3>Hola!</h3>
            <div>Tu nivel: <strong>{rank.level}</strong> — Progreso al siguiente nivel: {rank.progress}%</div>
          </div>
          <div className="card"><h3>Próximas campañas</h3>
            <div className="list">{campaigns.map(c=><div key={c.id} className="row" style={{justifyContent:"space-between"}}><div>{c.name} — {c.date} {c.start_time}-{c.end_time}</div><a className="badge" href={`/campaigns/${c.id}`}>Ver</a></div>)}</div>
          </div>
        </div>
      </main>
    </>
  );
}
