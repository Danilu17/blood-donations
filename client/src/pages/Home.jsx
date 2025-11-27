// client/src/pages/Home.jsx  (REEMPLAZA COMPLETO)
// Redirige “Inicio” al panel correcto según el rol principal disponible.
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Home() {
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    const roles = user?.roles || [];
    if (roles.includes("Admin")) return nav("/admin", { replace: true });
    if (roles.includes("Organizer")) return nav("/org", { replace: true });
    if (roles.includes("Beneficiary")) return nav("/benef", { replace: true });
    // default Donor
    return nav("/dashboard", { replace: true });
  }, [user, nav]);

  return <div className="container">Redirigiendo…</div>;
}
