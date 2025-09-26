import React from "react";
import "./App.css";
import PatientSidebar from "./components/sidebar/PatientSidebar.tsx";
import PrimaryButton from "./components/buttons/PrimaryButton.tsx";
import MedicationCard from "./components/card/MedicationCard.tsx";
import UpcomingAppointmentCard from "./components/card/UpcomingAppointmentCard.tsx";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <PatientSidebar></PatientSidebar>
        <PrimaryButton
          text={"Hello"}
          variant={"primary"}
          size={"small"}
        ></PrimaryButton>
        <MedicationCard
          medication={"Medication"}
          description={
            "This is my description hello this is more details on my medication yay! "
          }
        ></MedicationCard>
        <UpcomingAppointmentCard date={"September 13th, 2025"} doctorName={"Lok Ye Young"} appointmentType={"Surgery"}></UpcomingAppointmentCard>
      </header>
    </div>
  );
}

export default App;
