// client/src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form,setForm]=useState({name:"",surname:"",dni:"",birthdate:"",sex:"M",email:"",phone:"",address:"",password:""});
  const [err,setErr]=useState("");
  const submit=async(e)=>{ e.preventDefault(); setErr(""); try{ await register(form); nav("/"); }catch(er){ setErr(er.response?.data?.error||"Error"); } };
  return (
    <div className="container">
      <div className="card" style={{maxWidth:560, margin:"40px auto"}}>
        <h2>Registrarse</h2>
        <form onSubmit={submit} className="grid grid2">
          {["name","surname","dni","birthdate","sex","email","phone","address","password"].map(k=>
            <input key={k} type={k==="password"?"password":k==="birthdate"?"date":"text"} placeholder={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} />
          )}
          {err && <div style={{gridColumn:"span 2", color:"crimson"}}>{err}</div>}
          <button style={{gridColumn:"span 2"}}>Crear cuenta</button>
          <Link to="/login" className="ghost" style={{gridColumn:"span 2", textAlign:"center"}}>← Volver</Link>
        </form>
      </div>
    </div>
  );
}
