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
function App() {
  return (
    <SignupProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup1" element={<SignUp1 />} />
          <Route path="/signup2" element={<SignUp2 />} />
        </Routes>
      </Router>
    </SignupProvider>
  );
}

export default App;
