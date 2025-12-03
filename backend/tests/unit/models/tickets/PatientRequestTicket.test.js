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
import PatientRequestTicket from "../../../../models/tickets/PatientRequestTicket.js";

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
    else doc[path] = {};
  }
  if (
    doc.requestedBy &&
    typeof doc.requestedBy === "object" &&
    !mongoose.isValidObjectId(doc.requestedBy)
  )
    doc.requestedBy = makeObjectId();
  return doc;
};

describe("models/tickets/PatientRequestTicket schema", () => {
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

  test("saves PatientRequestTicket with required fields", async () => {
    const validDoc = buildValidDoc(PatientRequestTicket);
    const fallback = {
      patient: makeObjectId(),
      requestType: "record_update",
      requestedBy: makeObjectId(),
    };
    const inst = new PatientRequestTicket(
      Object.keys(validDoc).length ? validDoc : fallback
    );
    await expect(inst.save()).resolves.toBeDefined();
    const indexes = PatientRequestTicket.schema.indexes();
    expect(Array.isArray(indexes)).toBe(true);
  });

  test("enum fields validation rejects invalid values", async () => {
    const enums = Object.entries(PatientRequestTicket.schema.paths)
      .filter(([, s]) => s.enumValues && s.enumValues.length)
      .map(([p]) => p);
    if (!enums.length) {
      expect(enums.length).toBe(0);
      return;
    }
    const base = buildValidDoc(PatientRequestTicket);
    for (const p of enums) {
      const bad = { ...base, [p]: "BAD_ENUM" };
      await expect(new PatientRequestTicket(bad).save()).rejects.toThrow();
    }
  });
});
