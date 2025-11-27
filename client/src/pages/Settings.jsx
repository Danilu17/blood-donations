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

            <div className="list" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* Estado activado/desactivado */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontWeight: 600 }}>Estado</label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    background: "#fafafa"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={notif.enabled}
                    onChange={e => setNotif({ ...notif, enabled: e.target.checked })}
                  />
                  {notif.enabled ? "Activadas" : "Desactivadas"}
                </label>
              </div>

              {/* Frecuencia */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontWeight: 600 }}>Frecuencia</label>
                <select
                  value={notif.frecuencia}
                  onChange={e => setNotif({ ...notif, frecuencia: e.target.value })}
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc"
                  }}
                >
                  <option>Diaria</option>
                  <option>Semanal</option>
                  <option>Mensual</option>
                </select>
              </div>

              {/* Lista de notificaciones */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                {[
                  { key: "recordatorios", label: "Recordatorios de campañas" },
                  { key: "alertas", label: "Alertas urgentes" },
                  { key: "confirmaciones", label: "Confirmaciones" },
                  { key: "comunicados", label: "Comunicados" }
                ].map(opt => (
                  <label
                    key={opt.key}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 40px",
                      alignItems: "center",
                      padding: "8px 10px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      background: "#fafafa"
                    }}
                  >
                    <span>{opt.label}</span>
                    <input
                      type="checkbox"
                      checked={notif[opt.key]}
                      onChange={e => setNotif({ ...notif, [opt.key]: e.target.checked })}
                      style={{ margin: "0 auto" }}
                    />
                  </label>
                ))}

              </div>

            </div>
          </div>

          {/* =========================
              SOLICITAR CAMBIO DE ROL
              ========================= */}
          <div className="card">
            <h3>Solicitar cambio de rol</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* Select */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontWeight: 600 }}>Nuevo rol</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc"
                  }}
                >
                  <option>Organizador</option>
                  <option>Beneficiario</option>
                  <option>Donador</option>
                </select>
              </div>

              {/* Botón */}
              <button
                onClick={sendRole}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#d62839",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Solicitar
              </button>

              {msg && (<div
                  style={{
                    marginTop: "4px",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    background: "#e6ffed",
                    border: "1px solid rgba(52, 199, 89, 0.5)",
                    color: "#135d2a",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}></span>
                  <span>{msg}</span>
                </div>
              )}

            </div>
          </div>
        </div>
        
      </main>
    </>
  );
}