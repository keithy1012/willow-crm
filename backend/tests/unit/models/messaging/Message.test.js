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
import Message from "../../../../models/messaging/Message.js";

const makeObjectId = () => new mongoose.Types.ObjectId();

const buildValidDoc = (Model) => {
  const doc = {};
  const paths = Model.schema.paths;
  for (const [path, schemaType] of Object.entries(paths)) {
    if (path === "_id" || path === "__v") continue;
    const opts = schemaType.options || {};
    const required =
      Boolean(opts.required) ||
      (Array.isArray(opts.required) && opts.required.length);
    if (!required) continue;
    if (schemaType.enumValues && schemaType.enumValues.length) {
      doc[path] = schemaType.enumValues[0];
      continue;
    }
    switch (schemaType.instance) {
      case "ObjectID":
        doc[path] = makeObjectId();
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
        doc[path] = [];
        break;
      default:
        doc[path] = {};
    }
  }
  // Ensure common ObjectId ref names are proper ObjectIds
  if (
    doc.conversation &&
    typeof doc.conversation === "object" &&
    !mongoose.isValidObjectId(doc.conversation)
  )
    doc.conversation = makeObjectId();
  if (
    doc.sender &&
    typeof doc.sender === "object" &&
    !mongoose.isValidObjectId(doc.sender)
  )
    doc.sender = makeObjectId();
  return doc;
};

describe("models/messaging/Message model schema", () => {
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

  test("reads required fields from schema and saves a valid Message", async () => {
    const validDoc = buildValidDoc(Message);
    const payload = Object.keys(validDoc).length
      ? validDoc
      : {
          content: "test",
          conversation: makeObjectId(),
          sender: makeObjectId(),
        };
    const m = new Message(payload);
    await expect(m.save()).resolves.toBeDefined();
    const found = await Message.findById(m._id).lean();
    expect(found).toBeTruthy();
    const indexes = Message.schema.indexes();
    expect(Array.isArray(indexes)).toBe(true);
  });

  test("enum fields enforce allowed values", async () => {
    const enumPaths = Object.entries(Message.schema.paths)
      .filter(([_, s]) => s.enumValues && s.enumValues.length)
      .map(([p]) => p);
    if (enumPaths.length === 0) {
      expect(enumPaths.length).toBe(0);
      return;
    }
    const base = buildValidDoc(Message);
    for (const ep of enumPaths) {
      const doc = { ...base, [ep]: "INVALID_ENUM_VALUE" };
      const inst = new Message(doc);
      await expect(inst.save()).rejects.toThrow();
    }
  });
});
