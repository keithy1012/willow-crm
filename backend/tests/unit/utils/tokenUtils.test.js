import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
} from "@jest/globals";
import jwt from "jsonwebtoken";

let generateResetToken;
let hashToken;

describe("Token Utils", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret-key-for-testing";
    process.env.JWT_EXPIRE = "7d";

    const tokenUtils = await import("../../../utils/tokenUtils.js");
    generateResetToken = tokenUtils.generateResetToken;
    hashToken = tokenUtils.hashToken;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateResetToken", () => {
    it("should generate raw and hash tokens", () => {
      const { raw, hash } = generateResetToken();

      expect(raw).toBeDefined();
      expect(hash).toBeDefined();
      expect(typeof raw).toBe("string");
      expect(typeof hash).toBe("string");
    });

    it("should generate 64 character raw token", () => {
      const { raw } = generateResetToken();
      expect(raw.length).toBe(64);
    });

    it("should generate different tokens each time", () => {
      const token1 = generateResetToken();
      const token2 = generateResetToken();

      expect(token1.raw).not.toBe(token2.raw);
      expect(token1.hash).not.toBe(token2.hash);
    });

    it("should create hash that matches raw token when hashed", () => {
      const { raw, hash } = generateResetToken();
      const rehashed = hashToken(raw);

      expect(rehashed).toBe(hash);
    });
  });

  describe("hashToken", () => {
    it("should hash a token string", () => {
      const token = "my-reset-token-string";
      const hash = hashToken(token);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should produce consistent hashes for same input", () => {
      const token = "my-reset-token";
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different inputs", () => {
      const hash1 = hashToken("token1");
      const hash2 = hashToken("token2");

      expect(hash1).not.toBe(hash2);
    });

    it("should return null for invalid input", () => {
      expect(hashToken(null)).toBeNull();
      expect(hashToken(undefined)).toBeNull();
      expect(hashToken("")).toBeNull();
    });

    it("should return null for non-string input", () => {
      expect(hashToken(123)).toBeNull();
      expect(hashToken({})).toBeNull();
      expect(hashToken([])).toBeNull();
    });
  });
});
