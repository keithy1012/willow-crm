// File: backend/tests/unit/models/appointments/Appointment.test.js
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
import Appointment from "../../../../models/appointments/Appointment.js";

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

describe("models/appointments/Appointment model schema", () => {
  test("saves Appointment with required fields from schema", async () => {
    const payload = {
      scheduledAt: new Date(),
      patientID: makeObjectId(),
      doctorID: makeObjectId(),
      status: "Scheduled", // exact enum from Appointment.js
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
    };
    const inst = new Appointment(payload);
    await expect(inst.save()).resolves.toBeDefined();
    const found = await Appointment.findById(inst._id).lean();
    expect(found).toBeTruthy();
    const indexes = Appointment.schema.indexes();
    expect(Array.isArray(indexes)).toBe(true);
  });

  test("enum validation enforces allowed values (if present)", async () => {
    const enumPaths = Object.entries(Appointment.schema.paths)
      .filter(([p, s]) => s.enumValues && s.enumValues.length > 0)
      .map(([p]) => p);
    if (enumPaths.length === 0) {
      expect(enumPaths.length).toBe(0);
      return;
    }
    const base = {
      scheduledAt: new Date(),
      patientID: makeObjectId(),
      doctorID: makeObjectId(),
      status: "Scheduled",
    };
    for (const ep of enumPaths) {
      const doc = { ...base, [ep]: "INVALID_ENUM" };
      await expect(new Appointment(doc).save()).rejects.toThrow();
    }
  });
});
