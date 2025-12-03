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
import BillingReport from "../../../../models/finance/BillingReport.js";

const makeObjectId = () => new mongoose.Types.ObjectId();

describe("BillingReport model", () => {
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

  test("should create a billing report with entries and totals", async () => {
    // required: reportId, reportType, dateRange, generatedDate
    const payload = {
      reportId: `rep-${Date.now()}`,
      reportType: "monthly",
      dateRange: "2025-12-01 to 2025-12-31",
      generatedDate: new Date(),
      entries: [],
      total: 0,
    };
    const inst = new BillingReport(payload);
    await expect(inst.save()).resolves.toBeDefined();
    const indexes = BillingReport.schema.indexes();
    expect(Array.isArray(indexes)).toBe(true);
  });
});
