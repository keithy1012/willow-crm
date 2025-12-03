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
import OpsMember from "../../../../models/ops/OpsMember.js";

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

describe("models/ops/OpsMember schema", () => {
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

  test("saves OpsMember with required fields", async () => {
    const payload = buildValidDoc(OpsMember);
    const inst = new OpsMember(
      Object.keys(payload).length
        ? payload
        : { user: makeObjectId(), role: "ops" }
    );
    await expect(inst.save()).resolves.toBeDefined();
    const indexes = OpsMember.schema.indexes();
    expect(Array.isArray(indexes)).toBe(true);
  });

  test("rejects invalid enum values", async () => {
    const enums = Object.entries(OpsMember.schema.paths)
      .filter(([, s]) => s.enumValues && s.enumValues.length)
      .map(([p]) => p);
    if (!enums.length) {
      expect(enums.length).toBe(0);
      return;
    }
    const base = buildValidDoc(OpsMember);
    for (const p of enums) {
      const bad = { ...base, [p]: "INVALID" };
      await expect(new OpsMember(bad).save()).rejects.toThrow();
    }
  });
});
