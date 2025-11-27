// client/src/main.jsx  (SÓLO AJUSTE EN LAS RUTAS /campaigns)
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Forgot, Reset } from "./pages/ForgotReset";
import DonorDashboard from "./pages/DonorDashboard";
import { CampaignList, CampaignDetail } from "./pages/Campaigns";
import MyEnrollments from "./pages/MyEnrollments";
import Health from "./pages/Health";
import Donations from "./pages/Donations";
import Volunteer from "./pages/Volunteer";
import Settings from "./pages/Settings";
import { OrgDashboard, OrgCampaigns, OrgCommunications, OrgVolunteers } from "./pages/Organizer";
import { AdminDashboard, AdminUsers, AdminCampaigns, AdminCenters, AdminReports } from "./pages/Admin";
import Beneficiary, { BeneficiaryPropose } from "./pages/Beneficiary";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/reset" element={<Reset />} />

          {/* Inicio (redirige por rol) */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

          {/* Donor */}
          <Route path="/dashboard" element={<ProtectedRoute roles={["Donor"]}><DonorDashboard /></ProtectedRoute>} />
          {/* Campañas: sólo Donor y Organizer (Admin removido) */}
          <Route path="/campaigns" element={<ProtectedRoute roles={["Donor","Organizer"]}><CampaignList /></ProtectedRoute>} />
          <Route path="/campaigns/:id" element={<ProtectedRoute roles={["Donor","Organizer"]}><CampaignDetail /></ProtectedRoute>} />
          <Route path="/my-enrollments" element={<ProtectedRoute roles={["Donor"]}><MyEnrollments /></ProtectedRoute>} />
          <Route path="/health" element={<ProtectedRoute roles={["Donor"]}><Health /></ProtectedRoute>} />
          <Route path="/donations" element={<ProtectedRoute roles={["Donor"]}><Donations /></ProtectedRoute>} />
          <Route path="/volunteer" element={<ProtectedRoute roles={["Donor"]}><Volunteer /></ProtectedRoute>} />

          {/* Organizer */}
          <Route path="/org" element={<ProtectedRoute roles={["Organizer"]}><OrgDashboard /></ProtectedRoute>} />
          <Route path="/org/campaigns" element={<ProtectedRoute roles={["Organizer"]}><OrgCampaigns /></ProtectedRoute>} />
          <Route path="/org/communications" element={<ProtectedRoute roles={["Organizer"]}><OrgCommunications /></ProtectedRoute>} />
          <Route path="/org/volunteers" element={<ProtectedRoute roles={["Organizer"]}><OrgVolunteers /></ProtectedRoute>} />

          {/* Beneficiary */}
          <Route path="/benef" element={<ProtectedRoute roles={["Beneficiary"]}><Beneficiary /></ProtectedRoute>} />
          <Route path="/benef/propose" element={<ProtectedRoute roles={["Beneficiary"]}><BeneficiaryPropose /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={["Admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={["Admin"]}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/campaigns" element={<ProtectedRoute roles={["Admin"]}><AdminCampaigns /></ProtectedRoute>} />
          <Route path="/admin/centers" element={<ProtectedRoute roles={["Admin"]}><AdminCenters /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute roles={["Admin"]}><AdminReports /></ProtectedRoute>} />

          {/* Settings para todos */}
          <Route path="/settings" element={<ProtectedRoute roles={["Donor","Organizer","Admin","Beneficiary"]}><Settings /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
