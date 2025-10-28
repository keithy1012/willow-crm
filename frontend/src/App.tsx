import React from "react";
import "./App.css";
import PatientSidebar from "./components/sidebar/PatientSidebar.tsx";
import PrimaryButton from "./components/buttons/PrimaryButton.tsx";
import MedicationCard from "./components/card/MedicationCard.tsx";
import UpcomingAppointmentCard from "./components/card/UpcomingAppointmentCard.tsx";
import LongTextArea from "./components/input/LongTextArea.tsx";
import SearchBar from "./components/input/SearchBar.tsx";
import Dashboard from "./Patients/Dashboard.tsx";

import { SignupProvider } from "./context/SignUpContext.tsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Onboarding/Landing.tsx";
import SignUp1 from "./Onboarding/SignUp1.tsx"; 
import SignUp2 from "./Onboarding/SignUp2.tsx"; 
import SignUp3 from "./Onboarding/SignUp3.tsx";
import RollSelection from "./Onboarding/RollSelection.tsx";
import PatientOnboarding1 from "./Onboarding/Patient/PatientOnboarding1.tsx";
import PatientOnboarding2 from "./Onboarding/Patient/PatientOnboarding2.tsx";
import PatientOnboarding3 from "./Onboarding/Patient/PatientOnboarding3.tsx";
import StaffOnboarding from "./Onboarding/Staff/StaffOnboarding.tsx";
import DoctorOnboarding from "./Onboarding/Staff/DoctorOnboarding.tsx";
function App() {
  return (
    <SignupProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup1" element={<SignUp1 />} />
          <Route path="/signup2" element={<SignUp2 />} />
          <Route path="/signup3" element={<SignUp3 />} />
          <Route path="/roleselection" element={<RollSelection />} />
          <Route path="/patientonboarding1" element={<PatientOnboarding1 />} />
          <Route path="/patientonboarding2" element={<PatientOnboarding2 />} />
          <Route path="/patientonboarding3" element={<PatientOnboarding3 />} />
          <Route path="/patientdashboard" element={<Dashboard />} />
          <Route path="/staffonboarding" element={<StaffOnboarding />} />
          <Route path="/doctoronboarding" element={<DoctorOnboarding />} />
        </Routes>
      </Router>
    </SignupProvider>
  );
}

export default App;
