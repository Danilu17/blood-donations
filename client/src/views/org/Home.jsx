import React, { useEffect, useState } from "react";
import api from "../../ui/api";
export default function OrgHome(){
  const [stats,setStats]=useState(null); const [nextC,setNextC]=useState(null);
  useEffect(()=>{
    api.get("/admin/stats").then(r=>setStats(r.data));
    api.get("/campaigns").then(r=>setNextC(r.data.find(x=>x.status==="ACTIVE")));
  },[]);
  return <div>
    <h2>Hola organizador!</h2>
    {stats && <div>Campañas activas: {stats.campaigns} — Voluntarios: 14 — Inscritos: 127</div>}
    {nextC && <div style={{marginTop:8}}>
      <h3>Próxima campaña</h3>
      <div>{nextC.title} — {new Date(nextC.start).toLocaleString()} — Inscriptos: {nextC.enrolled}/{nextC.capacity}</div>
    </div>}
  </div>;
}