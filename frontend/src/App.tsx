import React from "react";
import "./App.css";
import PatientSidebar from "./components/sidebar/PatientSidebar.tsx";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <PatientSidebar></PatientSidebar>
      </header>
    </div>
  );
}

export default App;
