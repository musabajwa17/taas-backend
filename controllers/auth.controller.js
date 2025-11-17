// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Company from "../models/company.js";

// 🔹 Helper to generate tokens
const generateTokens = (id, role) => {
  const accessToken = jwt.sign(
    { id, role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id, role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// 🔹 Login (single for Users & Companies)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    // Check company first
    let user = await Company.findOne({ email });
    let role = "company";

    if (!user) {
      user = await User.findOne({ email });
      role = user?.role || "student"; // default role if missing
    }

    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Verify password
    const valid = await user.isPasswordCorrect(password);
    if (!valid) return res.status(400).json({ message: "Invalid email or password" });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, role);

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Send cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Return user info
    const payload = role === "company" 
      ? { _id: user._id, companyName: user.companyName, email: user.email, role, plan: user.plan } 
      : { _id: user._id, name: user.name, email: user.email, role, plan: user.plan };

    res.status(200).json({ user: payload });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔹 Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, plan } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: "All fields required" });

    if (await User.findOne({ email })) return res.status(409).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role, plan: plan || "basic" });

    const { accessToken, refreshToken } = generateTokens(user._id, role);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "strict", maxAge: 15*60*1000 });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "strict", maxAge: 7*24*60*60*1000 });

    res.status(201).json({
      message: "User registered",
      user: { _id: user._id, name: user.name, email: user.email, role, plan: user.plan }
    });
  } catch (err) {
    console.error("Register user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Register Company
export const registerCompany = async (req, res) => {
  try {
    const { companyName, email, password, phone, address, website, description, industry, size, plan, establishedYear, logo } = req.body;
    if (!companyName || !email || !password) return res.status(400).json({ message: "Required fields missing" });

    if (await Company.findOne({ email })) return res.status(409).json({ message: "Company already exists" });

    const company = await Company.create({ companyName, email, password, phone, address, website, description, industry, size, plan, establishedYear, logo });

    const { accessToken, refreshToken } = generateTokens(company._id, "company");
    company.refreshToken = refreshToken;
    await company.save({ validateBeforeSave: false });

    res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "strict", maxAge: 15*60*1000 });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "strict", maxAge: 7*24*60*60*1000 });

    res.status(201).json({
      message: "Company registered",
      company: { _id: company._id, companyName, email, plan: company.plan }
    });
  } catch (err) {
    console.error("Register company error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Get Logged-in User/Company
export const getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // Always safe: convert Mongoose doc to plain object
    const userObj = req.user.toObject ? req.user.toObject() : req.user;

    res.status(200).json({ user: { ...userObj, role: req.role } });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// 🔹 Logout
export const logout = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(400).json({ message: "No token" });

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (payload.role === "company") await Company.findByIdAndUpdate(payload.id, { $unset: { refreshToken: 1 } });
    else await User.findByIdAndUpdate(payload.id, { $unset: { refreshToken: 1 } });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
