import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Company from "../models/company.js";

export const requireAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) token = authHeader.split(" ")[1];
    }

    if (!token) return res.status(401).json({ message: "No token provided" });

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user =
      payload.role === "company"
        ? await Company.findById(payload.id).select("-password -refreshTokenHash")
        : await User.findById(payload.id).select("-password -refreshToken");

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.user = user;
    req.role = payload.role;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
