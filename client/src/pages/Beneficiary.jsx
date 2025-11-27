// client/src/pages/Beneficiary.jsx  (REEMPLAZA COMPLETO)
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

/* HOME: registrar solicitud y ver solicitudes */
export default function BeneficiaryHome() {
  const [reqs, setReqs] = useState([]);
  const [linked, setLinked] = useState({ id: null, items: [] });
  const [form, setForm] = useState({
    blood_group: "O",
    rh_factor: "Rh+",
    units: 1,
    center_id: 1,
    urgency: "critical",
    estimated_date: "",
  });

  const load = async () => {
    const r = await api.get("/beneficiary/requests/mine");
    setReqs(r.data.data);
  };
  useEffect(() => { load(); }, []);

  const submit = async e => {
    e.preventDefault();
    await api.post("/beneficiary/requests", form);
    setForm(f => ({ ...f, units: 1 }));
    await load();
  };

  const verVinculadas = async requestId => {
    try {
      const { data } = await api.get(`/beneficiary/linked-campaigns/${requestId}`);
      setLinked({ id: requestId, items: data.data || [] });
    } catch {
      setLinked({ id: requestId, items: [] });
    }
  };

  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header">
          <h2>Beneficiario</h2>
          <Bell />
        </div>
        <div className="grid grid2">
          <div className="card">
            <h3>Registrar solicitud de sangre</h3>
            <form onSubmit={submit} className="list">
              <label>
                Grupo
                <select value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}>
                  <option>A</option><option>B</option><option>AB</option><option>O</option>
                </select>
              </label>
              <label>
                Factor
                <select value={form.rh_factor} onChange={e => setForm({ ...form, rh_factor: e.target.value })}>
                  <option>Rh+</option><option>Rh-</option>
                </select>
              </label>
              <input type="number" value={form.units} onChange={e => setForm({ ...form, units: +e.target.value })} placeholder="Unidades" />
              <input value={form.center_id} onChange={e => setForm({ ...form, center_id: +e.target.value })} placeholder="Centro ID" />
              <select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>
                <option>normal</option><option>urgent</option><option>critical</option>
              </select>
              <input type="date" value={form.estimated_date} onChange={e => setForm({ ...form, estimated_date: e.target.value })} />
              <button>Enviar</button>
            </form>
          </div>

          <div className="card">
            <h3>Mis solicitudes</h3>
            <table className="table">
              <thead>
                <tr><th>Fecha</th><th>Grupo</th><th>Unidades</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {reqs.map(r => (
                  <tr key={r.id}>
                    <td>{r.estimated_date}</td>
                    <td>{r.blood_group}{r.rh_factor === "Rh+" ? "+" : "-"}</td>
                    <td>{r.units}</td>
                    <td>{r.status}</td>
                    <td><button className="ghost" onClick={() => verVinculadas(r.id)}>Ver campañas vinculadas</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {linked.id && (
              <div style={{ marginTop: 10 }}>
                <strong>Campañas vinculadas para solicitud #{linked.id}:</strong>
                <div className="list">
                  {linked.items.length === 0
                    ? <div className="badge">No hay campañas vinculadas.</div>
                    : linked.items.map(c => <div key={c.id} className="card">{c.name} — {c.date} {c.start_time}-{c.end_time}</div>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

/* PROPOSE: solo el formulario para proponer campaña */
export function BeneficiaryPropose() {
  const [prop, setProp] = useState({
    center_id: 1, date: "", start_time: "09:00", end_time: "13:00", note: ""
  });
  const [ok, setOk] = useState("");

  const submitProposal = async e => {
    e.preventDefault();
    await api.post("/beneficiary/proposals", prop);
    setOk("Propuesta enviada (Pendiente de validación)");
    setProp(p => ({ ...p, note: "" }));
  };

  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header">
          <h2>Proponer campaña</h2>
          <Bell />
        </div>
        <div className="card">
          <form onSubmit={submitProposal} className="row" style={{ gap: 8 }}>
            <input value={prop.center_id} onChange={e => setProp({ ...prop, center_id: +e.target.value })} placeholder="Centro ID" />
            <input type="date" value={prop.date} onChange={e => setProp({ ...prop, date: e.target.value })} />
            <input type="time" value={prop.start_time} onChange={e => setProp({ ...prop, start_time: e.target.value })} />
            <input type="time" value={prop.end_time} onChange={e => setProp({ ...prop, end_time: e.target.value })} />
            <input value={prop.note} onChange={e => setProp({ ...prop, note: e.target.value })} placeholder="Nota (opcional)" />
            <button>Enviar propuesta</button>
          </form>
          {ok && <div className="badge" style={{ marginTop: 10 }}>{ok}</div>}
        </div>
      </main>
    </>
  );
}
