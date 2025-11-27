// client/src/components/Bell.jsx
import React, { useEffect, useState } from "react";
import api from "../api";

export default function Bell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (open) {
      api.get("/notifications").then(r => setItems(r.data.data));
      // Por qué: marcar como leídas al abrir el dropdown
      api.post("/notifications/read").catch(() => {});
    }
  }, [open]);
  return (
    <div className="bell" onClick={() => setOpen(o => !o)} title="Notificaciones">
      🔔
      {open && (
        <div className="dropdown">
          <div className="list" style={{ padding: 10 }}>
            {items.length === 0 ? (
              <span>No hay notificaciones</span>
            ) : (
              items.map(n => (
                <div key={n.id} className="card" style={{ padding: 8 }}>
                  <strong>{n.title}</strong>
                  <div style={{ color: "#555" }}>{n.body}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
