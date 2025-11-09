// useErrorNavigation.ts
import { useNavigate } from "react-router-dom";

export const useErrorNavigation = () => {
  const navigate = useNavigate();

  const navigateToError = (code: number, message: string) => {
    navigate("/error", {
      state: { code, message },
    });
  };

  // 400 - Bad Request
  const badRequest = (message: string = "The request could not be understood by the server.") => {
    navigateToError(400, message);
  };

  // 401 - Unauthorized
  const unauthorized = (message: string = "You must be logged in to access this resource.") => {
    navigateToError(401, message);
  };

  // 403 - Forbidden
  const forbidden = (message: string = "You don't have the required permissions to view this page.") => {
    navigateToError(403, message);
  };

  // 404 - Not Found
  const notFound = (message: string = "The page you're looking for doesn't exist.") => {
    navigateToError(404, message);
  };

  // 500 - Internal Server Error
  const serverError = (message: string = "An unexpected server error occurred. Please try again later.") => {
    navigateToError(500, message);
  };

  // Generic error handler
  const error = (code: number, message?: string) => {
    const defaultMessages: Record<number, string> = {
      400: "The request could not be understood by the server.",
      401: "You must be logged in to access this resource.",
      403: "You don't have the required permissions to view this page.",
      404: "The page you're looking for doesn't exist.",
      500: "An unexpected server error occurred. Please try again later.",
    };

    navigateToError(code, message || defaultMessages[code] || "An error occurred.");
  };

  return {
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    serverError,
    error,
  };
};

export const useBadRequest = () => {
  const { badRequest } = useErrorNavigation();
  return badRequest;
};

export const useUnauthorized = () => {
  const { unauthorized } = useErrorNavigation();
  return unauthorized;
};

export const useForbidden = () => {
  const { forbidden } = useErrorNavigation();
  return forbidden;
};

export const useNotFound = () => {
  const { notFound } = useErrorNavigation();
  return notFound;
};

export const useServerError = () => {
  const { serverError } = useErrorNavigation();
  return serverError;
};