// client/src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

export default function Settings() {
  const key = "prefs_notifications";
  const [notif, setNotif] = useState({
    enabled: true,
    email: true,
    sms: false,
    recordatorios: true,
    alertas: true,
    confirmaciones: true,
    comunicados: true,
    frecuencia: "Semanal",
  });
  const [role, setRole] = useState("Organizer");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) setNotif(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(notif));
  }, [notif]);

  const sendRole = async () => {
    await api.post("/roles/request", { requested_role: role, justification: "-" });
    setMsg("Solicitud enviada");
  };

  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header">
          <h2>Configuraciones</h2>
          <Bell />
        </div>
        <div className="grid grid2">
          <div className="card">
            <h3>Notificaciones</h3>
            <div className="list">
              <label className="row">
                <input type="checkbox" checked={notif.enabled} onChange={e => setNotif({ ...notif, enabled: e.target.checked })} /> Activadas
              </label>
              
              <label>
                Frecuencia
                <select value={notif.frecuencia} onChange={e => setNotif({ ...notif, frecuencia: e.target.value })}>
                  <option>Diaria</option>
                  <option>Semanal</option>
                  <option>Mensual</option>
                </select>
              </label>
              <label className="row">
                <input
                  type="checkbox"
                  checked={notif.recordatorios}
                  onChange={e => setNotif({ ...notif, recordatorios: e.target.checked })}
                />
                Recordatorios de campañas
              </label>
              <label className="row">
                <input type="checkbox" checked={notif.alertas} onChange={e => setNotif({ ...notif, alertas: e.target.checked })} />
                Alertas urgentes
              </label>
              <label className="row">
                <input
                  type="checkbox"
                  checked={notif.confirmaciones}
                  onChange={e => setNotif({ ...notif, confirmaciones: e.target.checked })}
                />
                Confirmaciones
              </label>
              <label className="row">
                <input
                  type="checkbox"
                  checked={notif.comunicados}
                  onChange={e => setNotif({ ...notif, comunicados: e.target.checked })}
                />
                Comunicados
              </label>
            </div>
          </div>
          <div className="card">
            <h3>Solicitar cambio de rol</h3>
            <div className="row">
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option>Organizer</option>
                <option>Beneficiary</option>
                <option>Donor</option>
              </select>
              <button onClick={sendRole}>Solicitar</button>
            </div>
            {msg && <div className="badge">{msg}</div>}
          </div>
        </div>
      </main>
    </>
  );
}
