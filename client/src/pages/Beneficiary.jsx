// client/src/pages/Beneficiary.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

export default function Beneficiary() {
  const [reqs,setReqs]=useState([]); const [form,setForm]=useState({blood_group:"O",rh_factor:"Rh+",units:1,center_id:1,urgency:"critical",estimated_date:"2025-11-25"});
  const submit=async(e)=>{ e.preventDefault(); await api.post("/beneficiary/requests",form); const r=await api.get("/beneficiary/requests/mine"); setReqs(r.data.data); };
  useEffect(()=>{ api.get("/beneficiary/requests/mine").then(r=>setReqs(r.data.data)); },[]);
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Beneficiario</h2><Bell/></div>
      <div className="grid grid2">
        <div className="card">
          <h3>Registrar solicitud de sangre</h3>
          <form onSubmit={submit} className="list">
            <label>Grupo<select value={form.blood_group} onChange={e=>setForm({...form,blood_group:e.target.value})}><option>A</option><option>B</option><option>AB</option><option>O</option></select></label>
            <label>Factor<select value={form.rh_factor} onChange={e=>setForm({...form,rh_factor:e.target.value})}><option>Rh+</option><option>Rh-</option></select></label>
            <input type="number" value={form.units} onChange={e=>setForm({...form,units:+e.target.value})} placeholder="Unidades" />
            <input value={form.center_id} onChange={e=>setForm({...form,center_id:+e.target.value})} placeholder="Centro ID" />
            <select value={form.urgency} onChange={e=>setForm({...form,urgency:e.target.value})}><option>normal</option><option>urgent</option><option>critical</option></select>
            <input type="date" value={form.estimated_date} onChange={e=>setForm({...form,estimated_date:e.target.value})}/>
            <button>Enviar</button>
          </form>
        </div>
        <div className="card">
          <h3>Mis solicitudes</h3>
          <table className="table"><thead><tr><th>Fecha</th><th>Grupo</th><th>Unidades</th><th>Estado</th></tr></thead>
          <tbody>{reqs.map(r=><tr key={r.id}><td>{r.estimated_date}</td><td>{r.blood_group}{r.rh_factor==='Rh+'?'+':'-'}</td><td>{r.units}</td><td>{r.status}</td></tr>)}</tbody></table>
        </div>
      </div>
    </main></>);
}
