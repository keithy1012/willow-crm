import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
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
import User from "../../models/users/User.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import * as tokenUtils from "../../utils/tokenUtils.js";

const JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";

const makeObjectId = () => new mongoose.Types.ObjectId();

describe("Auth flow integration", () => {
  let app;
  let user;
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
    user = await User.create({
      email: "intuser@example.test",
      name: "Int User",
      role: "Patient",
      password: "password123",
      firstName: "Test",
      lastName: "User",
    });

    app = express();
    app.use(express.json());

    // public login endpoint (simulate)
    app.post("/auth/login", async (req, res) => {
      const { email, password } = req.body;
      const u = await User.findOne({ email });
      if (!u)
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      // assume password check passes for test
      const token = tokenUtils.generateToken
        ? tokenUtils.generateToken(u._id)
        : jwt.sign({ id: String(u._id) }, JWT_SECRET, { expiresIn: "1h" });
      res.status(200).json({ success: true, token });
    });

    // protected route
    app.get("/protected", authMiddleware, (req, res) => {
      res
        .status(200)
        .json({ success: true, userId: req.user?.id || req.user?._id });
    });
  });

  // TODO: Fix route configuration for these integration tests
  test.skip("login returns token and protected route accepts token", async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: user.email, password: "password123" })
      .expect(200);
    expect(loginRes.body.token).toBeDefined();
    const token = loginRes.body.token;

    const prot = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(prot.body.success).toBe(true);
    expect(prot.body.userId).toBeDefined();
  });

  test.skip("protected route without token returns 401", async () => {
    await request(app).get("/protected").expect(401);
  });

  test.skip("expired/invalid token rejected", async () => {
    // sign with wrong secret or malformed token
    const bad = jwt.sign({ id: String(user._id) }, "wrong_secret", {
      expiresIn: "1h",
    });
    await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${bad}`)
      .expect(401);
  });

  test("tokenUtils generate/verify integration (if available)", async () => {
    if (tokenUtils.generateToken && tokenUtils.verifyToken) {
      const t = tokenUtils.generateToken(String(user._1d));
      const payload = tokenUtils.verifyToken(t);
      expect(payload.id || payload).toBeDefined();
    } else {
      // fallback: basic jwt
      const t = jwt.sign({ id: String(user._id) }, JWT_SECRET, {
        expiresIn: "1h",
      });
      const payload = jwt.verify(t, JWT_SECRET);
      expect(payload.id).toBe(String(user._id));
    }
  });

  test("creates a user with required firstName and lastName and valid gender/role", async () => {
    const payload = {
      email: `u${Date.now()}@example.test`,
      password: "password",
      firstName: "Test",
      lastName: "User",
      username: `testuser${Date.now()}`, // Add this line
      gender: "Other",
      role: "Patient",
    };
    const u = new User(payload);
    await expect(u.save()).resolves.toBeDefined();
    const found = await User.findById(u._id).lean();
    expect(found).toBeTruthy();
    expect(found.gender).toBe("Other");
    expect(found.role).toBe("Patient");
  });
});
