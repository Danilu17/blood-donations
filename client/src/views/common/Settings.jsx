// client/src/views/common/Settings.jsx  ← Usa únicamente el cliente api (con token)
import React, { useEffect, useState } from "react";
import api from "../../ui/api";

export default function Settings() {
  const [me, setMe] = useState(null);
  const [roleReq, setRoleReq] = useState({ target_role: "ORG", reason: "" });

  useEffect(() => {
    api.get("/users/me").then((r) => setMe(r.data)).catch((e) => {
      // why: 401 → token vencido/ausente; fuerza re-login
      if (e?.response?.status === 401) {
        alert("Sesión expirada. Vuelve a iniciar sesión.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    });
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    await api.put("/users/me", me);
    alert("Actualizado");
  };

  const requestRole = async (e) => {
    e.preventDefault();
    await api.post("/users/request-role", roleReq);
    alert("Solicitud enviada");
  };

  return (
    <div>
      <h1>Configuraciones</h1>
      {me && (
        <form onSubmit={saveProfile} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          <input value={me.name || ""} onChange={(e) => setMe({ ...me, name: e.target.value })} placeholder="Nombre" />
          <input value={me.surname || ""} onChange={(e) => setMe({ ...me, surname: e.target.value })} placeholder="Apellido" />
          <input value={me.phone || ""} onChange={(e) => setMe({ ...me, phone: e.target.value })} placeholder="Teléfono" />
          <input value={me.address || ""} onChange={(e) => setMe({ ...me, address: e.target.value })} placeholder="Dirección" />
          <div>Grupo sanguíneo: {me.blood_group}{me.rh_factor}</div>
          <button>Actualizar</button>
        </form>
      )}

      <h2>Notificaciones</h2>
      <div>
        <label><input type="radio" name="ch" defaultChecked />Email</label>
        <label><input type="radio" name="ch" />SMS</label>
        <label><input type="radio" name="ch" />Push</label>
        <div>
          <label><input type="checkbox" defaultChecked />Recordatorios</label>
          <label><input type="checkbox" defaultChecked />Alertas urgentes</label>
          <label><input type="checkbox" defaultChecked />Confirmaciones</label>
          <label><input type="checkbox" defaultChecked />Comunicados</label>
        </div>
        <button onClick={() => alert("Guardado (mock)")}>Guardar</button>
      </div>

      <h2>Solicitar cambio de rol</h2>
      <form onSubmit={requestRole} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <select value={roleReq.target_role} onChange={(e) => setRoleReq({ ...roleReq, target_role: e.target.value })}>
          <option value="ORG">Organizador</option>
          <option value="BEN">Beneficiario</option>
        </select>
        <textarea placeholder="Motivo" value={roleReq.reason} onChange={(e) => setRoleReq({ ...roleReq, reason: e.target.value })} />
        <button>Enviar</button>
      </form>
    </div>
  );
}
