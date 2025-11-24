import React, { useState } from "react";
import api from "../../ui/api";
export default function HealthForm(){
  const [f,setF]=useState({weight:68, chronic:[], meds:"", last_donation:"", blood_group:"A", rh_factor:"+", sex:"M"});
  const diseases=["Diabetes","Hipertensión","Enfermedad cardíaca","Anemia crónica","Ninguna"];
  const toggle=d=> setF(v=> ({...v, chronic: v.chronic.includes(d)? v.chronic.filter(x=>x!==d) : [...v.chronic,d]}));
  const submit=async e=>{ e.preventDefault(); const {data}=await api.post("/health",f); alert(`Estado: ${data.state}\n${(data.issues||[]).join("\n")}`); };
  return <div style={{maxWidth:520}}>
    <h1>Cuestionario de salud</h1>
    <form onSubmit={submit} style={{display:"grid",gap:8}}>
      <input type="number" step="0.1" value={f.weight} onChange={e=>setF({...f,weight:+e.target.value})} placeholder="Peso (kg)" required/>
      <div>{diseases.map(d=><label key={d} style={{marginRight:8}}><input type="checkbox" checked={f.chronic.includes(d)} onChange={()=>toggle(d)}/>{d}</label>)}</div>
      <input placeholder="Medicamentos en uso" value={f.meds} onChange={e=>setF({...f,meds:e.target.value})}/>
      <input placeholder="Última donación (YYYY-MM-DD)" value={f.last_donation} onChange={e=>setF({...f,last_donation:e.target.value})}/>
      <div>
        <select value={f.blood_group} onChange={e=>setF({...f,blood_group:e.target.value})}><option>A</option><option>B</option><option>AB</option><option>O</option></select>
        <select value={f.rh_factor} onChange={e=>setF({...f,rh_factor:e.target.value})}><option>+</option><option>-</option></select>
        <select value={f.sex} onChange={e=>setF({...f,sex:e.target.value})}><option value="M">Hombre</option><option value="F">Mujer</option></select>
      </div>
      <button>Guardar cuestionario</button>
    </form>
  </div>;
}