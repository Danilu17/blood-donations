// client/src/pages/MyEnrollments.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

export default function MyEnrollments() {
  const [items,setItems]=useState([]);
  useEffect(()=>{ api.get("/enroll/my").then(r=>setItems(r.data.data)); },[]);
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Mis inscripciones</h2><Bell/></div>
      <table className="table">
        <thead><tr><th>Campaña</th><th>Fecha</th><th>Horario</th><th>Estado</th></tr></thead>
        <tbody>{items.map(i=><tr key={i.id}><td>{i.name}</td><td>{i.date}</td><td>{i.start_time}-{i.end_time}</td><td>{i.status}</td></tr>)}</tbody>
      </table>
    </main></>);
}
