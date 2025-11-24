import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../ui/api"; import { AuthCtx } from "../ui/AuthContext.jsx";
export default function Login(){
  const { login } = useContext(AuthCtx);
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [err,setErr]=useState("");
  const nav = useNavigate();
  const onSubmit=async(e)=>{e.preventDefault(); try{ await login(email,password); nav("/"); }catch{ setErr("Credenciales inválidas"); }};
  return <div style={{maxWidth:420}}>
    <h1>Login</h1>
    <form onSubmit={onSubmit}>
      <input placeholder="correo electrónico" value={email} onChange={e=>setEmail(e.target.value)} required/>
      <input placeholder="contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
      <button type="submit">Iniciar sesión</button>
      {err && <div style={{color:"red"}}>{err}</div>}
    </form>
    <div><Link to="/register">¿No tenés cuenta? Registrate acá</Link></div>
  </div>;
}
