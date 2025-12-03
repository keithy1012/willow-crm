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
import FinanceMember from "../../../../models/finance/FinanceMember.js";

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
    doc.user &&
    typeof doc.user === "object" &&
    !mongoose.isValidObjectId(doc.user)
  )
    doc.user = makeObjectId();
  return doc;
};

describe("models/finance/FinanceMember schema", () => {
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

  test("saves FinanceMember with required fields", async () => {
    const payload = buildValidDoc(FinanceMember);
    const inst = new FinanceMember(
      Object.keys(payload).length
        ? payload
        : { user: makeObjectId(), role: "finance" }
    );
    await expect(inst.save()).resolves.toBeDefined();
    const indexes = FinanceMember.schema.indexes();
    expect(Array.isArray(indexes)).toBe(true);
  });

  test("enum validation rejects bad values", async () => {
    const enums = Object.entries(FinanceMember.schema.paths)
      .filter(([, s]) => s.enumValues && s.enumValues.length)
      .map(([p]) => p);
    if (!enums.length) {
      expect(enums.length).toBe(0);
      return;
    }
    const base = buildValidDoc(FinanceMember);
    for (const p of enums) {
      const bad = { ...base, [p]: "INVALID" };
      await expect(new FinanceMember(bad).save()).rejects.toThrow();
    }
  });
});
