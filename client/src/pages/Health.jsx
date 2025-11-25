// client/src/pages/Health.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

export default function Health() {
  const [form,setForm]=useState({weight:68,diseases:[],medications:"",last_donation_date:"",blood_group:"O",rh_factor:"Rh+"});
  const [hist,setHist]=useState([]);
  const [msg,setMsg]=useState("");
  useEffect(()=>{ api.get("/health/history").then(r=>setHist(r.data.data)); },[]);
  const toggle=(d)=> setForm(f=>({...f, diseases: f.diseases.includes(d)? f.diseases.filter(x=>x!==d) : [...f.diseases,d]}));
  const submit=async(e)=>{ e.preventDefault(); setMsg(""); try{ const {data}=await api.post("/health",form); setMsg(`Guardado. Estado: ${data.data.status}`); const h=await api.get("/health/history"); setHist(h.data.data); }catch(er){ setMsg(er.response?.data?.error||"Error"); } };
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Salud</h2><Bell/></div>
      <div className="grid grid2">
        <div className="card">
          <h3>Cuestionario</h3>
          <form onSubmit={submit} className="list">
            <input type="number" value={form.weight} onChange={e=>setForm({...form,weight:+e.target.value})} placeholder="Peso (kg)" />
            <div>Enfermedades: {["Diabetes","Hipertensión","Cardíaca","Anemia crónica","Ninguna"].map(d=>
              <label key={d} className="row"><input type="checkbox" checked={form.diseases.includes(d)} onChange={()=>toggle(d)} /> {d}</label>
            )}</div>
            <input value={form.medications} onChange={e=>setForm({...form,medications:e.target.value})} placeholder="Medicamentos" />
            <label>Fecha última donación<input type="date" value={form.last_donation_date} onChange={e=>setForm({...form,last_donation_date:e.target.value})} /></label>
            <label>Grupo<select value={form.blood_group} onChange={e=>setForm({...form,blood_group:e.target.value})}><option>A</option><option>B</option><option>AB</option><option>O</option></select></label>
            <label>Factor<select value={form.rh_factor} onChange={e=>setForm({...form,rh_factor:e.target.value})}><option>Rh+</option><option>Rh-</option></select></label>
            <button>Guardar</button>
            {msg && <div className="badge">{msg}</div>}
          </form>
        </div>
        <div className="card">
          <h3>Historial</h3>
          <table className="table">
            <thead><tr><th>Fecha</th><th>Peso</th><th>Enfermedades</th><th>Últ. donación</th><th>Grupo</th><th>Estado</th></tr></thead>
            <tbody>{hist.map(h=><tr key={h.id}><td>{new Date(h.created_at*1000).toLocaleDateString()}</td><td>{h.weight}kg</td><td>{h.diseases}</td><td>{h.last_donation_date}</td><td>{h.blood_group}{h.rh_factor==='Rh+'?'+':'-'}</td><td>{h.status}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </main></>);
}
