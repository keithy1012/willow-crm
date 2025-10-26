import React from "react";
import Field from "../components/input/Field.tsx";
import Button from "../components/buttons/BookingButton.tsx"; 

const TopRightBlob = "/onboarding_blob_top_right.svg";
const BottomLeftBlob = "/onboarding_blob_bottom_left.svg";

const SignUp1: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen bg-white flex flex-col items-start p-8 overflow-hidden">
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

      {/* Willow Logo / Title */}
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 z-10 absolute top-8 left-8">
        Willow CRM
      </h1>

      {/* Main Form Content */}
      <div className="z-10 w-full max-w-lg mx-auto mt-32 flex flex-col gap-6">
        <p className="text-xl md:text-2xl font-semibold text-gray-700">Welcome! Please fill in your details:</p>

        {/* First Name */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">First Name</label>
          <Field placeholder="John Doe" />
        </div>

        {/* Last Name */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Last Name</label>
          <Field placeholder="John Doe" />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Email</label>
          <Field placeholder="John Doe" />
        </div>

        {/* Next Button */}
        <div className="mt-6 w-full">
          <Button>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default SignUp1;
