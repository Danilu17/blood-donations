// client/src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const r = user?.roles||[];
  const item = (to, label) => <Link to={to} className={"nav-item " + (loc.pathname===to?"active":"")}>{label}</Link>;
  return (
    <aside className="sidebar">
      <div className="row" style={{justifyContent:'space-between'}}>
        <strong>Logo</strong>
        <span className="badge">{user?.name}</span>
      </div>
      <div className="list" style={{marginTop:16}}>
        {item("/", "Inicio")}
        {r.includes("Donor") && <>
          {item("/campaigns","Campañas")}
          {item("/my-enrollments","Mis inscripciones")}
          {item("/health","Salud")}
          {item("/donations","Donaciones")}
          {item("/volunteer","Voluntariado")}
          {item("/settings","Configuraciones")}
        </>}
        {r.includes("Organizer") && <>
          {item("/org","Panel organizador")}
          {item("/org/campaigns","Mis campañas")}
          {item("/org/communications","Enviar comunicado")}
          {item("/org/volunteers","Voluntarios")}
        </>}
        {r.includes("Admin") && <>
          {item("/admin","Panel admin")}
          {item("/admin/users","Usuarios")}
          {item("/admin/campaigns","Campañas")}
          {item("/admin/centers","Centros de donación")}
          {item("/admin/reports","Reportes")}
        </>}
        {r.includes("Beneficiary") && <>
          {item("/benef","Beneficiario")}
        </>}
      </div>
      <button className="ghost" style={{marginTop:16}} onClick={logout}>Cerrar sesión</button>
    </aside>
  );
}
