// client/src/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.some(r => user.roles.includes(r))) return <Navigate to="/" replace />;
  return children;
}
