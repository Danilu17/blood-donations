import React, { useEffect, useState } from "react";
import api from "../../ui/api";
export default function RoleRequests(){
  const [rows,setRows]=useState([]);
  const load=()=>api.get("/admin/role-requests").then(r=>setRows(r.data)); useEffect(load,[]);
  const approve=id=>api.post(`/admin/role-requests/${id}/approve`).then(load);
  const reject=id=>api.post(`/admin/role-requests/${id}/reject`).then(load);
  return <div>
    <h1>Solicitudes</h1>
    {rows.map(r=><div key={r.id} style={{border:"1px solid #eee",padding:8,margin:"8px 0"}}>
      <div><b>{r.requester}</b> — Nuevo rol: {r.target_role}</div>
      <div>Motivo: “{r.reason}”</div>
      <button onClick={()=>approve(r.id)}>Aprobar</button>
      <button onClick={()=>reject(r.id)}>Rechazar</button>
    </div>)}
  </div>;
}
