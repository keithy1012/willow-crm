// useRequireRole.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useRequireRole = (allowedRole: string, returnUser: boolean = false) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user || user.role !== allowedRole) {
      navigate("/error", {
        state: { code: 403, message: "Access denied: Incorrect role." },
      });
    }
  }, [allowedRole, navigate]);

  return returnUser ? user : undefined;
};
