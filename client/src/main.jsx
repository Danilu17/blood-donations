// client/src/main.jsx
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
import Beneficiary from "./pages/Beneficiary";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/forgot" element={<Forgot/>}/>
          <Route path="/reset" element={<Reset/>}/>
          <Route path="/" element={<ProtectedRoute><Home/></ProtectedRoute>} />
          {/* Donor */}
          <Route path="/dashboard" element={<ProtectedRoute roles={["Donor"]}><DonorDashboard/></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute roles={["Donor","Organizer","Admin"]}><CampaignList/></ProtectedRoute>} />
          <Route path="/campaigns/:id" element={<ProtectedRoute roles={["Donor","Organizer","Admin"]}><CampaignDetail/></ProtectedRoute>} />
          <Route path="/my-enrollments" element={<ProtectedRoute roles={["Donor"]}><MyEnrollments/></ProtectedRoute>} />
          <Route path="/health" element={<ProtectedRoute roles={["Donor"]}><Health/></ProtectedRoute>} />
          <Route path="/donations" element={<ProtectedRoute roles={["Donor"]}><Donations/></ProtectedRoute>} />
          <Route path="/volunteer" element={<ProtectedRoute roles={["Donor"]}><Volunteer/></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute roles={["Donor"]}><Settings/></ProtectedRoute>} />
          {/* Organizer */}
          <Route path="/org" element={<ProtectedRoute roles={["Organizer"]}><OrgDashboard/></ProtectedRoute>} />
          <Route path="/org/campaigns" element={<ProtectedRoute roles={["Organizer"]}><OrgCampaigns/></ProtectedRoute>} />
          <Route path="/org/communications" element={<ProtectedRoute roles={["Organizer"]}><OrgCommunications/></ProtectedRoute>} />
          <Route path="/org/volunteers" element={<ProtectedRoute roles={["Organizer"]}><OrgVolunteers/></ProtectedRoute>} />
          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={["Admin"]}><AdminDashboard/></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={["Admin"]}><AdminUsers/></ProtectedRoute>} />
          <Route path="/admin/campaigns" element={<ProtectedRoute roles={["Admin"]}><AdminCampaigns/></ProtectedRoute>} />
          <Route path="/admin/centers" element={<ProtectedRoute roles={["Admin"]}><AdminCenters/></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute roles={["Admin"]}><AdminReports/></ProtectedRoute>} />
          {/* Beneficiary */}
          <Route path="/benef" element={<ProtectedRoute roles={["Beneficiary"]}><Beneficiary/></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
