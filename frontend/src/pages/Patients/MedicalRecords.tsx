import { useRequireRole } from "hooks/useRequireRole";

const MedicalRecords = () => {
  useRequireRole("Patient");
  return <h1>MedicalRecords</h1>;
};

export default MedicalRecords;
