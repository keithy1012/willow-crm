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
import MedOrder from "../../../../models/medications/MedOrder.js";
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
describe("models/medications/MedOrder schema", () => {
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
  test("saves MedOrder with required fields", async () => {
    const inst = new MedOrder({
      patientID: new mongoose.Types.ObjectId(),
      doctorID: new mongoose.Types.ObjectId(),
      prescribedOn: new Date(),
      medicationName: "TestMed",
      instruction: "Take once daily",
    });

    await expect(inst.save()).resolves.toBeDefined();
  });

  test("enum validation rejects invalid values", async () => {
    const enums = Object.entries(MedOrder.schema.paths)
      .filter(([, s]) => s.enumValues && s.enumValues.length)
      .map(([p]) => p);
    if (!enums.length) {
      expect(enums.length).toBe(0);
      return;
    }
    const base = buildValidDoc(MedOrder);
    for (const p of enums) {
      const bad = JSON.parse(JSON.stringify(base));
      setDeep(bad, p.split("."), "BAD_ENUM");
      await expect(new MedOrder(bad).save()).rejects.toThrow();
    }
  });
});
