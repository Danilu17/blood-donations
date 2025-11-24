import React, { useEffect, useState } from "react";
import api from "../../ui/api";
export default function DonorHome(){
  const [camps,setCamps]=useState([]);
  useEffect(()=>{ api.get("/campaigns").then(r=>setCamps(r.data.slice(0,2))); },[]);
  return <div>
    <h2>Hola donante!</h2>
    <div>Te faltan 3 donaciones para alcanzar el ORO 🔥</div>
    <h3>Próximas campañas</h3>
    <ul>{camps.map(c=><li key={c.id}>{c.title} — {new Date(c.start).toLocaleString()} ({c.enrolled}/{c.capacity})</li>)}</ul>
  </div>;
}