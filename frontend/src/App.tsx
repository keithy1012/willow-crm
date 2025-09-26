import React from "react";
import "./App.css";
import PatientSidebar from "./components/sidebar/PatientSidebar.tsx";
import PrimaryButton from "./components/buttons/PrimaryButton.tsx";
import MedicationCard from './components/card/MedicationCard.tsx';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <PatientSidebar></PatientSidebar>
        <PrimaryButton text={"Hello"} variant={"primary"} size={"small"}></PrimaryButton>
        <MedicationCard medication={"Medication"} description={"This is my description hello this is more details on my medication yay! "}>
          
        </MedicationCard>
      </header>
    </div>
  );
}

export default App;
