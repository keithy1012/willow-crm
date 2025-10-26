import React, { createContext, useContext, useState } from "react";

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex: string;
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
    sex: ""
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
