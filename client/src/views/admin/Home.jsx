import React, { useEffect, useState } from "react";
import api from "../../ui/api";
export default function AdminHome(){
  const [stats,setStats]=useState(null);
  useEffect(()=>{ api.get("/admin/stats").then(r=>setStats(r.data)); },[]);
  return <div>
    <h2>Hola admin!</h2>
    {stats && <>
      <div>Campañas activas: {stats.campaigns}</div>
      <div>Donaciones este mes: {stats.donations}</div>
      <div>Solicitudes pendientes: {stats.pending}</div>
      <h3>Donantes activos por mes</h3>
      <div style={{display:"flex", gap:4, alignItems:"flex-end", height:160}}>
        {stats.months.map((m,i)=><div key={i} title={`Mes ${m.month}`} style={{width:24, background:"#ddd", height: m.activeDonors/100}}/>)}
      </div>
    </>}
  </div>;
}