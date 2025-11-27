// client/src/pages/AdminReports.jsx  (REEMPLAZA COMPLETO)
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

export default function AdminReports() {
  const [items, setItems] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const r = await api.get("/reports/campaigns");
        setItems(r.data.data || r.data || []);
      } catch (e) {
        setErr(e.response?.data?.error || "Error al cargar reportes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (id) => setExpanded((x) => (x === id ? null : id));

  return (
    <>
      <Sidebar role="Admin" />
      <main className="main">
        <div className="header">
          <h2>Reportes</h2>
          <Bell />
        </div>

        {loading && <div className="card">Cargando…</div>}
        {err && <div className="card warn">{err}</div>}

        {!loading && !err && (
          <div className="grid">
            {items.map((c) => (
              <div key={c.id} className="card">
                <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="title-sm">{c.name}</div>
                    <div className="muted">
                      {c.place || `${c.center_name} — ${c.center_address || ""}`}
                    </div>
                    <div className="muted">
                      {c.date} {c.start_time}–{c.end_time}
                    </div>
                    <div className="row" style={{ marginTop: 6 }}>
                      <span className="chip">Cupos: {c.capacity}</span>
                      <span className="chip">Inscriptos: {c.enrollment_count}</span>
                    </div>
                  </div>
                  <div className="col" style={{ alignItems: "flex-end" }}>
                    <span className={`chip ${c.status !== "active" ? "warn" : "chip-soft"}`}>
                      Estado: {c.status}
                    </span>
                    <button className="ghost" style={{ marginTop: 8 }} onClick={() => toggle(c.id)}>
                      {expanded === c.id ? "Ocultar donantes" : "Ver donantes"}
                    </button>
                  </div>
                </div>

                {expanded === c.id && (
                  <div style={{ marginTop: 12 }}>
                    {c.enrollments.length === 0 ? (
                      <div className="badge">Sin donantes</div>
                    ) : (
                      <div className="table">
                        <div className="table-row table-header">
                          <div>Nombre</div>
                          <div>Email</div>
                          <div>Contacto</div>
                          <div>Estado</div>
                        </div>
                        {c.enrollments.map((e, idx) => (
                          <div key={idx} className="table-row">
                            <div>{e.name}</div>
                            <div>{e.email}</div>
                            <div>{e.phone || "-"}</div>
                            <div>
                              <span className={`chip ${e.status !== "confirmed" ? "warn" : "chip-soft"}`}>
                                {e.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {items.length === 0 && <div className="badge">No hay campañas.</div>}
          </div>
        )}
      </main>
    </>
  );
}
