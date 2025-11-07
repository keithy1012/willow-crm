import { useRequireRole } from "hooks/useRequireRole";

const Medications = () => <h1>Medications</h1>;
useRequireRole("Patient");
export default Medications;
