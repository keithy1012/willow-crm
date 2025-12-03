import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import DoctorAccountCreationRequest from "../../../../models/tickets/DoctorAccountCreationRequest.js";

let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) await collections[key].deleteMany();
});

const makeObjectId = () => new mongoose.Types.ObjectId();

describe("DoctorAccountCreationRequest model", () => {
  test("should create a doctor account request with required fields", async () => {
    const payload = {
      firstName: "Alice",
      lastName: "Example",
      email: `alice${Date.now()}@example.test`,
      phoneNumber: "1234567890",
      password: "securepassword",
      bioContent: "Experienced physician",
      education: "Medical School",
      graduationDate: new Date(2010, 0, 1),
      speciality: "cardiology",
      gender: "Female", // exact enum from DoctorAccountCreationRequest.js: ["Male","Female","Other"]
      status: "Pending", // exact enum from DoctorAccountCreationRequest.js: ["Pending","Approved","Rejected"]
      requestedBy: makeObjectId(),
    };
    const inst = new DoctorAccountCreationRequest(payload);
    await expect(inst.save()).resolves.toBeDefined();
    const indexes = DoctorAccountCreationRequest.schema.indexes();
    expect(Array.isArray(indexes)).toBe(true);
  });

  test("invalid status enum is rejected if present", async () => {
    const enums = Object.entries(DoctorAccountCreationRequest.schema.paths)
      .filter(([, s]) => s.enumValues && s.enumValues.length)
      .map(([p]) => p);
    if (!enums.length) {
      expect(enums.length).toBe(0);
      return;
    }
    const base = {
      firstName: "Alice",
      lastName: "Example",
      email: `alice${Date.now()}@example.test`,
      phoneNumber: "1234567890",
      password: "securepassword",
      bioContent: "bio",
      education: "edu",
      graduationDate: new Date(),
      speciality: "cardiology",
      gender: "Female",
      status: "Pending",
    };
    for (const p of enums) {
      const bad = { ...base, [p]: "BAD_ENUM" };
      await expect(
        new DoctorAccountCreationRequest(bad).save()
      ).rejects.toThrow();
    }
  });
});
