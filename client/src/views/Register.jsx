import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../ui/api";
export default function Register(){
  const [f,setF]=useState({name:"",surname:"",dni:"",sex:"",birthdate:"",email:"",phone:"",address:"",blood_group:"O",rh_factor:"+",password:""});
  const nav = useNavigate();
  const submit=async e=>{e.preventDefault(); await api.post("/auth/register", f); nav("/login");};
  return <div style={{maxWidth:520}}>
    <h1>Registrarse</h1>
    <form onSubmit={submit} style={{display:"grid",gap:8}}>
      <input placeholder="Nombre" value={f.name} onChange={e=>setF({...f,name:e.target.value})} required/>
      <input placeholder="Apellido" value={f.surname} onChange={e=>setF({...f,surname:e.target.value})} required/>
      <input placeholder="DNI" value={f.dni} onChange={e=>setF({...f,dni:e.target.value})} required/>
      <input placeholder="Sexo (M/F)" value={f.sex} onChange={e=>setF({...f,sex:e.target.value})} required/>
      <input placeholder="Fecha nacimiento (YYYY-MM-DD)" value={f.birthdate} onChange={e=>setF({...f,birthdate:e.target.value})} required/>
      <input placeholder="Correo electrónico" value={f.email} onChange={e=>setF({...f,email:e.target.value})} required/>
      <input placeholder="Teléfono" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>
      <input placeholder="Dirección" value={f.address} onChange={e=>setF({...f,address:e.target.value})}/>
      <div>
        <select value={f.blood_group} onChange={e=>setF({...f,blood_group:e.target.value})}>
          <option>A</option><option>B</option><option>AB</option><option>O</option>
        </select>
        <select value={f.rh_factor} onChange={e=>setF({...f,rh_factor:e.target.value})}><option>+</option><option>-</option></select>
      </div>
      <input placeholder="Contraseña" type="password" value={f.password} onChange={e=>setF({...f,password:e.target.value})} required/>
      <button>Crear cuenta</button>
    </form>
  </div>;
}