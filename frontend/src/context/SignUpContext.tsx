import React, { createContext, useContext, useState } from "react";

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex: string;
  username: string;
  password: string;
  confirmPassword: string;
  birthdate: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  contact_name: string;
  contact_relationship: string;
  contact_phone: string;
  bloodType: string;
  allergies: string[];
  medicalHistory: string[];
  bioContent: string;
  education: string;
  graduationDate: string;
  speciality: string;
  insuranceCardFront: File | null;
  insuranceCardBack: File | null;
}

interface SignupContextValue {
  signupData: SignupData;
  setSignupData: (data: Partial<SignupData>) => void;
}

const SignupContext = createContext<SignupContextValue | undefined>(undefined);

export const SignupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [signupData, setSignupDataState] = useState<SignupData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    sex: "",
    username: "",
    password: "",
    confirmPassword: "",
    birthdate: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    contact_name: "",
    contact_relationship: "",
    contact_phone: "",
    bloodType: "",
    allergies: [],
    medicalHistory: [],
    bioContent: "",
    education: "",
    graduationDate: "",
    speciality: "",
    insuranceCardFront: null,
    insuranceCardBack: null,
  });

  const setSignupData = (data: Partial<SignupData>) => {
    setSignupDataState((prev) => ({ ...prev, ...data }));
  };

  return (
    <SignupContext.Provider value={{ signupData, setSignupData }}>
      {children}
    </SignupContext.Provider>
  );
};

export const useSignup = () => {
  const context = useContext(SignupContext);
  if (!context) throw new Error("useSignup must be used inside SignupProvider");
  return context;
};