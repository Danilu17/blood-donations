import React, { useEffect, useState } from "react";
import api from "../../ui/api";
export default function Volunteer(){
  const [rows,setRows]=useState([]);
  const [f,setF]=useState({days:"Lunes, Miércoles", time_from:"09:00", time_to:"13:00", task:"Logística", note:""});
  const load=()=>api.get("/volunteers/mine").then(r=>setRows(r.data)); useEffect(load,[]);
  const submit=async e=>{e.preventDefault(); await api.post("/volunteers",f); load();};
  return <div>
    <h1>Mis disponibilidades</h1>
    <form onSubmit={submit} style={{display:"grid",gap:8,maxWidth:420}}>
      <input placeholder="Días" value={f.days} onChange={e=>setF({...f,days:e.target.value})}/>
      <div><input type="time" value={f.time_from} onChange={e=>setF({...f,time_from:e.target.value})}/> a <input type="time" value={f.time_to} onChange={e=>setF({...f,time_to:e.target.value})}/></div>
      <input placeholder="Tipo de tarea" value={f.task} onChange={e=>setF({...f,task:e.target.value})}/>
      <input placeholder="Comentarios" value={f.note} onChange={e=>setF({...f,note:e.target.value})}/>
      <button>Registrar disponibilidad</button>
    </form>
    <ul>{rows.map(r=><li key={r.id}>{r.days} — {r.time_from} a {r.time_to} — {r.task}
      <button onClick={()=>api.delete(`/volunteers/${r.id}`).then(load)}>Eliminar</button></li>)}</ul>
  </div>;
}