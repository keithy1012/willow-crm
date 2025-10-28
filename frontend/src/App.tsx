import React from "react";
import "./App.css";
import { Routes, Route, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  
  // Use URL parameter to determine user, fallback to localStorage
  const urlUser = searchParams.get('user');
  const storageUser = localStorage.getItem("testUser");
  const token = urlUser || storageUser || "user1";
  
  // Update localStorage to match URL if URL is present
  if (urlUser && urlUser !== storageUser) {
    localStorage.setItem("testUser", urlUser);
  }
  
  // Set currentUser based on the token
  const currentUser = token === "user1" 
    ? {
        id: "507f1f77bcf86cd799439011",
        name: "Dr. Smith",
        username: "drsmith",
        role: "Doctor" as const,
      }
    : {
        id: "507f1f77bcf86cd799439012",
        name: "John Patient",
        username: "johnpatient",
        role: "Patient" as const,
      };

  const handleUserSwitch = (userType: string) => {
    const newToken = userType === "doctor" ? "user1" : "user2";
    localStorage.setItem("testUser", newToken);
    // Update URL and reload
    window.location.href = `${window.location.pathname}?user=${newToken}`;
  };

  return (
    <div className="flex">
      {/* User switcher buttons */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        right: 0, 
        zIndex: 1000, 
        padding: '10px',
        background: 'white',
        borderBottom: '1px solid #ccc',
        borderLeft: '1px solid #ccc'
      }}>
        <button
          onClick={() => handleUserSwitch("doctor")}
          style={{ 
            marginRight: '10px', 
            padding: '5px 10px',
            background: token === "user1" ? '#4CAF50' : '#f0f0f0',
            color: token === "user1" ? 'white' : 'black',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Login as Doctor
        </button>
        <button
          onClick={() => handleUserSwitch("patient")}
          style={{ 
            padding: '5px 10px',
            background: token === "user2" ? '#4CAF50' : '#f0f0f0',
            color: token === "user2" ? 'white' : 'black',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Login as Patient
        </button>
        <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
          Current: {currentUser.name}
        </span>
      </div>
      
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