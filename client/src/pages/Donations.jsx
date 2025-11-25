// client/src/pages/Donations.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

export default function Donations() {
  const [items,setItems]=useState([]);
  useEffect(()=>{ api.get("/donations/history").then(r=>setItems(r.data.data)); },[]);
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Historial de donaciones</h2><Bell/></div>
      <div className="row" style={{justifyContent:"space-between"}}>
        <div className="badge"><a href="http://localhost:4000/api/donations/history.pdf" target="_blank">Exportar PDF</a></div>
      </div>
      <div className="list" style={{marginTop:12}}>
        {items.map(d=><div key={d.id} className="card row" style={{justifyContent:"space-between"}}>
          <div><strong>{d.center_name}</strong> — {d.date} — {d.blood_type} — {d.volume_ml}ml</div>
          <a className="badge" href={`http://localhost:4000/api/donations/${d.id}/certificate.pdf`} target="_blank">Descargar certificado</a>
        </div>)}
      </div>
    </main></>);
}
