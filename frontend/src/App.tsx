import React from "react";
import "./App.css";
import PatientSidebar from "./components/sidebar/PatientSidebar";
import Dashboard from "./pages/Patients/Dashboard";
import Messages from "./pages/Patients/Messages";
import Appointments from "./pages/Patients/Appointments/Appointments";
import MedicalRecords from "./pages/Patients/MedicalRecords";
import Medications from "./pages/Patients/Medications";
import Insurance from "./pages/Patients/Insurance";
import BugReportPage from "./pages/General/BugReport";
import HelpSupportPage from "./pages/General/HelpSupport";
import FinanceSidebar from "./components/sidebar/FinanceSidebar";
import Invoices from "./pages/Finance/Invoices";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { SignupProvider } from "./contexts/SignUpContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
  useNavigate,
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
import ResetPassword from "pages/Login/ResetPassword";
import Error from "./pages/Error/ErrorPage";
import OpsDoctorDashboard from "pages/Operations/DoctorDashboard";
import OpsPatientDashboard from "pages/Operations/PatientDashboard";
import OpsHistory from "pages/Operations/HistoryDashboard";
import OpsSidebar from "components/sidebar/OpsSidebar";
import ItSidebar from "components/sidebar/ItSidebar";
import { AuthProvider, useAuth } from "contexts/AuthContext";
import DoctorSidebar from "components/sidebar/DoctorSidebar";
import DoctorDashboard from "pages/Doctor/DoctorDashboard";
import DoctorMessages from "pages/Doctor/DoctorMessages";
import DoctorPatientsPage from "pages/Doctor/Patients/DoctorPatients";
import DoctorAppointments from "pages/Doctor/Appointments/DoctorAppointments";
import PatientProfile from "pages/Patients/Profile";
import PatientEditRequest from "pages/Patients/PatientEditRequest";
// Layout Components
import PendingDashboard from "./pages/IT/PendingDashboard";
import ITHistory from "./pages/IT/ITHistory";
import Billing from "pages/Finance/Billing";
import OpsProfile from "pages/Operations/Profile";
import FinanceProfile from "pages/Finance/Profile";
import ITProfile from "pages/IT/Profile";
import ViewInvoices from "pages/Patients/ViewInvoices";
import AppointmentDetails from "pages/Doctor/Appointments/[id]";
import DoctorProfile from "pages/Doctor/Profile/Profile";
import PatientAppointmentView from "pages/Patients/Appointments/[id]";
import DoctorPatientProfile from "pages/Doctor/Patients/[id]";
import PublicDoctorProfile from "pages/Doctor/Profile/PublicProfile";

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

const DoctorLayout: React.FC = () => {
  return (
    <div className="flex">
      <div className="w-56 h-screen bg-background border-r border-stroke flex flex-col sticky top-0">
        <DoctorSidebar />
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

const FinanceLayout: React.FC = () => {
  return (
    <div className="flex">
      <div className="w-56 h-screen bg-background border-r border-stroke flex flex-col sticky top-0">
        <FinanceSidebar />
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

// Logout Component
const Logout: React.FC = () => {
  const { logout } = useAuth();

  React.useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        // Redirect to login
        window.location.href = "/login";
      } catch (error) {
        console.error("Logout error:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    };

    performLogout();
  }, [logout]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500">Logging out...</p>
      </div>
    </div>
  );
};

const RoleLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user?.role;

  if (role === "Ops") {
    return (
      <div className="flex">
        <div className="w-56 h-screen bg-background border-r border-stroke flex flex-col sticky top-0">
          <OpsSidebar />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  if (role === "Finance") {
    return (
      <div className="flex">
        <div className="w-56 h-screen bg-background border-r border-stroke flex flex-col sticky top-0">
          <FinanceSidebar />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  if (role === "IT") {
    return (
      <div className="flex">
        <div className="w-56 h-screen bg-background border-r border-stroke flex flex-col sticky top-0">
          <ItSidebar />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  if (role === "Doctor") {
    return (
      <div className="flex">
        <div className="w-56 h-screen bg-background border-r border-stroke flex flex-col sticky top-0">
          <DoctorSidebar />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    );
  }
  // Default to Patient layout
  return (
    <div className="flex">
      <div className="w-56 h-screen bg-background border-r border-stroke flex flex-col sticky top-0">
        <PatientSidebar />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
};

// Main App Routes Component that uses Auth Context
const AppRoutes: React.FC = () => {
  const { user, token, isLoading } = useAuth();

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

  // If not authenticated, show public routes
  if (!user || !token) {
    return (
      <SignupProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
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
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/error" element={<Error />} />
          {/* Redirect everything else to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </SignupProvider>
    );
  }

  return (
    <WebSocketProvider token={token || ""} currentUser={user}>
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
          <Route path="/patientonboarding4" element={<PatientOnboarding4 />} />
          <Route path="/staffonboarding" element={<StaffOnboarding />} />
          <Route path="/doctoronboarding" element={<DoctorOnboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

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
            <Route path="/patient-profile" element={<PatientProfile />} />
            <Route
              path="/patient-profile-edit"
              element={<PatientEditRequest />}
            />
            <Route path="/view-invoices" element={<ViewInvoices />} />
            <Route
              path="/patient/appointment/:appointmentId"
              element={<PatientAppointmentView />}
            />
            <Route path="/doctor/:doctorId" element={<PublicDoctorProfile />} />
          </Route>

          {/* Operations Routes */}
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
            <Route path="/ops-profile" element={<OpsProfile />} />
          </Route>

          <Route element={<DoctorLayout />}>
            <Route path="/doctordashboard" element={<DoctorDashboard />} />
            <Route path="/doctormessages" element={<DoctorMessages />} />
            <Route path="/doctorpatients" element={<DoctorPatientsPage />} />
            <Route
              path="/doctorappointments"
              element={<DoctorAppointments />}
            />
            <Route
              path="/doctor/appointment/:appointmentId"
              element={<AppointmentDetails />}
            />
            <Route
              path="/patient/:patientId"
              element={<DoctorPatientProfile />}
            />
            <Route path="/doctor-bug-report" element={<BugReportPage />} />
            <Route path="/doctor-help-support" element={<HelpSupportPage />} />
            <Route path="/doctor-profile" element={<DoctorProfile />} />
          </Route>
          {/* IT Routes */}
          <Route element={<ItsLayout />}>
            <Route path="/itdashboard" element={<PendingDashboard />} />
            <Route path="/itdashboard/history" element={<ITHistory />} />
            <Route path="it-profile" element={<ITProfile />} />
          </Route>

          {/* Finance Routes */}
          <Route element={<FinanceLayout />}>
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/finance-profile" element={<FinanceProfile />} />
          </Route>

          <Route
            path="/bug-report"
            element={
              <RoleLayoutWrapper>
                <BugReportPage />
              </RoleLayoutWrapper>
            }
          />
          <Route
            path="/help-support"
            element={
              <RoleLayoutWrapper>
                <HelpSupportPage />
              </RoleLayoutWrapper>
            }
          />

          <Route path="/error" element={<Error />} />
        </Routes>
      </SignupProvider>
    </WebSocketProvider>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
