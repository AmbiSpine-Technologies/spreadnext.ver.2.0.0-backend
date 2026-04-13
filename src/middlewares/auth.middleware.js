import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is not configured in environment variables");
      return res.status(500).json({ 
        message: "Server configuration error - JWT secret not set" 
      });
    }

    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find user by ID
    let user = await User.findById(decoded.id).select("-password");
    // If user not found, log detailed error for debugging
    if (!user) {
      console.error("❌ AUTH ERROR: User not found in database", {
        decodedId: decoded.id,
        decodedIdType: typeof decoded.id,
        tokenIssuedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : "N/A",
        tokenExpiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : "N/A",
        requestPath: req.path,
        requestMethod: req.method,
      });
      
      // Check if any users exist in database (for debugging)
      const userCount = await User.countDocuments();
      console.error("📊 Database stats:", { totalUsers: userCount });
      
      return res.status(401).json({ 
        success: false,
        message: "Invalid user - User account not found. Please login again.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    
    // Provide more specific error messages
    if (error.name === "JsonWebTokenError") {
      if (error.message === "invalid signature") {
        console.error("⚠️ Token signature invalid - This usually means:");
        console.error("   1. Token was created with a different JWT_SECRET");
        console.error("   2. JWT_SECRET was changed after token was created");
        console.error("   3. Server needs to be restarted after .env changes");
        console.error("   Solution: Log out and log in again to get a new token");
      }
      return res.status(401).json({ 
        message: "Invalid token - Please log in again" 
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Token expired - Please log in again" 
      });
    }

    res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
  }
};
