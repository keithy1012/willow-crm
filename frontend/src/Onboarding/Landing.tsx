import React from "react";
import { useNavigate } from "react-router-dom";
const TopRightBlob = "/onboarding_blob_top_right.svg";
const BottomLeftBlob = "/onboarding_blob_bottom_left.svg";

const LandingPage: React.FC = () => {
const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup1"); // Redirect to signup1.tsx page
  };
  return (
    <div className="relative w-full h-screen bg-white flex flex-col items-center justify-center overflow-hidden">
      {/* Top-right SVG */}
      <img
        src={TopRightBlob}
        alt="Top Right Blob"
        className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96"
      />

      {/* Bottom-left SVG */}
      <img
        src={BottomLeftBlob}
        alt="Bottom Left Blob"
        className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96"
      />

      {/* Main content */}
      <h1 className="text-6xl md:text-8xl font-bold text-gray-900 z-10">Willow CRM</h1>
      <p className="mt-4 text-2xl md:text-3xl text-gray-600 z-10">
        Modernize Healthcare
      </p>
      <button 
        onClick={handleGetStarted}
      className="mt-8 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 z-10">
        Get Started
      </button>
    </div>
  );
};

export default LandingPage;