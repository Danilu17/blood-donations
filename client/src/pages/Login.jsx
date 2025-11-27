// client/src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("donor@demo.com");
  const [password, setPassword] = useState("Donor123");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login(email, password);
      nav("/");
    } catch (er) {
      setErr(er.userMessage || "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
        <h2>Login</h2>
        <form onSubmit={submit} className="list">
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="correo" />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="contraseña"
          />
          {err && <div style={{ color: "crimson" }}>{err}</div>}
          <button disabled={busy}>{busy ? "Ingresando..." : "Iniciar sesión"}</button>
        </form>
        <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
          <Link to="/forgot">¿Olvidaste tu contraseña?</Link>
          <Link to="/register">Registrate acá</Link>
        </div>
      </div>
    </div>
  );
}
