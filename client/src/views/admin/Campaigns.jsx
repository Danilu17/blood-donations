import React, { useEffect, useState } from "react";
import api from "../../ui/api"; import { useNavigate } from "react-router-dom";
export default function AdminCamps(){
  const [rows,setRows]=useState([]); const nav=useNavigate();
  useEffect(()=>{ api.get("/admin/campaigns").then(r=>setRows(r.data)); },[]);
  return <div>
    <h1>Campañas</h1>
    <table><thead><tr><th>Nombre</th><th>Fecha</th><th>Centro</th><th>Estado</th><th></th></tr></thead>
      <tbody>{rows.map(c=><tr key={c.id} onClick={()=>nav(`/admin/campaigns/${c.id}`)} style={{cursor:"pointer"}}>
        <td>{c.title}</td><td>{new Date(c.start).toLocaleDateString()}</td><td>{c.center_name}</td><td>{c.status}</td><td><button>Ver detalles</button></td>
      </tr>)}</tbody></table>
  </div>;
}