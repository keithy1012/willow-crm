import { useEffect } from "react";
import { useAuth } from "contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate("/login", { replace: true });
  }, []);
  console.log("Token after logout:", localStorage.getItem("token"));

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>{" "}
        <p className="text-gray-500">Logging out...</p>{" "}
      </div>
    </div>
  );
};

export default Logout;
