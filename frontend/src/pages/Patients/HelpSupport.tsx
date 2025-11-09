import { useRequireRole } from "hooks/useRequireRole";

const HelpSupportPage = () => {
  useRequireRole("Patient");
  return <h1>HelpSupportPage</h1>;
};

export default HelpSupportPage;
