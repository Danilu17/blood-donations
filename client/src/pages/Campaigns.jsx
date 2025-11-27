// client/src/pages/Campaigns.jsx  (REEMPLAZA COMPLETO)
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";
import { useAuth } from "../AuthContext";

export function CampaignList() {
  const [items, setItems] = useState([]);
  const [date, setDate] = useState("");
  const [center, setCenter] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const load = () =>
    api
      .get("/campaigns", { params: { date: date || undefined, center: center || undefined } })
      .then((r) => setItems(r.data.data));

  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header">
          <h2>Campañas</h2>
          <Bell />
        </div>

        <div className="card list">
          <div className="row">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <input placeholder="Todos los centros" value={center} onChange={(e) => setCenter(e.target.value)} />
            <button className="ghost" onClick={load}>Filtrar</button>
          </div>
        </div>

        <div className="grid">
          {items.map((c) => (
            <a key={c.id} href={`/campaigns/${c.id}`} className="card hover">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div className="title-sm">{c.name}</div>
                  <div className="muted">{c.place || c.center_name} — {c.date} {c.start_time}-{c.end_time}</div>
                  <div className="row" style={{ marginTop: 6 }}>
                    <span className="chip">Cupos: {c.capacity}</span>
                    <span className="chip">Requiere: {c.blood_group}{c.rh_factor === "Rh-" ? "-" : "+"}</span>
                  </div>
                </div>
                <span className="badge">Ver más</span>
              </div>
            </a>
          ))}
          {items.length === 0 && <div className="badge">No hay campañas.</div>}
        </div>
      </main>
    </>
  );
}

export function CampaignDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isOrganizer = roles.includes("Organizer");
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get(`/campaigns/${id}`).then((r) => {
      setC(r.data.data || r.data);
      setLoading(false);
    });
  }, [id]);

  const enroll = async () => {
    setMsg("");
    try {
      await api.post(`/enroll/${id}`);
      setMsg("Inscripción confirmada.");
    } catch (e) {
      setMsg(e.response?.data?.error || "Error al inscribirse");
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="main"><div className="card">Cargando…</div></main>
      </>
    );
  }
  if (!c) {
    return (
      <>
        <Sidebar />
        <main className="main"><div className="card">No encontrada.</div></main>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header">
          <h2>Detalle de campaña</h2>
          <Bell />
        </div>

        <div className="card hero">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h3 className="hero-title">{c.name}</h3>
              <div className="meta">
                <div><span className="meta-key">Lugar</span><span className="meta-val">{c.place || `${c.center_name} — ${c.center_address || ""}`}</span></div>
                <div><span className="meta-key">Fecha y horario</span><span className="meta-val">{c.date} {c.start_time}–{c.end_time}</span></div>
                <div><span className="meta-key">Requisitos</span><span className="meta-val">{c.blood_group}{c.rh_factor === "Rh-" ? "-" : "+"}</span></div>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <span className="chip chip-soft">Cupos: {c.capacity}</span>
                {c.status !== "active" && <span className="chip warn">Estado: {c.status}</span>}
              </div>
            </div>
          </div>

          {!isOrganizer && c.status === "active" && (
            <div style={{ marginTop: 18 }}>
              <button onClick={enroll}>Inscribirme</button>
            </div>
          )}
          {msg && <div className="toast-inline">{msg}</div>}
        </div>
      </main>
    </>
  );
}

export default CampaignList;
