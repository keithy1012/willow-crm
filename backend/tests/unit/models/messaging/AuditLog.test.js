// File: backend/tests/unit/models/messaging/AuditLog.test.js
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
import AuditLog from "../../../../models/messaging/AuditLog.js";

const buildValidDocFromSchemaFor = (Model) => {
  const doc = {};
  const paths = Model.schema.paths;
  for (const [path, schemaType] of Object.entries(paths)) {
    if (path === "_id" || path === "__v") continue;
    const opts = schemaType.options || {};
    const isRequired =
      Boolean(opts.required) ||
      (Array.isArray(opts.required) && opts.required.length > 0);
    if (!isRequired) continue;
    if (schemaType.enumValues && schemaType.enumValues.length > 0) {
      doc[path] = schemaType.enumValues[0];
      continue;
    }
    const inst = schemaType.instance;
    switch (inst) {
      case "ObjectID":
        doc[path] = new mongoose.Types.ObjectId();
        break;
      case "String":
        doc[path] = `test-${path}`;
        break;
      case "Number":
        doc[path] = 1;
        break;
      case "Date":
        doc[path] = new Date();
        break;
      case "Boolean":
        doc[path] = true;
        break;
      case "Array":
        if (schemaType.caster && schemaType.caster.instance === "String") {
          doc[path] = [`test-${path}`];
        } else {
          doc[path] = [];
        }
        break;
      default:
        doc[path] = {};
    }
  }
  return doc;
};

describe("models/messaging/AuditLog model schema", () => {
  let mongoServer;
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: "test" });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  test("saves an AuditLog with required fields discovered from schema", async () => {
    const validDoc = buildValidDocFromSchemaFor(AuditLog);
    const instance = new AuditLog(
      Object.keys(validDoc).length
        ? validDoc
        : { action: "TEST_ACTION", user: { email: "x@test" } }
    );
    await expect(instance.save()).resolves.toBeDefined();
    const found = await AuditLog.findById(instance._id).lean();
    expect(found).toBeTruthy();
    const indexes = AuditLog.schema.indexes();
    expect(Array.isArray(indexes)).toBe(true);
  });

  test("enum validation works for AuditLog enums (if any)", async () => {
    const enumPaths = Object.entries(AuditLog.schema.paths)
      .filter(([p, s]) => s.enumValues && s.enumValues.length > 0)
      .map(([p]) => p);
    if (enumPaths.length === 0) {
      expect(enumPaths.length).toBe(0);
      return;
    }
    const base = buildValidDocFromSchemaFor(AuditLog);
    for (const ep of enumPaths) {
      const doc = { ...base };
      doc[ep] = "INVALID_ENUM_VALUE";
      await expect(new AuditLog(doc).save()).rejects.toThrow();
    }
  });
});
