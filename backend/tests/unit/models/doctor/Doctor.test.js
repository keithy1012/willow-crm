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
import Doctor from "../../../../models/doctors/Doctor.js";

const makeObjectId = () => new mongoose.Types.ObjectId();

const buildValidDoc = (Model) => {
  const doc = {};
  for (const [path, schemaType] of Object.entries(Model.schema.paths)) {
    if (path === "_id" || path === "__v") continue;
    const opts = schemaType.options || {};
    if (
      !Boolean(opts.required) &&
      !(Array.isArray(opts.required) && opts.required.length)
    )
      continue;
    if (schemaType.instance === "ObjectID") doc[path] = makeObjectId();
    else if (schemaType.instance === "String") doc[path] = `test-${path}`;
    else if (schemaType.instance === "Date") {
      // Provide a valid Date for date fields; use a specific date for graduationDate
      doc[path] =
        path === "graduationDate" ? new Date("2020-05-15") : new Date();
    } else doc[path] = {};
  }
  // Common ref field 'user'
  if (
    doc.user &&
    typeof doc.user === "object" &&
    !mongoose.isValidObjectId(doc.user)
  )
    doc.user = makeObjectId();
  return doc;
};

describe("models/doctor/Doctor schema", () => {
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

  test("saves Doctor with required schema fields", async () => {
    const payload = buildValidDoc(Doctor);
    const inst = new Doctor(
      Object.keys(payload).length ? payload : { user: makeObjectId() }
    );
    await expect(inst.save()).resolves.toBeDefined();
    const indexes = Doctor.schema.indexes();
    expect(Array.isArray(indexes)).toBe(true);
  });

  test("rejects invalid enum values", async () => {
    const enums = Object.entries(Doctor.schema.paths)
      .filter(([, s]) => s.enumValues && s.enumValues.length)
      .map(([p]) => p);
    if (!enums.length) {
      expect(enums.length).toBe(0);
      return;
    }
    const base = buildValidDoc(Doctor);
    for (const p of enums) {
      const bad = { ...base, [p]: "INVALID_ENUM" };
      await expect(new Doctor(bad).save()).rejects.toThrow();
    }
  });
});
