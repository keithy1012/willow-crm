import React, { useEffect, useState } from "react";
import "./App.css";
import PatientSidebar from "./components/sidebar/PatientSidebar";
import Dashboard from "./pages/Patients/Dashboard";
import Messages from "./pages/Patients/Messages";
import Appointments from "./pages/Patients/Appointments";
import MedicalRecords from "./pages/Patients/MedicalRecords";
import Medications from "./pages/Patients/Medications";
import Insurance from "./pages/Patients/Insurance";
import BugReportPage from "./pages/Bugs/BugReport";
import HelpSupportPage from "./pages/Patients/HelpSupport";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { SignupProvider } from "./contexts/SignUpContext";
import {
  BrowserRouter as Router,
  useSearchParams,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Landing from "./pages/Onboarding/Landing";
import SignUp1 from "./pages/Onboarding/SignUp1";
import SignUp2 from "./pages/Onboarding/SignUp2";
import SignUp3 from "./pages/Onboarding/SignUp3";
import RollSelection from "./pages/Onboarding/RollSelection";
import PatientOnboarding1 from "./pages/Onboarding/Patient/PatientOnboarding1";
import PatientOnboarding2 from "./pages/Onboarding/Patient/PatientOnboarding2";
import PatientOnboarding3 from "./pages/Onboarding/Patient/PatientOnboarding3";
import StaffOnboarding from "./pages/Onboarding/Staff/StaffOnboarding";
import DoctorOnboarding from "./pages/Onboarding/Staff/DoctorOnboarding";
import Login from "./pages/Login/LoginScreen";
import ForgotPassword from "./pages/Login/ForgotPassword";
import Error from "./pages/Error/ErrorPage";
import OpsDoctorDashboard from "pages/Operations/DoctorDashboard";
import OpsPatientDashboard from "pages/Operations/PatientDashboard";
import OpsHistory from "pages/Operations/HistoryDashboard";
import OpsSidebar from "components/sidebar/OpsSidebar";

import ItSidebar from "components/sidebar/ItSidebar";
import PendingDashboard from "pages/IT/PendingDashboard";
import ITHistory from "pages/IT/ITHistory";
import PatientOnboarding4 from "pages/Onboarding/Patient/PatientOnboarding4";
import { AuthProvider } from "contexts/AuthContext";
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
const OpsLayout: React.FC = () => {
  return (
    <div className="flex">
      <div className="w-56 h-screen bg-background border-r border-stroke flex flex-col sticky top-0">
        <OpsSidebar />
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

const ItsLayout: React.FC = () => {
  return (
    <div className="flex">
      <div className="w-56 h-screen bg-background border-r border-stroke flex flex-col sticky top-0">
        <ItSidebar />
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

  // In App.tsx, update the useEffect in AppContent:

  useEffect(() => {
    // Check for auth token using the CORRECT key names
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      // Real authentication token exists
      console.log("Using real auth token");
      setToken(storedToken);
      setCurrentUser(JSON.parse(storedUser));
    } else {
      // No real auth, check for test mode
      const urlUser = searchParams.get("user");
      const testUserToken = localStorage.getItem("testUser");

      if (urlUser || testUserToken) {
        // Test mode - but DON'T pass these as auth tokens
        console.log("Using test mode - no real auth");
        const testMode = urlUser || testUserToken || "user1";

        if (urlUser && urlUser !== testUserToken) {
          localStorage.setItem("testUser", urlUser);
        }

        // Don't set a fake token - WebSocket needs real auth
        setToken(null);
        setCurrentUser(
          testMode === "user1"
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
      } else {
        // No auth and no test mode
        setToken(null);
        setCurrentUser(null);
      }
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
    <AuthProvider>
      <WebSocketProvider token={token || ""} currentUser={formattedUser}>
        <SignupProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup1" element={<SignUp1 />} />
            <Route path="/signup2" element={<SignUp2 />} />
            <Route path="/signup3" element={<SignUp3 />} />
            <Route path="/roleselection" element={<RollSelection />} />
            <Route
              path="/patientonboarding1"
              element={<PatientOnboarding1 />}
            />
            <Route
              path="/patientonboarding2"
              element={<PatientOnboarding2 />}
            />
            <Route
              path="/patientonboarding3"
              element={<PatientOnboarding3 />}
            />
            <Route
              path="/patientonboarding4"
              element={<PatientOnboarding4 />}
            />
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
              <Route path="/insurance" element={<Insurance />} />
              <Route path="/bug-report" element={<BugReportPage />} />
              <Route path="/help-support" element={<HelpSupportPage />} />
              <Route path="/insurance" element={<Insurance />} />
            </Route>

            <Route element={<OpsLayout />}>
              <Route
                path="/opsdashboard/doctors"
                element={<OpsDoctorDashboard />}
              />
              <Route
                path="/opsdashboard/patients"
                element={<OpsPatientDashboard />}
              />
              <Route path="/opsdashboard/history" element={<OpsHistory />} />
              <Route path="/bug-report" element={<BugReportPage />} />
            </Route>

            <Route element={<ItsLayout />}>
              <Route
                path="/itdashboard/pending"
                element={<PendingDashboard />}
              />
              <Route path="/itdashboard/history" element={<ITHistory />} />
            </Route>

            <Route
              path="/financedashboard"
              element={<div>Finance Dashboard</div>}
            />

            <Route element={<OpsLayout />}>
              <Route
                path="/opsdashboard/doctors"
                element={<OpsDoctorDashboard />}
              />
              <Route
                path="/opsdashboard/patients"
                element={<OpsPatientDashboard />}
              />
              <Route path="/opsdashboard/history" element={<OpsHistory />} />
            </Route>

            <Route path="/error" element={<Error />} />
          </Routes>
        </SignupProvider>
      </WebSocketProvider>
    </AuthProvider>
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
