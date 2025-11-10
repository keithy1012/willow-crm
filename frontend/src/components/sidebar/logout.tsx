import { useEffect } from "react";

const Logout: React.FC = () => {
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }, []);

  return <div>Logging out...</div>;
};

export default Logout;
