import React, { useContext, useEffect } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import AuthProvider, { AuthCtx } from "./AuthContext.jsx";
import Login from "../views/Login.jsx";
import Register from "../views/Register.jsx";
import DonorHome from "../views/donor/Home.jsx";
import Campaigns from "../views/donor/Campaigns.jsx";
import CampaignDetail from "../views/donor/CampaignDetail.jsx";
import MyRegs from "../views/donor/MyRegistrations.jsx";
import HealthForm from "../views/donor/HealthForm.jsx";
import HealthHistory from "../views/donor/HealthHistory.jsx";
import Donations from "../views/donor/Donations.jsx";
import Volunteer from "../views/donor/Volunteer.jsx";
import Settings from "../views/common/Settings.jsx";
import OrgHome from "../views/org/Home.jsx";
import OrgCampaigns from "../views/org/MyCampaigns.jsx";
import OrgEnrollments from "../views/org/Enrollments.jsx";
import OrgAnnounce from "../views/org/Announce.jsx";
import OrgVolunteers from "../views/org/Volunteers.jsx";
import AdminHome from "../views/admin/Home.jsx";
import AdminUsers from "../views/admin/Users.jsx";
import AdminRoleReq from "../views/admin/RoleRequests.jsx";
import AdminCamps from "../views/admin/Campaigns.jsx";
import AdminCampDetail from "../views/admin/CampaignDetail.jsx";
import AdminCenters from "../views/admin/Centers.jsx";

function Layout({children}) {
  const { user, logout } = useContext(AuthCtx);
  const nav = useNavigate();
  useEffect(()=>{ if(!user && localStorage.getItem("token")) nav("/login"); },[]);
  return (
    <div style={{display:"grid", gridTemplateColumns:"220px 1fr", minHeight:"100vh", fontFamily:"system-ui"}}>
      <aside style={{padding:"16px", borderRight:"1px solid #eee"}}>
        <div style={{fontWeight:"bold"}}>Logo</div>
        {!user && <nav style={{marginTop:12}}><Link to="/login">Login</Link></nav>}
        {user && <>
          <div style={{marginTop:8, color:"#666"}}>{user.name || "Usuario"} — {user.role}</div>
          <nav style={{display:"grid", gap:8, marginTop:16}}>
            {user.role==="DONOR" && <>
              <Link to="/donor">Inicio</Link>
              <Link to="/donor/campaigns">Campañas</Link>
              <Link to="/donor/regs">Mis inscripciones</Link>
              <Link to="/donor/health">Salud</Link>
              <Link to="/donor/health/history">Historial salud</Link>
              <Link to="/donor/donations">Donaciones</Link>
              <Link to="/donor/volunteer">Voluntariado</Link>
            </>}
            {user.role==="ORG" && <>
              <Link to="/org">Inicio</Link>
              <Link to="/org/campaigns">Mis campañas</Link>
              <Link to="/org/enrollments">Inscriptos</Link>
              <Link to="/org/announce">Enviar comunicado</Link>
              <Link to="/org/vols">Voluntarios</Link>
            </>}
            {user.role==="ADMIN" && <>
              <Link to="/admin">Inicio</Link>
              <Link to="/admin/users">Usuarios</Link>
              <Link to="/admin/role-requests">Solicitudes</Link>
              <Link to="/admin/campaigns">Campañas</Link>
              <Link to="/admin/centers">Centros</Link>
            </>}
            <Link to="/settings">Configuraciones</Link>
            <button onClick={logout}>Cerrar sesión</button>
          </nav>
        </>}
      </aside>
      <main style={{padding:"16px"}}>{children}</main>
    </div>
  );
}

function Guarded({role, children}) {
  const { user } = useContext(AuthCtx);
  if (!user) return <Navigate to="/login" replace/>;
  if (role && user.role !== role) return <Navigate to={`/${user.role.toLowerCase()}`} replace/>;
  return children;
}

export default function App(){
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/login"/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          {/* Donor */}
          <Route path="/donor" element={<Guarded role="DONOR"><DonorHome/></Guarded>}/>
          <Route path="/donor/campaigns" element={<Guarded role="DONOR"><Campaigns/></Guarded>}/>
          <Route path="/donor/campaigns/:id" element={<Guarded role="DONOR"><CampaignDetail/></Guarded>}/>
          <Route path="/donor/regs" element={<Guarded role="DONOR"><MyRegs/></Guarded>}/>
          <Route path="/donor/health" element={<Guarded role="DONOR"><HealthForm/></Guarded>}/>
          <Route path="/donor/health/history" element={<Guarded role="DONOR"><HealthHistory/></Guarded>}/>
          <Route path="/donor/donations" element={<Guarded role="DONOR"><Donations/></Guarded>}/>
          <Route path="/donor/volunteer" element={<Guarded role="DONOR"><Volunteer/></Guarded>}/>
          {/* Org */}
          <Route path="/org" element={<Guarded role="ORG"><OrgHome/></Guarded>}/>
          <Route path="/org/campaigns" element={<Guarded role="ORG"><OrgCampaigns/></Guarded>}/>
          <Route path="/org/enrollments" element={<Guarded role="ORG"><OrgEnrollments/></Guarded>}/>
          <Route path="/org/announce" element={<Guarded role="ORG"><OrgAnnounce/></Guarded>}/>
          <Route path="/org/vols" element={<Guarded role="ORG"><OrgVolunteers/></Guarded>}/>
          {/* Admin */}
          <Route path="/admin" element={<Guarded role="ADMIN"><AdminHome/></Guarded>}/>
          <Route path="/admin/users" element={<Guarded role="ADMIN"><AdminUsers/></Guarded>}/>
          <Route path="/admin/role-requests" element={<Guarded role="ADMIN"><AdminRoleReq/></Guarded>}/>
          <Route path="/admin/campaigns" element={<Guarded role="ADMIN"><AdminCamps/></Guarded>}/>
          <Route path="/admin/campaigns/:id" element={<Guarded role="ADMIN"><AdminCampDetail/></Guarded>}/>
          <Route path="/admin/centers" element={<Guarded role="ADMIN"><AdminCenters/></Guarded>}/>
          {/* Common */}
          <Route path="/settings" element={<Guarded><Settings/></Guarded>}/>
        </Routes>
      </Layout>
    </AuthProvider>
  );
}
