// client/src/pages/Campaigns.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

export function CampaignList() {
  const [items, setItems] = useState([]);
  const [centers, setCenters] = useState([]);
  const [filters, setFilters] = useState({ date: "", center: "" });
  const load = async () => {
    const q = [];
    if (filters.date) q.push(`date=${filters.date}`);
    if (filters.center) q.push(`center=${filters.center}`);
    const url = "/campaigns" + (q.length ? `?${q.join("&")}` : "");
    const [camps, cents] = await Promise.all([api.get(url), api.get("/centers")]);
    setItems(camps.data.data);
    setCenters(cents.data.data);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const apply = e => {
    e.preventDefault();
    load();
  };

  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header">
          <h2>Campañas</h2>
          <Bell />
        </div>

        <form onSubmit={apply} className="row card" style={{ gap: 8, marginBottom: 12 }}>
          <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} />
          <select value={filters.center} onChange={e => setFilters({ ...filters, center: e.target.value })}>
            <option value="">Todos los centros</option>
            {centers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button className="ghost" type="submit">
            Filtrar
          </button>
        </form>

        <div className="list">
          {items.map(c => (
            <div key={c.id} className="card row" style={{ justifyContent: "space-between" }}>
              <div>
                <strong>{c.name}</strong>
                <div className="muted">
                  {c.center_name} — {c.date} {c.start_time}-{c.end_time}
                </div>
              </div>
              <Link className="badge" to={`/campaigns/${c.id}`}>
                Ver más
              </Link>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export function CampaignDetail() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get(`/campaigns/${id}`).then(r => setC(r.data.data));
  }, [id]);

  const enroll = async () => {
    setErr("");
    try {
      const { data } = await api.post(`/enroll/${id}`);
      setStatus(data.data.status);
    } catch (e) {
      setErr(e.userMessage || "Error");
    }
  };

  if (!c) return <div>Cargando...</div>;
  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header">
          <h2>Detalle de campaña</h2>
          <Bell />
        </div>
        <div className="card">
          <h3>{c.name}</h3>
          <div>
            {c.center_name} — {c.center_address}
          </div>
          <div>
            {c.date} {c.start_time}-{c.end_time}
          </div>
          <div className="badge">Cupos: {c.capacity}</div>
          <button onClick={enroll}>Inscribirme</button>
          {status && <div className="badge">Resultado: {status}</div>}
          {err && <div style={{ color: "crimson" }}>{err}</div>}
        </div>
      </main>
    </>
  );
}
