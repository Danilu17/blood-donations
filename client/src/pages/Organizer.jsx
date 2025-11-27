// client/src/pages/Organizer.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

/* -------- Dashboard -------- */
export function OrgDashboard() {
  const [kpi, setKpi] = useState({ active: 0, volunteers: 0 });
  useEffect(() => {
    (async () => {
      try {
        const camps = await api.get("/campaigns");
        const vols = await api.get("/volunteer/pool");
        setKpi({
          active: camps.data.data?.length ?? camps.data.length ?? 0,
          volunteers: vols.data.data?.length ?? 0
        });
      } catch {
        setKpi({ active: 0, volunteers: 0 });
      }
    })();
  }, []);
  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header"><h2>Organizador</h2><Bell /></div>
        <h3>Bienvenid@ — administra campañas y voluntarios desde el menú.</h3>
        <div className="grid grid2">
          <div className="card"><div className="kpi">{kpi.active}</div><div>Campañas activas</div></div>
          <div className="card"><div className="kpi">{kpi.volunteers}</div><div>Voluntarios</div></div>
        </div>
      </main>
    </>
  );
}

/* Util: mostrar signo Rh */
const rhSign = (rh) => rh === "Rh-" ? "-" : rh === "Rh+" ? "+" : "";

/* -------- Lista de campañas -------- */
export function OrgCampaigns() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/campaigns").then(r => setItems(r.data.data));
  useEffect(() => { load(); }, []);

  const finalize = async id => { if (!confirm("¿Finalizar campaña?")) return; await api.put(`/campaigns/${id}`, { status: "finalized" }); load(); };
  const cancel   = async id => { if (!confirm("¿Cancelar campaña?")) return; await api.delete(`/campaigns/${id}`); load(); };

  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header">
          <h2>Mis campañas</h2>
          <div className="row"><Link className="badge" to="/org/campaigns/new">+ Crear campaña</Link><Bell /></div>
        </div>

        <div className="grid">
          <div className="card">
            <div className="list">
              {items.map(c => (
                <div key={c.id} className="row item-row" style={{justifyContent:"space-between"}}>
                  <div className="item-main">
                    <strong>{c.name}</strong> — {c.date} {c.start_time}-{c.end_time}
                    <div className="muted">
                      Lugar: {c.place || c.center_name} — Cupos: {c.capacity} — Requiere: {c.blood_group}{rhSign(c.rh_factor)}
                    </div>
                  </div>
                  <div className="row item-actions" style={{gap:8}}>
                    <a className="badge" href={`http://localhost:4000/api/reports/inscriptions/${c.id}.pdf`} target="_blank" rel="noreferrer">PDF inscriptos</a>
                    <Link className="badge" to={`/org/campaigns/${c.id}/edit`}>Editar</Link>
                    <button className="ghost" onClick={() => finalize(c.id)}>Finalizar</button>
                    <button className="ghost" onClick={() => cancel(c.id)}>Cancelar</button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <div className="badge">No hay campañas activas.</div>}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

/* -------- Crear (center_id oculto por defecto=1) -------- */
export function OrgCampaignCreate() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "", place: "", center_id: 1,
    date: "", start_time: "08:00", end_time: "12:00",
    blood_group: "O", rh_factor: "Rh+",
    capacity: 40, notes: ""
  });
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    try {
      const req = ["name","place","date","start_time","end_time","blood_group","rh_factor","capacity"];
      const miss = req.filter(k => !String(form[k]).trim());
      if (miss.length) return setError("Faltan: " + miss.join(", ")); // por qué: UX inmediato
      await api.post("/campaigns", form);
      nav("/org/campaigns");
    } catch (e) { setError(e.response?.data?.error || "Error al crear"); }
  };

  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header"><h2>Crear campaña</h2><Bell /></div>
        <div className="grid">
          <div className="card list">
            <input placeholder="Nombre *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Lugar *"  value={form.place} onChange={e => setForm({ ...form, place: e.target.value })} />
            <input type="hidden" value={form.center_id} readOnly />

            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <div className="row">
              <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
              <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
            </div>
            <div className="row">
              <select value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}>
                {["O","A","B","AB"].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={form.rh_factor} onChange={e => setForm({ ...form, rh_factor: e.target.value })}>
                {["Rh+","Rh-"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <input type="number" placeholder="Cupos *" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} />
            <textarea placeholder='Notas / requisitos (ej: "sin tatuajes recientes")' value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            {error && <div className="badge warn">{error}</div>}
            <div className="row" style={{ gap:8 }}>
              <button onClick={submit}>Crear</button>
              <Link className="ghost" to="/org/campaigns">Cancelar</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

/* -------- Editar (center_id oculto) -------- */
export function OrgCampaignEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/campaigns/${id}`).then(r => {
      const c = r.data.data || r.data;
      setForm({
        name: c.name, place: c.place || "",
        center_id: c.center_id ?? 1,
        date: c.date, start_time: c.start_time, end_time: c.end_time,
        blood_group: c.blood_group, rh_factor: c.rh_factor,
        capacity: c.capacity, notes: c.notes || ""
      });
    });
  }, [id]);

  const save = async () => {
    setError("");
    try {
      const req = ["name","place","date","start_time","end_time","blood_group","rh_factor","capacity"];
      const miss = req.filter(k => !String(form[k]).trim());
      if (miss.length) return setError("Faltan: " + miss.join(", "));
      await api.put(`/campaigns/${id}`, form);
      nav("/org/campaigns");
    } catch (e) { setError(e.response?.data?.error || "Error al actualizar"); }
  };

  if (!form) return (<><Sidebar /><main className="main"><div className="card">Cargando…</div></main></>);

  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header"><h2>Editar campaña</h2><Bell /></div>
        <div className="grid">
          <div className="card list">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input value={form.place} onChange={e => setForm({ ...form, place: e.target.value })} />
            <input type="hidden" value={form.center_id} readOnly />

            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <div className="row">
              <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
              <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
            </div>
            <div className="row">
              <select value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}>
                {["O","A","B","AB"].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={form.rh_factor} onChange={e => setForm({ ...form, rh_factor: e.target.value })}>
                {["Rh+","Rh-"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} />
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            {error && <div className="badge warn">{error}</div>}
            <div className="row" style={{ gap:8 }}>
              <button onClick={save}>Guardar</button>
              <Link className="ghost" to="/org/campaigns">Cancelar</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

/* -------- Voluntarios -------- */
export function OrgVolunteers() {
  const [vols, setVols] = useState([]);
  const [camps, setCamps] = useState([]);
  const [sel, setSel] = useState({}); // mapa: user_id -> campaign_id seleccionado

  // carga inicial: voluntarios + campañas activas
  useEffect(() => {
    (async () => {
      const v = await api.get("/volunteer/pool");
      const c = await api.get("/campaigns");
      // normalizamos campañas (API puede devolver data o data.data)
      const allCamps = (c.data.data ?? c.data ?? []).filter(x => x.status !== "cancelled");
      setCamps(allCamps);
      const list = v.data.data ?? [];
      setVols(list);
      // preselección por coincidencia de sangre+rh
      const initialSel = {};
      for (const vol of list) {
        const match = allCamps.find(
          (cp) =>
            cp.blood_group === vol.blood_group &&
            cp.rh_factor === vol.rh_factor &&
            (cp.status === "active" || !cp.status)
        );
        if (match) initialSel[vol.user_id] = match.id;
      }
      setSel(initialSel);
    })().catch(() => {
      setVols([]); setCamps([]);
    });
  }, []);

  const matchesFor = (vol) =>
    camps.filter(
      (cp) =>
        cp.blood_group === vol.blood_group &&
        cp.rh_factor === vol.rh_factor &&
        (cp.status === "active" || !cp.status)
    );

  const doAssign = async (userId) => {
    const campId = sel[userId];
    if (!campId) {
      alert("Elegí una campaña para este voluntario.");
      return;
    }
    try {
      await api.post(`/volunteer/${userId}/assign/${campId}`);
      alert("Voluntario asignado y notificado.");
    } catch (e) {
      alert(e?.response?.data?.error || "No se pudo asignar.");
    }
  };

  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header">
          <h2>Voluntarios</h2>
          <Bell />
        </div>

        <div className="grid">
          {vols.map((v) => {
            const matches = matchesFor(v);
            return (
              <div key={v.id} className="card">
                <strong>{v.full_name}</strong>
                <div className="muted">
                  Tipo: {v.blood_group}{v.rh_factor === "Rh-" ? "-" : v.rh_factor ? "+" : ""} · {v.days} {v.from_time}-{v.to_time}
                </div>

                <div className="row" style={{ gap: 8, marginTop: 8 }}>
                  <select
                    value={sel[v.user_id] ?? ""}
                    onChange={(e) =>
                      setSel((s) => ({ ...s, [v.user_id]: Number(e.target.value) }))
                    }
                    style={{ flex: 1 }}
                  >
                    <option value="" disabled>
                      {matches.length ? "Elegir campaña compatible" : "No hay campañas compatibles"}
                    </option>
                    {matches.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.date} {c.start_time}-{c.end_time}
                      </option>
                    ))}
                  </select>

                  <button
                    className="ghost"
                    onClick={() => doAssign(v.user_id)}
                    disabled={!sel[v.user_id]}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            );
          })}
          {vols.length === 0 && <div className="badge">No hay voluntarios disponibles.</div>}
        </div>
      </main>
    </>
  );
}


/* -------- Comunicaciones -------- */
export function OrgCommunications() {
  const [audience, setAudience] = useState("donors"); // donors | organizers | beneficiaries | admins
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [campId, setCampId] = useState("");

  const send = async () => {
    if (!subject.trim() || !message.trim()) {
      alert("Completá asunto y mensaje.");
      return;
    }
    try {
      const { data } = await api.post("/notifications/broadcast", {
        audience, subject, message, campaign_id: campId || null
      });
      alert(`Comunicado enviado a ${data.data?.count ?? 0} usuarios.`);
      setSubject(""); setMessage(""); setCampId("");
    } catch (e) {
      alert(e?.response?.data?.error || "Error al enviar comunicado.");
    }
  };

  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header"><h2>Enviar comunicado</h2><Bell /></div>
        <div className="card list">
          <div className="row" style={{ gap: 8 }}>
            <select value={audience} onChange={e => setAudience(e.target.value)} style={{ flex: 1 }}>
              <option value="donors">Donantes</option>
              <option value="beneficiaries">Beneficiarios</option>
              <option value="organizers">Organizadores</option>
              <option value="admins">Administradores</option>
            </select>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <input style={{ flex: 1 }} placeholder="Asunto" value={subject} onChange={e => setSubject(e.target.value)} />
            <input style={{ width: 220 }} placeholder="Campaña ID (opcional)" value={campId} onChange={e => setCampId(e.target.value)} />
          </div>
          <textarea placeholder="Mensaje" value={message} onChange={e => setMessage(e.target.value)} />
          <button onClick={send}>Enviar</button>
          <div className="badge">Las notificaciones llegan a la campanita del destinatario según su rol.</div>
        </div>
      </main>
    </>
  );
}
