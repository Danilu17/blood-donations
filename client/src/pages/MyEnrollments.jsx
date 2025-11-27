// client/src/pages/MyEnrollments.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Bell from "../components/Bell";
import api from "../api";

export default function MyEnrollments() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  const load = () => api.get("/enroll/my").then(r => setItems(r.data.data));
  useEffect(() => {
    load();
  }, []);

  const cancel = async id => {
    await api.delete(`/enroll/${id}`).catch(() => {});
    setMsg("Inscripción cancelada");
    load();
  };

  return (
    <>
      <Sidebar />
      <main className="main">
        <div className="header">
          <h2>Mis inscripciones</h2>
          <Bell />
        </div>
        {msg && <div className="badge">{msg}</div>}
        <table className="table">
          <thead>
            <tr>
              <th>Campaña</th>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Estado</th>
               <th>Estado campaña</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}>
                <td>{i.name}</td>
                <td>{i.date}</td>
                <td>
                  {i.start_time}-{i.end_time}
                </td>
                <td>{i.status}</td>
                <td>{i.campaign_status}</td>
                <td>
                  <button className="ghost" onClick={() => cancel(i.campaign_id)}>
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}
