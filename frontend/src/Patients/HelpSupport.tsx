import { useRequireRole } from "hooks/useRequireRole";
import { use } from "react";

const HelpSupportPage = () => <h1>HelpSupportPage</h1>;
useRequireRole("Patient");
export default HelpSupportPage;
