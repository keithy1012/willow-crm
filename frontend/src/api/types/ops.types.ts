import { User } from "./user.types";

export interface OpsMember {
  _id: string;
  user: string | User;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOpsMemberData {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  gender?: string;
  password: string;
  phoneNumber?: string;
  profilePic?: string;
}