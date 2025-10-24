// // middleware/middleware.js

// export const requireRole = (roles) => {
//   return (req, res, next) => {
//     try {
//       if (!req.user) {
//         return res.status(401).json({ error: "Not authenticated" });
//       }

//       if (!roles.includes(req.user.role)) {
//         return res.status(403).json({ error: "Forbidden: insufficient role" });
//       }

//       next();
//     } catch (err) {
//       return res.status(500).json({ error: "Server error" });
//     }
//   };
// };

// middleware/middleware.js

export const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      // TEMPORARY: Mock an Ops user for testing
      req.user = {
        _id: '68ec5dc17746cc4f562ca128',  // The Ops user ID you created
        role: 'Ops',
        email: 'john.smith@willow.com'
      };
      console.log('🔧 Using mock Ops user for testing');
      next();
      return;  // Skip the rest of the auth check
      
      // Original code below (skipped for now)
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden: insufficient role" });
      }

      next();
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  };
};
