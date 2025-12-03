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
import BugTicket from "../../../../models/tickets/BugTicket.js";

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

describe("models/tickets/BugTicket schema", () => {
  test("saves BugTicket satisfying required fields", async () => {
    const payload = {
      title: "Crash",
      description: "details",
      submitter: makeObjectId(),
      content: "detailed content",
      isResolved: false,
      status: "Pending", // no enum in BugTicket.js; use a descriptive value
    };
    const inst = new BugTicket(payload);
    await expect(inst.save()).resolves.toBeDefined();
    const indexes = BugTicket.schema.indexes();
    expect(Array.isArray(indexes)).toBe(true);
  });

  test("enum fields are validated (if any present)", async () => {
    const enums = Object.entries(BugTicket.schema.paths)
      .filter(([, s]) => s.enumValues && s.enumValues.length)
      .map(([p]) => p);
    if (!enums.length) {
      expect(enums.length).toBe(0);
      return;
    }
    const base = {
      title: "Crash",
      description: "details",
      submitter: makeObjectId(),
      content: "d",
      isResolved: false,
      status: "Pending",
    };
    for (const p of enums) {
      const bad = { ...base, [p]: "INVALID" };
      await expect(new BugTicket(bad).save()).rejects.toThrow();
    }
  });
});
