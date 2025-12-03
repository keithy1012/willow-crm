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
import Invoice from "../../../../models/finance/Invoice.js";

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

describe("models/finance/Invoice schema", () => {
  test("saves Invoice built from required schema fields", async () => {
    const payload = {
      invoiceId: `inv-${Date.now()}`,
      patientName: "John Doe",
      doctorName: "Dr Smith",
      appointmentDate: new Date(),
      amount: 100,
      patient: makeObjectId(),
      items: [{ description: "consult", amount: 100 }],
      total: 100,
      status: "paid", // exact enum from Invoice.js: ["pending","sent","paid","overdue"]
    };
    const inst = new Invoice(payload);
    await expect(inst.save()).resolves.toBeDefined();
    const indexes = Invoice.schema.indexes();
    expect(Array.isArray(indexes)).toBe(true);
  });

  test("enum fields reject invalid values", async () => {
    const enums = Object.entries(Invoice.schema.paths)
      .filter(([, s]) => s.enumValues && s.enumValues.length)
      .map(([p]) => p);
    if (!enums.length) {
      expect(enums.length).toBe(0);
      return;
    }
    const base = {
      invoiceId: `inv-${Date.now()}`,
      patientName: "John Doe",
      doctorName: "Dr Smith",
      appointmentDate: new Date(),
      amount: 100,
      patient: makeObjectId(),
      total: 100,
      status: "paid",
    };
    for (const p of enums) {
      const bad = { ...base, [p]: "BAD_ENUM" };
      await expect(new Invoice(bad).save()).rejects.toThrow();
    }
  });
});
