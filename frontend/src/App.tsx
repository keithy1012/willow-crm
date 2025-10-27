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

const App: React.FC = () => {
  return (
    <div className="flex">
      <PatientSidebar />
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
    </div>
  );
};
export default App;
