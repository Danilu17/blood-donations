// client/src/pages/ForgotReset.jsx
import React, { useState } from "react";
import api from "../api";

export function Forgot() {
  const [email,setEmail]=useState("");
  const [ok,setOk]=useState("");
  const submit=async(e)=>{ e.preventDefault(); const {data}=await api.post("/auth/forgot",{email}); setOk(data.data.message); };
  return <div className="container"><div className="card" style={{maxWidth:420, margin:"40px auto"}}>
    <h3>Olvidé mi contraseña</h3>
    <form onSubmit={submit} className="list">
      <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <button>Enviar código</button>
      {ok && <div className="badge">{ok}</div>}
    </form></div></div>;
}

export function Reset() {
  const [email,setEmail]=useState("");
  const [code,setCode]=useState("");
  const [pwd,setPwd]=useState("");
  const [msg,setMsg]=useState("");
  const submit=async(e)=>{ e.preventDefault(); const {data}=await api.post("/auth/reset",{email,code,newPassword:pwd}); setMsg(data.data.message); };
  return <div className="container"><div className="card" style={{maxWidth:420, margin:"40px auto"}}>
    <h3>Restablecer contraseña</h3>
    <form onSubmit={submit} className="list">
      <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="código" value={code} onChange={e=>setCode(e.target.value)} />
      <input type="password" placeholder="nueva contraseña" value={pwd} onChange={e=>setPwd(e.target.value)} />
      <button>Actualizar</button>
      {msg && <div className="badge">{msg}</div>}
    </form></div></div>;
}
