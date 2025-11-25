// client/src/pages/Organizer.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

export function OrgDashboard(){
  const [kpi,setKpi]=useState({active:0, volunteers:0, ins:0});
  useEffect(()=>{ (async()=>{
    const {data}=await api.get("/campaigns"); const active=data.data.length;
    const vol=(await api.get("/volunteer/pool")).data.data.length;
    const ins=(await api.get("/campaigns")).data.data.reduce(a=>a+1,0);
    setKpi({active,volunteers:vol,ins});
  })(); },[]);
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Organizador</h2><Bell/></div>
      <div className="grid grid2">
        <div className="card"><div className="kpi">{kpi.active}</div><div>Campañas activas</div></div>
        <div className="card"><div className="kpi">{kpi.volunteers}</div><div>Voluntarios</div></div>
      </div>
    </main></>);
}

export function OrgCampaigns(){
  const [items,setItems]=useState([]);
  const [form,setForm]=useState({name:"Nueva Campaña",center_id:1,date:"2025-11-25",start_time:"08:00",end_time:"12:00",capacity:40});
  useEffect(()=>{ api.get("/campaigns").then(r=>setItems(r.data.data)); },[]);
  const create=async()=>{ await api.post("/campaigns",form); const r=await api.get("/campaigns"); setItems(r.data.data); };
  const finalize=async(id)=>{ await api.put(`/campaigns/${id}`,{status:"finalized"}); const r=await api.get("/campaigns"); setItems(r.data.data); };
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Mis campañas</h2><Bell/></div>
      <div className="grid grid2">
        <div className="card">
          <h3>Crear campaña</h3>
          <div className="list">
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            <input type="number" value={form.center_id} onChange={e=>setForm({...form,center_id:+e.target.value})} />
            <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
            <div className="row"><input type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})} /><input type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})} /></div>
            <input type="number" value={form.capacity} onChange={e=>setForm({...form,capacity:+e.target.value})} />
            <button onClick={create}>Crear</button>
          </div>
        </div>
        <div className="card">
          <h3>Campañas</h3>
          <div className="list">{items.map(c=>
            <div key={c.id} className="row" style={{justifyContent:"space-between"}}>
              <div><strong>{c.name}</strong> — {c.date} {c.start_time}-{c.end_time} — cap {c.capacity}</div>
              <div className="row" style={{gap:8}}>
                <a className="badge" href={`/campaigns/${c.id}`}>Ver</a>
                <button className="ghost" onClick={()=>finalize(c.id)}>Finalizar</button>
              </div>
            </div>)}
          </div>
        </div>
      </div>
    </main></>);
}

export function OrgVolunteers(){
  const [items,setItems]=useState([]);
  useEffect(()=>{ api.get("/volunteer/pool").then(r=>setItems(r.data.data)); },[]);
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Voluntarios</h2><Bell/></div>
      <div className="grid">{items.map(v=> <div key={v.id} className="card"><strong>{v.full_name}</strong><div>{v.days} {v.from_time}-{v.to_time}</div><button className="ghost" onClick={()=>api.post(`/volunteer/${v.user_id}/assign/1`)}>Asignar a campaña 1</button></div>)}</div>
    </main></>);
}

export function OrgCommunications(){
  const [tab,setTab]=useState("confirmados");
  const [asunto,setAsunto]=useState(""); const [msg,setMsg]=useState("");
  const send=()=>{ alert("Enviado (demo)."); };
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Enviar comunicado</h2><Bell/></div>
      <div className="card list">
        <div className="row"><button className="ghost" onClick={()=>setTab("confirmados")}>Donantes confirmados</button><button className="ghost" onClick={()=>setTab("espera")}>Lista de espera</button><button className="ghost" onClick={()=>setTab("voluntarios")}>Voluntarios</button></div>
        <input placeholder="Asunto" value={asunto} onChange={e=>setAsunto(e.target.value)} />
        <textarea placeholder="Mensaje" value={msg} onChange={e=>setMsg(e.target.value)} />
        <button onClick={send}>Enviar</button>
      </div>
    </main></>);
}
