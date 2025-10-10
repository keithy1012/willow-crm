import React from "react";
import "./App.css";
import PatientSidebar from "./components/sidebar/PatientSidebar.tsx";
import PrimaryButton from "./components/buttons/PrimaryButton.tsx";
import MedicationCard from "./components/card/MedicationCard.tsx";
import UpcomingAppointmentCard from "./components/card/UpcomingAppointmentCard.tsx";
import LongTextArea from "./components/input/LongTextArea.tsx";
import SearchBar from "./components/input/SearchBar.tsx";
import Dashboard from "./Patients/Dashboard.tsx";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Dashboard />
      </header>
    </div>
  );
}

export default App;
