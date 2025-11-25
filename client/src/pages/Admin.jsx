// client/src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function AdminDashboard(){
  const [months,setMonths]=useState([]);
  useEffect(()=>{ api.get("/reports/summary.pdf").catch(()=>{}); setMonths(["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]); },[]);
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Admin</h2><Bell/></div>
      <div className="card">
        <h3>Donantes activos por mes</h3>
        <Bar data={{ labels: months, datasets: [{ label: "Donaciones", data: months.map(()=>Math.floor(Math.random()*300)+50) }] }} />
      </div>
    </main></>);
}

export function AdminUsers(){
  const [users,setUsers]=useState([]);
  const [reqs,setReqs]=useState([]);
  useEffect(()=>{ fetchUsers(); fetchReqs(); },[]);
  const fetchUsers=()=> api.get("/auth/me").then(()=>{}); // placeholder
  const fetchReqs=()=> api.get("/roles/requests").then(r=>setReqs(r.data.data));
  const approve=(id)=> api.post(`/roles/requests/${id}/approve`,{reason:"OK"}).then(fetchReqs);
  const reject=(id)=> api.post(`/roles/requests/${id}/reject`,{reason:"-" }).then(fetchReqs);
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Usuarios & Solicitudes</h2><Bell/></div>
      <div className="card">
        <h3>Solicitudes de cambio de rol</h3>
        <div className="list">{reqs.map(r=>
          <div key={r.id} className="row" style={{justifyContent:"space-between"}}>
            <div><strong>{r.user_name}</strong> → {r.requested_role}</div>
            <div className="row"><button className="ghost" onClick={()=>approve(r.id)}>Aprobar</button><button className="ghost" onClick={()=>reject(r.id)}>Rechazar</button></div>
          </div>
        )}</div>
      </div>
    </main></>);
}

export function AdminCampaigns(){
  const [items,setItems]=useState([]);
  useEffect(()=>{ api.get("/campaigns").then(r=>setItems(r.data.data)); },[]);
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Campañas</h2><Bell/></div>
      <table className="table"><thead><tr><th>Nombre</th><th>Fecha</th><th>Centro</th><th>Estado</th></tr></thead>
      <tbody>{items.map(c=><tr key={c.id}><td>{c.name}</td><td>{c.date}</td><td>{c.center_name}</td><td>{c.status}</td></tr>)}</tbody></table>
    </main></>);
}

export function AdminCenters(){
  const [items,setItems]=useState([]); const [form,setForm]=useState({name:"Nuevo centro",address:"",hours:"L-V 08:00–16:00",lat:-34.6,lng:-58.4,capacity:40});
  useEffect(()=>{ load(); },[]);
  const load=()=> api.get("/centers").then(r=>setItems(r.data.data));
  const add=async()=>{ await api.post("/centers",form); await load(); };
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Centros</h2><Bell/></div>
      <div id="map" className="card"><Map centers={items}/></div>
      <div className="grid grid2">
        <div className="card"><h3>Agregar</h3>
          <div className="list">
            {["name","address","hours","lat","lng","capacity"].map(k=>
              <input key={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={k}/>)}
            <button onClick={add}>Guardar</button>
          </div>
        </div>
        <div className="card"><h3>Listado</h3>
          <table className="table"><thead><tr><th>Nombre</th><th>Dirección</th><th>Horarios</th></tr></thead>
          <tbody>{items.map(c=><tr key={c.id}><td>{c.name}</td><td>{c.address}</td><td>{c.hours}</td></tr>)}</tbody></table>
        </div>
      </div>
    </main></>);
}

function Map({ centers }) {
  const ref = React.useRef(null);
  React.useEffect(()=>{
    import("leaflet").then(L=>{
      if (!ref.current) return;
      ref.current.innerHTML="";
      const map = L.map(ref.current).setView([-34.6,-58.4], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OSM'}).addTo(map);
      centers.forEach(c=> L.marker([c.lat,c.lng]).addTo(map).bindPopup(`<b>${c.name}</b><br/>${c.address}<br/>${c.hours}`));
    });
  },[centers]);
  return <div ref={ref} style={{height:320}}/>;
}

export function AdminReports(){
  return (<>
    <Sidebar/><main className="main">
      <div className="header"><h2>Reportes</h2><Bell/></div>
      <div className="card">
        <a className="badge" href="http://localhost:4000/api/reports/summary.pdf" target="_blank">Descargar “Donaciones por mes” (PDF)</a>
      </div>
    </main></>);
}
