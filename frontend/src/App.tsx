import React from "react";
import "./App.css";
import PatientSidebar from "./components/sidebar/PatientSidebar";
import Dashboard from "./Patients/Dashboard";
import Messages from "./Patients/Messages";
import Appointments from "./Patients/Appointments";
import MedicalRecords from "./Patients/MedicalRecords";
import Medications from "./Patients/Medications";
import BugReportPage from "./Patients/BugReport";
import HelpSupportPage from "./Patients/HelpSupport";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { SignupProvider } from "./context/SignUpContext";
import {
  BrowserRouter as Router,
  useSearchParams,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Landing from "./Onboarding/Landing";
import SignUp1 from "./Onboarding/SignUp1";
import SignUp2 from "./Onboarding/SignUp2";
import SignUp3 from "./Onboarding/SignUp3";
import RollSelection from "./Onboarding/RollSelection";
import PatientOnboarding1 from "./Onboarding/Patient/PatientOnboarding1";
import PatientOnboarding2 from "./Onboarding/Patient/PatientOnboarding2";
import PatientOnboarding3 from "./Onboarding/Patient/PatientOnboarding3";
import StaffOnboarding from "./Onboarding/Staff/StaffOnboarding";
import DoctorOnboarding from "./Onboarding/Staff/DoctorOnboarding";
import Login from "./Login/LoginScreen"
import ForgotPassword from "./Login/ForgotPassword";
const PatientLayout: React.FC = () => {
  return (
    <div className="flex">
      <div className="w-56 h-screen bg-background border-r border-stroke flex flex-col sticky top-0">
        <PatientSidebar />
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlUser = searchParams.get("user");
  const storageUser = localStorage.getItem("testUser");
  const token = urlUser || storageUser || "user1";

  if (urlUser && urlUser !== storageUser) {
    localStorage.setItem("testUser", urlUser);
  }

  const currentUser =
    token === "user1"
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
    <WebSocketProvider token={token} currentUser={currentUser}>
      <SignupProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup1" element={<SignUp1 />} />
          <Route path="/signup2" element={<SignUp2 />} />
          <Route path="/signup3" element={<SignUp3 />} />
          <Route path="/roleselection" element={<RollSelection />} />
          <Route path="/patientonboarding1" element={<PatientOnboarding1 />} />
          <Route path="/patientonboarding2" element={<PatientOnboarding2 />} />
          <Route path="/patientonboarding3" element={<PatientOnboarding3 />} />
          <Route path="/staffonboarding" element={<StaffOnboarding />} />
          <Route path="/doctoronboarding" element={<DoctorOnboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />

          <Route element={<PatientLayout />}>
            <Route path="/patientdashboard" element={<Dashboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/medical-records" element={<MedicalRecords />} />
            <Route path="/medications" element={<Medications />} />
            <Route path="/bug-report" element={<BugReportPage />} />
            <Route path="/help-support" element={<HelpSupportPage />} />
          </Route>

          <Route path="/itdashboard" element={<div>IT Dashboard</div>} />
          <Route
            path="/financedashboard"
            element={<div>Finance Dashboard</div>}
          />
          <Route path="/opsdashboard" element={<div>Ops Dashboard</div>} />
        </Routes>
      </SignupProvider>
    </WebSocketProvider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
