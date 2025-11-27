// client/src/pages/Donations.jsx
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

export default function Donations() {
  const [items, setItems] = useState([]);
  const [centers, setCenters] = useState([]);
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "", center: "" });

  useEffect(() => {
    api.get("/donations/history").then(r => setItems(r.data.data));
    api.get("/centers").then(r => setCenters(r.data.data));
  }, []);

  const list = useMemo(() => {
    return items.filter(d => {
      const dDate = new Date(d.date);
      if (filters.dateFrom && dDate < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && dDate > new Date(filters.dateTo)) return false;
      if (filters.center && String(d.center_id) !== String(filters.center)) return false;
      return true;
    });
  }, [items, filters]);

  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header">
          <h2>Historial de donaciones</h2>
          <Bell />
        </div>

        <div className="row card" style={{ gap: 8, marginBottom: 12 }}>
          <input type="date" value={filters.dateFrom} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} />
          <input type="date" value={filters.dateTo} onChange={e => setFilters({ ...filters, dateTo: e.target.value })} />
          <select value={filters.center} onChange={e => setFilters({ ...filters, center: e.target.value })}>
            <option value="">Todos los centros</option>
            {centers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <a className="badge" href="http://localhost:4000/api/donations/history.pdf" target="_blank" rel="noreferrer">
            Exportar PDF
          </a>
        </div>

        <div className="list" style={{ marginTop: 12 }}>
          {list.map(d => (
            <div key={d.id} className="card row" style={{ justifyContent: "space-between" }}>
              <div>
                <strong>{d.center_name}</strong> — {d.date} — {d.blood_type} — {d.volume_ml}ml
              </div>
              <a className="badge" href={`http://localhost:4000/api/donations/${d.id}/certificate.pdf`} target="_blank" rel="noreferrer">
                Descargar certificado
              </a>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
