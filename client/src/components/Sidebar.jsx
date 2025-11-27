// client/src/components/Sidebar.jsx  (ACTUALIZA MENÚ DE ORGANIZADOR: agrega "Crear campaña")
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

function NavItem({ to, label, active }) {
  return <Link to={to} className={"nav-item " + (active ? "active" : "")}>{label}</Link>;
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const roles = user?.roles || [];
  const rolePriority = ["Admin", "Organizer", "Beneficiary", "Donor"];
  const primaryRole = rolePriority.find(r => roles.includes(r)) || "Donor";

  let menu = [];
  if (primaryRole === "Organizer") {
    menu = [
      { to: "/org", label: "Panel organizador" },
      { to: "/org/campaigns", label: "Mis campañas" },
      { to: "/org/campaigns/new", label: "Crear campaña" },  // nuevo
      { to: "/org/communications", label: "Enviar comunicado" },
      { to: "/org/volunteers", label: "Voluntarios" },
      { to: "/settings", label: "Configuraciones" },
    ];
  } else if (primaryRole === "Donor") {
    menu = [
      { to: "/dashboard", label: "Inicio" },
      { to: "/campaigns", label: "Campañas" },
      { to: "/my-enrollments", label: "Mis inscripciones" },
      { to: "/health", label: "Salud" },
      { to: "/donations", label: "Donaciones" },
      { to: "/volunteer", label: "Voluntariado" },
      { to: "/settings", label: "Configuraciones" },
    ];
  } else if (primaryRole === "Beneficiary") {
    menu = [
      { to: "/benef", label: "Inicio" },
      { to: "/benef/propose", label: "Proponer campaña" },
      { to: "/settings", label: "Configuraciones" },
    ];
  } else if (primaryRole === "Admin") {
    menu = [
      { to: "/admin", label: "Inicio" },
      { to: "/settings", label: "Configuraciones" },
      { to: "/admin/users", label: "Usuarios" },
      { to: "/admin/campaigns", label: "Campañas (admin)" },
      { to: "/admin/centers", label: "Centros" },
      { to: "/admin/reports", label: "Reportes" },
    ];
  }

  return (
    <aside className="sidebar">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <strong>DonaHoy</strong>
        <span className="badge">{user?.name}</span>
      </div>
      <div className="list" style={{ marginTop: 16 }}>
        {menu.map(i => (
          <NavItem key={i.to} to={i.to} label={i.label} active={loc.pathname === i.to} />
        ))}
      </div>
      <button className="ghost" style={{ marginTop: 16 }} onClick={logout}>Cerrar sesión</button>
    </aside>
  );
}
