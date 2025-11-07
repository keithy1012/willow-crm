import { useRequireRole } from "hooks/useRequireRole";

const MedicalRecords = () => <h1>MedicalRecords</h1>;
useRequireRole("Patient");
export default MedicalRecords;
