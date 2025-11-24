import React, { useEffect, useState } from "react";
import api from "../../ui/api";
export default function Enrollments(){
  const [rows,setRows]=useState([]);
  useEffect(()=>{
    api.get("/campaigns").then(async r=>{
      const ids = r.data.map(x=>x.id);
      const all = [];
      for (const id of ids) {
        const reg = await fetch(`http://localhost:4000/api/campaigns/${id}`).then(x=>x.json());
        const regs = await fetch(`http://localhost:4000/api/registrations/mine`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`}}); // not ideal; kept simple
      }
    });
    api.get("/campaigns").then(async r => {
      const campIds = r.data.map(x=>x.id);
      const items=[];
      for (const cid of campIds) {
        const regs = await fetch(`http://localhost:4000/api/admin/campaigns`).then(x=>x.json()); // why: quick mock list
      }
    });
    // Simple view listing all registrations (mock): fetch from admin endpoint
    fetch("http://localhost:4000/api/admin/campaigns", { headers: { Authorization:`Bearer ${localStorage.getItem("token")}`}})
      .then(r=>r.json()).then(data=>{
        const arr=[];
        data.forEach(c=> arr.push({ campaign:c.title, id: c.id, status:c.status }));
        setRows(arr);
      });
  },[]);
  return <div>
    <h1>Inscriptos</h1>
    <p>(Vista simplificada: usa acciones por registro cuando se integren IDs reales)</p>
    <ul>{rows.map((r,i)=><li key={i}>{r.campaign} — Estado campaña: {r.status}</li>)}</ul>
  </div>;
}