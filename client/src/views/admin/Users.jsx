import React, { useEffect, useState } from "react";
import api from "../../ui/api";
export default function Users(){
  const [rows,setRows]=useState([]);
  useEffect(()=>{ api.get("/users").then(r=>setRows(r.data)); },[]);
  return <div>
    <h1>Usuarios</h1>
    <table><thead><tr><th>Nombre</th><th>DNI</th><th>Correo</th><th>Rol</th><th>Estado</th></tr></thead>
      <tbody>{rows.map(u=><tr key={u.id}><td>{u.name} {u.surname}</td><td>{u.dni||"-"}</td><td>{u.email}</td><td>{u.role}</td><td>{u.status}</td></tr>)}</tbody></table>
  </div>;
}