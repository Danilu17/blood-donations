// client/src/pages/Volunteer.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

export default function Volunteer() {
  const [items,setItems]=useState([]);
  const [form,setForm]=useState({days:"Lun,Mié",from_time:"09:00",to_time:"13:00",task:"Logística",notes:""});
  useEffect(()=>{ api.get("/volunteer").then(r=>setItems(r.data.data)); },[]);
  const submit=async(e)=>{ e.preventDefault(); await api.post("/volunteer",form); const r=await api.get("/volunteer"); setItems(r.data.data); };
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Voluntariado</h2><Bell/></div>
      <div className="grid grid2">
        <div className="card">
          <h3>Registrar disponibilidad</h3>
          <form onSubmit={submit} className="list">
            <input value={form.days} onChange={e=>setForm({...form,days:e.target.value})} placeholder="Días (csv)" />
            <div className="row"><input value={form.from_time} onChange={e=>setForm({...form,from_time:e.target.value})} type="time" /><input value={form.to_time} onChange={e=>setForm({...form,to_time:e.target.value})} type="time" /></div>
            <input value={form.task} onChange={e=>setForm({...form,task:e.target.value})} placeholder="Tarea" />
            <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Comentarios" />
            <button>Guardar</button>
          </form>
        </div>
        <div className="card">
          <h3>Mis disponibilidades</h3>
          <div className="list">{items.map(v=> <div key={v.id} className="card"><div>{v.days} {v.from_time}-{v.to_time}</div><div>{v.task}</div><div>{v.notes}</div></div>)}</div>
        </div>
      </div>
    </main></>);
}
