import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Company from "../models/company.js";

// -------------------- Helper: Generate Tokens -------------------- //
const generateTokens = (id, role) => {
  const accessToken = jwt.sign({ id, role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });
  const refreshToken = jwt.sign({ id, role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });
  return { accessToken, refreshToken };
};

// -------------------- Cookie Options -------------------- //
const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
  path: "/",
  maxAge,
});

// -------------------- Login -------------------- //
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    let user = await Company.findOne({ email });
    let role = "company";

    if (!user) {
      user = await User.findOne({ email });
      role = user?.role || "student";
    }

    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const valid = await user.isPasswordCorrect(password);
    if (!valid) return res.status(400).json({ message: "Invalid email or password" });

    const { accessToken, refreshToken } = generateTokens(user._id, role);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000)); // 15 mins
    res.cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days

    const payload = role === "company"
      ? { _id: user._id, companyName: user.companyName, email: user.email, role, plan: user.plan }
      : { _id: user._id, name: user.fullName, email: user.email, role, plan: user.plan };

    res.status(200).json({ user: payload });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------- Register User -------------------- //
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, plan } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: "All fields required" });
    if (await User.findOne({ email })) return res.status(409).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role, plan: plan || "basic" });

    const { accessToken, refreshToken } = generateTokens(user._id, role);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

    res.status(201).json({
      message: "User registered",
      user: { _id: user._id, name: user.name, email: user.email, role, plan: user.plan }
    });
  } catch (err) {
    console.error("Register user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- Register Company -------------------- //
export const registerCompany = async (req, res) => {
  try {
    const { companyName, email, password, plan, ...rest } = req.body;
    if (!companyName || !email || !password) return res.status(400).json({ message: "Required fields missing" });
    if (await Company.findOne({ email })) return res.status(409).json({ message: "Company already exists" });

    const company = await Company.create({ companyName, email, password, plan, ...rest });

    const { accessToken, refreshToken } = generateTokens(company._id, "company");
    company.refreshToken = refreshToken;
    await company.save({ validateBeforeSave: false });

    res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

    res.status(201).json({
      message: "Company registered",
      company: { _id: company._id, companyName, email, plan: company.plan }
    });
  } catch (err) {
    console.error("Register company error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- Get Current User -------------------- //
export const getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userObj = req.user.toObject ? req.user.toObject() : req.user;
    res.status(200).json({ user: { ...userObj, role: req.role } });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- Logout -------------------- //
export const logout = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(400).json({ message: "No token" });

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (payload.role === "company") await Company.findByIdAndUpdate(payload.id, { $unset: { refreshToken: 1 } });
    else await User.findByIdAndUpdate(payload.id, { $unset: { refreshToken: 1 } });

    res.clearCookie("accessToken", getCookieOptions(0));
    res.clearCookie("refreshToken", getCookieOptions(0));

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- Refresh Token -------------------- //
export const refreshToken = async (req, res) => {
  try {
    const refresh = req.cookies.refreshToken;
    if (!refresh) return res.status(401).json({ message: "No refresh token" });

    const payload = jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET);

    const user = payload.role === "company"
      ? await Company.findById(payload.id)
      : await User.findById(payload.id);

    if (!user || user.refreshToken !== refresh) return res.status(401).json({ message: "Invalid refresh token" });

    const accessToken = jwt.sign({ id: user._id, role: payload.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });

    res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000));

    res.status(200).json({ message: "Access token refreshed" });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
