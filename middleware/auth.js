// middleware/auth.js
import jwt from "jsonwebtoken";
import Company from "../models/company.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ success: false, message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const company = await Company.findById(payload._id).select("-password -refreshTokenHash");
    if (!company) return res.status(401).json({ success: false, message: "Unauthorized" });

    req.company = company; // attach company object to req
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
