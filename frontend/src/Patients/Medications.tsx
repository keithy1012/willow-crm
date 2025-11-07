import { useRequireRole } from "hooks/useRequireRole";

const Medications = () => {
  useRequireRole("Patient");
  return <h1>Medications</h1>;
};

export default Medications;
