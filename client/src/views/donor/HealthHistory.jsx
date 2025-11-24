import React, { useEffect, useState } from "react";
import api from "../../ui/api";
export default function HealthHistory(){
  const [rows,setRows]=useState([]);
  useEffect(()=>{ api.get("/health/history").then(r=>setRows(r.data)); },[]);
  return <div>
    <h1>Historial de cuestionarios</h1>
    <table><thead><tr><th>Fecha</th><th>Peso</th><th>Enfermedades</th><th>Medicamentos</th><th>Últ. donación</th><th>Grupo</th><th>Estado</th></tr></thead>
      <tbody>{rows.map(r=><tr key={r.id}>
        <td>{new Date(r.created_at).toLocaleDateString()}</td>
        <td>{r.weight}kg</td>
        <td>{JSON.parse(r.chronic||"[]").join(", ")}</td>
        <td>{r.meds}</td>
        <td>{r.last_donation?.slice(0,10)}</td>
        <td>{r.blood_group}{r.rh_factor}</td>
        <td>{r.state}</td>
      </tr>)}</tbody></table>
  </div>;
}