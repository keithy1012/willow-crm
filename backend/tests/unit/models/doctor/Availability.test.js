import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  describe,
  beforeAll,
  afterAll,
  beforeEach,
  test,
  expect,
} from "@jest/globals";
import Availability from "../../../../models/doctors/Availability.js";

const makeObjectId = () => new mongoose.Types.ObjectId();

describe("models/doctor/Availability schema", () => {
  let mongo;
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: "test" });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  test("saves Availability with required fields from schema", async () => {
    const payload = {
      doctor: makeObjectId(),
      date: new Date("2025-12-03"),
      type: "Single",
      timeSlots: [
        {
          startTime: new Date("2025-12-03T09:00:00"),
          endTime: new Date("2025-12-03T10:00:00"),
          status: "available",
        },
      ],
    };
    const inst = new Availability(payload);
    await expect(inst.save()).resolves.toBeDefined();
    const indexes = Availability.schema.indexes();
    expect(Array.isArray(indexes)).toBe(true);
  });
});
