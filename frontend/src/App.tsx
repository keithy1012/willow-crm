import React, { useEffect, useState } from "react";
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("currentUser");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setCurrentUser(JSON.parse(storedUser));
    } else {
      const urlUser = searchParams.get("user");
      const testUserToken = localStorage.getItem("testUser");
      const testToken = urlUser || testUserToken || "user1";

      if (urlUser && urlUser !== testUserToken) {
        localStorage.setItem("testUser", urlUser);
      }

      setToken(testToken);
      setCurrentUser(
        testToken === "user1"
          ? {
              id: "507f1f77bcf86cd799439011",
              firstName: "Dr",
              lastName: "Smith",
              username: "drsmith",
              role: "Doctor" as const,
            }
          : {
              id: "507f1f77bcf86cd799439012",
              firstName: "John",
              lastName: "Patient",
              username: "johnpatient",
              role: "Patient" as const,
            }
      );
    }
  }, [searchParams]);

  // Format user for WebSocketProvider
  const formattedUser = currentUser
    ? {
        id: currentUser._id || currentUser.id,
        name: `${currentUser.firstName} ${currentUser.lastName}`,
        username: currentUser.username,
        avatar: currentUser.profilePic,
        role: currentUser.role,
      }
    : {
        // Default user if nothing else is available
        id: "507f1f77bcf86cd799439012",
        name: "John Patient",
        username: "johnpatient",
        role: "Patient" as const,
      };

  return (
    <WebSocketProvider token={token || "user2"} currentUser={formattedUser}>
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
