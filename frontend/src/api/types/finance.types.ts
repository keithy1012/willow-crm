import { User } from "./user.types";

export interface FinanceMember {
  _id: string;
  user: string | User;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFinanceMemberData {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  gender?: string;
  password: string;
  phoneNumber?: string;
  profilePic?: string;
}