// useRequireRole.ts
import { useEffect } from "react";
import { useErrorNavigation } from "./useErrorNavigation";

export const useRequireRole = (allowedRole: string, returnUser: boolean = false) => {
  const { forbidden } = useErrorNavigation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user || user.role !== allowedRole) {
      forbidden(`This page is only accessible to ${allowedRole} users.`);
    }
  }, [allowedRole, forbidden]);

  return returnUser ? user : undefined;
};
