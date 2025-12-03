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
import Patient from "../../../../models/patients/Patient.js";

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
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

const makeObjectId = () => new mongoose.Types.ObjectId();

describe("models/patients/Patient schema", () => {
  test("saves Patient with required fields discovered from schema", async () => {
    const payload = {
      name: "Test Patient",
      email: `p${Date.now()}@example.test`,
      user: makeObjectId(),
      bloodtype: "A+", // exact enum from Patient.js
      address: "123 Main St, Testville, TS 12345", // added required field
      birthday: new Date("1990-01-01"), // added required field
    };
    const inst = new Patient(payload);
    await expect(inst.save()).resolves.toBeDefined();
    const found = await Patient.findById(inst._id).lean();
    expect(found).toBeTruthy();
    const indexes = Patient.schema.indexes();
    expect(Array.isArray(indexes)).toBe(true);
  });

  test("enum validation for Patient fields rejects invalid values", async () => {
    const enumPaths = Object.entries(Patient.schema.paths)
      .filter(([, s]) => s.enumValues && s.enumValues.length)
      .map(([p]) => p);
    if (!enumPaths.length) {
      expect(enumPaths.length).toBe(0);
      return;
    }
    const base = {
      name: "Test Patient",
      email: `p${Date.now()}@example.test`,
      user: makeObjectId(),
      bloodtype: "A+",
      address: "123 Main St, Testville, TS 12345",
      birthday: new Date("1990-01-01"),
    };
    for (const p of enumPaths) {
      const bad = { ...base, [p]: "BAD_ENUM" };
      await expect(new Patient(bad).save()).rejects.toThrow();
    }
  });
});
