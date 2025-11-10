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
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import Landing from "./pages/Onboarding/Landing";
import SignUp1 from "./pages/Onboarding/SignUp1";
import SignUp2 from "./pages/Onboarding/SignUp2";
import SignUp3 from "./pages/Onboarding/SignUp3";
import RollSelection from "./pages/Onboarding/RollSelection";
import PatientOnboarding1 from "./pages/Onboarding/Patient/PatientOnboarding1";
import PatientOnboarding2 from "./pages/Onboarding/Patient/PatientOnboarding2";
import PatientOnboarding3 from "./pages/Onboarding/Patient/PatientOnboarding3";
import PatientOnboarding4 from "./pages/Onboarding/Patient/PatientOnboarding4";
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
import { AuthProvider } from "contexts/AuthContext";
import { User } from "api/types/user.types";

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for authenticated user
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Authenticated user found:", parsedUser.email);
        setToken(storedToken);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, []);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Routes that don't require authentication
  const publicRoutes = (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup1" element={<SignUp1 />} />
      <Route path="/signup2" element={<SignUp2 />} />
      <Route path="/signup3" element={<SignUp3 />} />
      <Route path="/roleselection" element={<RollSelection />} />
      <Route path="/patientonboarding1" element={<PatientOnboarding1 />} />
      <Route path="/patientonboarding2" element={<PatientOnboarding2 />} />
      <Route path="/patientonboarding3" element={<PatientOnboarding3 />} />
      <Route path="/patientonboarding4" element={<PatientOnboarding4 />} />
      <Route path="/staffonboarding" element={<StaffOnboarding />} />
      <Route path="/doctoronboarding" element={<DoctorOnboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/error" element={<Error />} />

      {/* Redirect to login if trying to access protected routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );

  // Protected routes that require authentication
  const protectedRoutes = (
    <WebSocketProvider token={token!} currentUser={currentUser!}>
      <Routes>
        {/* Public routes still accessible when logged in */}
        <Route
          path="/"
          element={<Navigate to={getDefaultRoute(currentUser!.role)} replace />}
        />
        <Route
          path="/login"
          element={<Navigate to={getDefaultRoute(currentUser!.role)} replace />}
        />

        {/* Patient routes */}
        <Route element={<PatientLayout />}>
          <Route path="/patientdashboard" element={<Dashboard />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/bug-report" element={<BugReportPage />} />
          <Route path="/help-support" element={<HelpSupportPage />} />
        </Route>

        {/* Operations routes */}
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
          <Route path="/ops-bug-report" element={<BugReportPage />} />
        </Route>

        {/* IT routes */}
        <Route element={<ItsLayout />}>
          <Route path="/itdashboard" element={<PendingDashboard />} />
          <Route path="/itdashboard/history" element={<ITHistory />} />
          <Route path="/it-bug-report" element={<BugReportPage />} />
        </Route>

        {/* Finance routes */}
        <Route
          path="/financedashboard"
          element={<div>Finance Dashboard - Coming Soon</div>}
        />

        {/* Error route */}
        <Route path="/error" element={<Error />} />

        {/* Catch all - redirect based on role */}
        <Route
          path="*"
          element={<Navigate to={getDefaultRoute(currentUser!.role)} replace />}
        />
      </Routes>
    </WebSocketProvider>
  );

  return (
    <AuthProvider>
      <SignupProvider>
        {currentUser && token ? protectedRoutes : publicRoutes}
      </SignupProvider>
    </AuthProvider>
  );
};

// Helper function to get default route based on user role
const getDefaultRoute = (role: string): string => {
  switch (role) {
    case "Patient":
      return "/patientdashboard";
    case "Doctor":
      return "/doctordashboard";
    case "Ops":
      return "/opsdashboard/doctors";
    case "IT":
      return "/itdashboard";
    case "Finance":
      return "/financedashboard";
    default:
      return "/login";
  }
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
