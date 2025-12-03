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
import EmergencyContact from "../../../../models/patients/EmergencyContact.js";
function setDeep(obj, parts, value) {
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}
function buildValidDoc(Model) {
  const doc = {};
  for (const [path, schemaType] of Object.entries(Model.schema.paths)) {
    if (["_id", "__v"].includes(path)) continue;
    const opts = schemaType.options || {};
    const required =
      Boolean(opts.required) ||
      (Array.isArray(opts.required) && opts.required.length);
    if (!required) continue;
    const parts = path.split(".");
    let value;
    if (schemaType.enumValues && schemaType.enumValues.length)
      value = schemaType.enumValues[0];
    else {
      switch (schemaType.instance) {
        case "ObjectID":
          value = new mongoose.Types.ObjectId();
          break;
        case "String":
          value = `test-${parts.join("_")}`;
          break;
        case "Number":
          value = 1;
          break;
        case "Boolean":
          value = true;
          break;
        case "Date":
          value = new Date();
          break;
        case "Array":
          value = [];
          break;
        default:
          value = {};
      }
    }
    setDeep(doc, parts, value);
  }
  return doc;
}
describe("models/patients/EmergencyContact schema", () => {
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
  test("saves EmergencyContact with required fields", async () => {
    const payload = buildValidDoc(EmergencyContact);
    const inst = new EmergencyContact(
      Object.keys(payload).length
        ? payload
        : { name: "Contact", phone: "1234567890" }
    );
    await expect(inst.save()).resolves.toBeDefined();
    expect(Array.isArray(EmergencyContact.schema.indexes())).toBe(true);
  });
  test("enum validation rejects bad values", async () => {
    const enums = Object.entries(EmergencyContact.schema.paths)
      .filter(([, s]) => s.enumValues && s.enumValues.length)
      .map(([p]) => p);
    if (!enums.length) {
      expect(enums.length).toBe(0);
      return;
    }
    const base = buildValidDoc(EmergencyContact);
    for (const p of enums) {
      const bad = JSON.parse(JSON.stringify(base));
      setDeep(bad, p.split("."), "INVALID");
      await expect(new EmergencyContact(bad).save()).rejects.toThrow();
    }
  });
});
