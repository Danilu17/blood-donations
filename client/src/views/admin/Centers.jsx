import React, { useEffect, useState } from "react";
import api from "../../ui/api";
export default function Centers(){
  const [rows,setRows]=useState([]); const [f,setF]=useState({name:"",address:"",hours:""});
  const load=()=>api.get("/centers").then(r=>setRows(r.data)); useEffect(load,[]);
  const add=async e=>{e.preventDefault(); await api.post("/centers",f); setF({name:"",address:"",hours:""}); load();};
  const update=async (id,field,val)=>{ const row = rows.find(x=>x.id===id); row[field]=val; setRows([...rows]); await api.put(`/centers/${id}`,row); };
  return <div>
    <h1>Centros de donación</h1>
    <table><thead><tr><th>Nombre</th><th>Dirección</th><th>Horarios</th></tr></thead>
      <tbody>{rows.map(c=><tr key={c.id}>
        <td><input value={c.name} onChange={e=>update(c.id,"name",e.target.value)}/></td>
        <td><input value={c.address} onChange={e=>update(c.id,"address",e.target.value)}/></td>
        <td><input value={c.hours} onChange={e=>update(c.id,"hours",e.target.value)}/></td>
      </tr>)}</tbody></table>
    <h3>Agregar</h3>
    <form onSubmit={add} style={{display:"grid",gap:8,maxWidth:520}}>
      <input placeholder="Nombre" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
      <input placeholder="Dirección" value={f.address} onChange={e=>setF({...f,address:e.target.value})}/>
      <input placeholder="Horarios" value={f.hours} onChange={e=>setF({...f,hours:e.target.value})}/>
      <button>Agregar</button>
    </form>
  </div>;
}