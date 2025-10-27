import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PatientSidebar from "./components/sidebar/PatientSidebar";
import Dashboard from "./Patients/Dashboard";
import Messages from "./Patients/Messages";
import Appointments from "./Patients/Appointments";
import MedicalRecords from "./Patients/MedicalRecords";
import Medications from "./Patients/Medications";
import BugReportPage from "./Patients/BugReport";
import HelpSupportPage from "./Patients/HelpSupport";
import { WebSocketProvider } from "./contexts/WebSocketContext";

const App: React.FC = () => {
  const token = localStorage.getItem("authToken") ?? "";
  const currentUser = {
    id: "user-id-from-auth",
    name: "Current User Name",
    username: "currentusername",
    role: "Doctor", // or 'Patient'
  };

  return (
    <div className="flex">
      <div className="w-56 h-screen bg-background border-r border-stroke flex flex-col sticky top-0">
        <PatientSidebar />
      </div>
      <WebSocketProvider token={token} currentUser={currentUser}>
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/medical-records" element={<MedicalRecords />} />
            <Route path="/medications" element={<Medications />} />
            <Route path="/bug-report" element={<BugReportPage />} />
            <Route path="/help-support" element={<HelpSupportPage />} />
          </Routes>
        </div>
      </WebSocketProvider>
    </div>
  );
};
export default App;
