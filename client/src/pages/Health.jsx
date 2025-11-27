// client/src/pages/Health.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

function twoMonthsAgo(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  return months >= 2;
}

export default function Health() {
  const [form, setForm] = useState({
    weight: 68,
    diseases: [],
    medications: "",
    last_donation_date: "",
    blood_group: "O",
    rh_factor: "Rh+",
  });
  const [hist, setHist] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = () => api.get("/health/history").then(r => setHist(r.data.data));

  useEffect(() => {
    load();
  }, []);

  const toggle = d =>
    setForm(f => ({
      ...f,
      diseases: f.diseases.includes(d) ? f.diseases.filter(x => x !== d) : [...f.diseases, d],
    }));

  const submit = async e => {
    e.preventDefault();
    setMsg("");
    setErr("");
    // Validaciones previas para feedback inmediato
    if (Number(form.weight) < 50) return setErr("Peso mínimo 50 kg.");
    if (!twoMonthsAgo(form.last_donation_date)) return setErr("Deben pasar al menos 2 meses desde la última donación.");
    try {
      const { data } = await api.post("/health", form);
      setMsg(`Guardado. Estado: ${data.data.status}`);
      load();
    } catch (er) {
      setErr(er.userMessage || "Error");
    }
  };

  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header">
          <h2>Salud</h2>
          <Bell />
        </div>
        <div className="grid grid2">
          <div className="card">
            <h3>Cuestionario</h3>
            <form onSubmit={submit} className="list">
              <input
                type="number"
                value={form.weight}
                onChange={e => setForm({ ...form, weight: +e.target.value })}
                placeholder="Peso (kg)"
              />
              <div className="diseases-group">
                <span className="diseases-label">Enfermedades:</span>
                {["Diabetes", "Hipertensión", "Cardíaca", "Anemia crónica", "Ninguna"].map(
                    (d) => (
                    <label key={d} className="diseases-item">
                        <input
                        type="checkbox"
                        checked={form.diseases.includes(d)}
                        onChange={() => toggle(d)}
                        />
                        <span>{d}</span>
                    </label>
                    )
                )}
                </div>

              <input
                value={form.medications}
                onChange={e => setForm({ ...form, medications: e.target.value })}
                placeholder="Medicamentos"
              />
              <label>
                Fecha última donación
                <input
                  type="date"
                  value={form.last_donation_date}
                  onChange={e => setForm({ ...form, last_donation_date: e.target.value })}
                />
              </label>
              <label>
                Grupo
                <select value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}>
                  <option>A</option>
                  <option>B</option>
                  <option>AB</option>
                  <option>O</option>
                </select>
              </label>
              <label>
                Factor
                <select value={form.rh_factor} onChange={e => setForm({ ...form, rh_factor: e.target.value })}>
                  <option>Rh+</option>
                  <option>Rh-</option>
                </select>
              </label>
              <button>Guardar</button>
              {msg && <div className="badge">{msg}</div>}
              {err && <div style={{ color: "crimson" }}>{err}</div>}
            </form>
          </div>
          <div className="card">
            <h3>Historial</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Peso</th>
                  <th>Enfermedades</th>
                  <th>Últ. donación</th>
                  <th>Grupo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {hist.map(h => (
                  <tr key={h.id}>
                    <td>{new Date(h.created_at * 1000).toLocaleDateString()}</td>
                    <td>{h.weight}kg</td>
                    <td>{h.diseases}</td>
                    <td>{h.last_donation_date}</td>
                    <td>
                      {h.blood_group}
                      {h.rh_factor === "Rh+" ? "+" : "-"}
                    </td>
                    <td>{h.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
