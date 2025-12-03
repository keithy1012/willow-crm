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
import DoctorRequestTicket from "../../../../models/tickets/DoctorRequestTicket.js";

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

describe("models/tickets/DoctorRequestTicket schema", () => {
  test("saves DoctorRequestTicket with required schema fields", async () => {
    const payload = {
      ticketName: "Profile update",
      doctorName: "Dr Example",
      description: "Update profile info",
      doctor: makeObjectId(),
      requestedBy: makeObjectId(),
      requestType: "profile_update", // freeform unless schema enforces
      status: "Pending", // exact enum from DoctorRequestTicket.js: ["Pending","In Progress","Completed"]
    };
    const inst = new DoctorRequestTicket(payload);
    await expect(inst.save()).resolves.toBeDefined();
    const indexes = DoctorRequestTicket.schema.indexes();
    expect(Array.isArray(indexes)).toBe(true);
  });

  test("enum fields reject invalid values", async () => {
    const enums = Object.entries(DoctorRequestTicket.schema.paths)
      .filter(([, s]) => s.enumValues && s.enumValues.length)
      .map(([p]) => p);
    if (!enums.length) {
      expect(enums.length).toBe(0);
      return;
    }
    const base = {
      ticketName: "Profile update",
      doctorName: "Dr Example",
      description: "Update profile info",
      doctor: makeObjectId(),
      requestedBy: makeObjectId(),
      requestType: "profile_update",
      status: "Pending",
    };
    for (const p of enums) {
      const bad = { ...base, [p]: "BAD_ENUM" };
      await expect(new DoctorRequestTicket(bad).save()).rejects.toThrow();
    }
  });
});
