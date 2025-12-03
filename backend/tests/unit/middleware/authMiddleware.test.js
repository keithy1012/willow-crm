import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
} from "@jest/globals";

// Create mock functions
const mockUserFindById = jest.fn();
const mockJwtVerify = jest.fn();
const mockJwtSign = jest.fn();

// Mock dependencies
jest.unstable_mockModule("../../../models/users/User.js", () => ({
  default: {
    findById: mockUserFindById,
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: mockJwtVerify,
    sign: mockJwtSign,
  },
}));

let User;
let jwt;
let authenticate;
let requireRole;

describe("Auth Middleware", () => {
  beforeAll(async () => {
    User = (await import("../../../models/users/User.js")).default;
    jwt = (await import("jsonwebtoken")).default;
    const authModule = await import("../../../middleware/authMiddleware.js");
    authenticate = authModule.authenticate;
    requireRole = authModule.default; // requireRole is the default export
  });

  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret-key";
  });

  describe("requireRole", () => {
    it("should allow user with correct role", () => {
      req.user = { _id: "user123", role: "Doctor" };
      const middleware = requireRole(["Doctor", "Admin"]);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should allow user with any of the allowed roles", () => {
      req.user = { _id: "user123", role: "Admin" };
      const middleware = requireRole(["Doctor", "Admin"]);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should reject user without required role", () => {
      req.user = { _id: "user123", role: "Patient" };
      const middleware = requireRole(["Doctor", "Admin"]);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Forbidden: insufficient permissions",
          required: ["Doctor", "Admin"],
          current: "Patient",
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should reject unauthenticated user", () => {
      req.user = null;
      const middleware = requireRole(["Doctor"]);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Not authenticated" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully", () => {
      req.user = { role: "Patient" };
      const middleware = requireRole(["Doctor"]);

      // Should catch and handle the error in the role check, not next()
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
