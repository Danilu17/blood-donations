import React, { useEffect, useState } from "react";
import api from "../../ui/api";
export default function MyCampaigns(){
  const [rows,setRows]=useState([]); const [f,setF]=useState({title:"",center_id:1,address:"",start:"",end:"",capacity:40,requirements:["Desayuno liviano"]});
  const load=()=>api.get("/campaigns").then(r=>setRows(r.data)); useEffect(load,[]);
  const create=async e=>{e.preventDefault(); await api.post("/campaigns",f); load();};
  const finalize=id=>api.post(`/campaigns/${id}/finalize`).then(load);
  const cancel=id=>api.post(`/campaigns/${id}/cancel`).then(load);
  return <div>
    <h1>Mis campañas</h1>
    <form onSubmit={create} style={{display:"grid",gap:8,maxWidth:520}}>
      <input placeholder="Título" value={f.title} onChange={e=>setF({...f,title:e.target.value})}/>
      <input placeholder="Center ID" type="number" value={f.center_id} onChange={e=>setF({...f,center_id:+e.target.value})}/>
      <input placeholder="Dirección" value={f.address} onChange={e=>setF({...f,address:e.target.value})}/>
      <input placeholder="Inicio ISO" value={f.start} onChange={e=>setF({...f,start:e.target.value})}/>
      <input placeholder="Fin ISO" value={f.end} onChange={e=>setF({...f,end:e.target.value})}/>
      <input type="number" placeholder="Cupos" value={f.capacity} onChange={e=>setF({...f,capacity:+e.target.value})}/>
      <button>Crear campaña</button>
    </form>
    <ul>{rows.map(r=><li key={r.id} style={{border:"1px solid #eee",padding:8,margin:"8px 0"}}>
      <div><b>{r.title}</b> — Estado: {r.status} — Inscritos: {r.enrolled}/{r.capacity}</div>
      <button onClick={()=>finalize(r.id)}>Finalizar</button>
      <button onClick={()=>cancel(r.id)}>Cancelar</button>
    </li>)}</ul>
  </div>;
}