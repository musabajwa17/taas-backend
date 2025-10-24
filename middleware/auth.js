import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const verifyToken = async (req, res, next) => {
  try {
    // ✅ Get token from headers or cookies
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1] || req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // ✅ Verify the token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // attach user to request
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
