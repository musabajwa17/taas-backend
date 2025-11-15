// middleware/companyAuth.js
import jwt from "jsonwebtoken";
import Company from "../models/company.js";

export const requireCompanyAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) token = authHeader.split(" ")[1];
    }

    if (!token)
      return res.status(401).json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded)
      return res.status(401).json({ success: false, message: "Invalid token" });

    const company = await Company.findById(decoded.id).select("-password -refreshToken -refreshTokenHash");
    if (!company)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    req.company = company; // attach company to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
