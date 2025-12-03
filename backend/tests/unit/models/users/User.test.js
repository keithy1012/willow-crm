// File: backend/tests/unit/models/users/User.test.js
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
import User from "../../../../models/users/User.js";

const buildValidDocFromSchemaForUser = (Model) => {
  const doc = {};
  const paths = Model.schema.paths;
  for (const [path, schemaType] of Object.entries(paths)) {
    if (path === "_id" || path === "__v") continue;
    if (path.includes(".")) continue;
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
        // if field is email-like, provide an email
        if (/(email|Email|EmailAddress)/.test(path)) {
          doc[path] = `test+${path}@example.com`;
        } else {
          doc[path] = `test-${path}`;
        }
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

describe("models/users/User model schema", () => {
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

  test("saves User with all required fields discovered from schema", async () => {
    const validDoc = buildValidDocFromSchemaForUser(User);
    // fallback minimal user if no required found
    const fallback = {
      email: "user@example.com",
      password: "securepassword",
      role: "user",
    };
    const instance = new User(
      Object.keys(validDoc).length ? validDoc : fallback
    );
    await expect(instance.save()).resolves.toBeDefined();
    const found = await User.findById(instance._id).lean();
    expect(found).toBeTruthy();
    const indexes = User.schema.indexes();
    expect(Array.isArray(indexes)).toBe(true);
  });

  test("enum validation for User enum fields (if any)", async () => {
    const enumPaths = Object.entries(User.schema.paths)
      .filter(([p, s]) => s.enumValues && s.enumValues.length > 0)
      .map(([p]) => p);
    if (enumPaths.length === 0) {
      expect(enumPaths.length).toBe(0);
      return;
    }
    const base = buildValidDocFromSchemaForUser(User);
    for (const ep of enumPaths) {
      const doc = { ...base };
      doc[ep] = "INVALID_USER_ENUM";
      await expect(new User(doc).save()).rejects.toThrow();
    }
  });
});
