// ErrorPage.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface ErrorState {
  code?: number;
  message?: string;
}

const ErrorPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ErrorState;
  
  const [errorCode, setErrorCode] = useState<number>(500);
  const [errorMessage, setErrorMessage] = useState<string>("An unexpected error occurred.");

  useEffect(() => {
    if (state?.code) setErrorCode(state.code);
    if (state?.message) setErrorMessage(state.message);
  }, [state]);

  const getErrorTitle = (code: number): string => {
    switch (code) {
      case 400:
        return "Bad Request";
      case 401:
        return "Unauthorized";
      case 403:
        return "Forbidden";
      case 404:
        return "Not Found";
      case 500:
        return "Internal Server Error";
      default:
        return "Error";
    }
  };

  const getErrorIcon = (code: number): string => {
    switch (code) {
      case 403:
        return "🔒";
      case 404:
        return "🔍";
      case 500:
        return "⚙️";
      default:
        return "⚠️";
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

      {/* Content */}
      <div className="flex-1 flex justify-center items-center p-8 overflow-hidden">
        <div className="bg-foreground border border-gray-200 rounded-xl shadow-sm p-12 max-w-2xl w-full">
          {/* Error Icon */}
          <div className="text-center mb-6">
            <span className="text-7xl">{getErrorIcon(errorCode)}</span>
          </div>

          {/* Error Code */}
          <div className="text-center mb-4">
            <h1 className="text-8xl font-bold text-red-600 mb-2">{errorCode}</h1>
            <h2 className="text-2xl font-semibold text-primaryText mb-3">
              {getErrorTitle(errorCode)}
            </h2>
          </div>

          {/* Error Message */}
          <div className="text-center mb-8">
            <p className="text-gray-600 text-lg leading-relaxed">
              {errorMessage}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleGoBack}
              className="px-6 py-3 bg-primary hover:bg-[#6886AC] text-white font-medium rounded-lg transition-colors duration-200"
            >
              Go Back
            </button>
          </div>

          {/* Additional Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              If you believe this is a mistake, please contact support or try again later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;