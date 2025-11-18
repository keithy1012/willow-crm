export interface Patient {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    profilePic?: string;
  };
  address: string;
  bloodtype: string;
  birthday: string;
  allergies: string[];
  medicalHistory: string[];
  emergencyContact?: { phoneNumber: string }[];
}
