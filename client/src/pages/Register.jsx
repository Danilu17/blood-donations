// client/src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const validPwd = s => /[A-Z]/.test(s) && /[a-z]/.test(s) && /\d/.test(s) && s.length >= 8;

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    surname: "",
    dni: "",
    birthdate: "",
    sex: "M",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setErr("");
    if (!consent) return setErr("Debes aceptar el consentimiento informado.");
    if (!validPwd(form.password))
      return setErr("Contraseña insegura (8+, mayúscula, minúscula y número).");
    setBusy(true);
    try {
      await register(form);
      nav("/");
    } catch (er) {
      setErr(er.userMessage || "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 560, margin: "40px auto" }}>
        <h2>Registrarse</h2>
        <form onSubmit={submit} className="grid grid2">
          {["name", "surname", "dni", "birthdate", "sex", "email", "phone", "address", "password"].map(k => (
            <input
              key={k}
              type={k === "password" ? "password" : k === "birthdate" ? "date" : "text"}
              placeholder={k}
              value={form[k]}
              onChange={e => setForm({ ...form, [k]: e.target.value })}
            />
          ))}
          <label className="row" style={{ gridColumn: "span 2" }}>
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
            Acepto el consentimiento informado.
          </label>
          {err && (
            <div style={{ gridColumn: "span 2", color: "crimson" }}>
              {err}
            </div>
          )}
          <button style={{ gridColumn: "span 2" }} disabled={busy}>
            {busy ? "Creando..." : "Crear cuenta"}
          </button>
          <Link to="/login" className="ghost" style={{ gridColumn: "span 2", textAlign: "center" }}>
            ← Volver
          </Link>
        </form>
      </div>
    </div>
  );
}
