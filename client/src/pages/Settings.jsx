// client/src/pages/Settings.jsx
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

export default function Settings() {
  const [notif,setNotif]=useState({email:true,sms:false,recordatorios:true,alertas:true,confirmaciones:true,comunicados:true,frecuencia:"Semanal"});
  const [role,setRole]=useState("Organizer");
  const [msg,setMsg]=useState("");
  const sendRole=async()=>{ const {data}=await api.post("/roles/request",{requested_role:role, justification:"-"}); setMsg("Solicitud enviada"); };
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Configuraciones</h2><Bell/></div>
      <div className="grid grid2">
        <div className="card">
          <h3>Notificaciones</h3>
          <div className="list">
            <label className="row"><input type="checkbox" checked={notif.email} onChange={e=>setNotif({...notif,email:e.target.checked})}/> Email</label>
            <label className="row"><input type="checkbox" checked={notif.sms} onChange={e=>setNotif({...notif,sms:e.target.checked})}/> SMS</label>
            <label>Frecuencia<select value={notif.frecuencia} onChange={e=>setNotif({...notif,frecuencia:e.target.value})}><option>Diaria</option><option>Semanal</option><option>Mensual</option></select></label>
            <label className="row"><input type="checkbox" checked={notif.recordatorios} onChange={e=>setNotif({...notif,recordatorios:e.target.checked})}/> Recordatorios de campañas</label>
            <label className="row"><input type="checkbox" checked={notif.alertas} onChange={e=>setNotif({...notif,alertas:e.target.checked})}/> Alertas urgentes</label>
            <label className="row"><input type="checkbox" checked={notif.confirmaciones} onChange={e=>setNotif({...notif,confirmaciones:e.target.checked})}/> Confirmaciones</label>
            <label className="row"><input type="checkbox" checked={notif.comunicados} onChange={e=>setNotif({...notif,comunicados:e.target.checked})}/> Comunicados</label>
            <div className="badge">Se guardan automáticamente en el servidor real en una versión futura.</div>
          </div>
        </div>
        <div className="card">
          <h3>Solicitar cambio de rol</h3>
          <div className="row"><select value={role} onChange={e=>setRole(e.target.value)}><option>Organizer</option><option>Beneficiary</option><option>Donor</option></select><button onClick={sendRole}>Solicitar</button></div>
          {msg && <div className="badge">{msg}</div>}
        </div>
      </div>
    </main></>);
}
