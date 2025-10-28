// middleware/authMiddleware.js - Role-based authorization

export const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated (should be attached by authenticate middleware)
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Check if user has required role
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: "Forbidden: insufficient permissions",
          required: roles,
          current: req.user.role
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({ error: "Authorization error" });
    }
  };
};
