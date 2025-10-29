import jwt from "jsonwebtoken";
import User from "../models/user.js";

/**
 * @desc    Register a new user
 * @route   POST /register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // 1️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 2️⃣ Create new user
    const newUser = await User.create({ fullName, email, password, role });

    // 3️⃣ Generate tokens
    const accessToken = newUser.generateAccessToken();
    const refreshToken = newUser.generateRefreshToken();

    // 4️⃣ Save refresh token to DB
    newUser.refreshToken = refreshToken;
    await newUser.save({ validateBeforeSave: false });

    // 5️⃣ Send tokens as HttpOnly cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 6️⃣ Send success response with correct user info
    res.status(200).json({
      message: "User Registered Successfully",
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken, // optional: send token too
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


/**
 * @desc    Login user
 * @route   POST /login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check user existence
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    // 2️⃣ Validate password
    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    // 3️⃣ Generate new tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // 4️⃣ Update refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // 5️⃣ Send tokens via cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 6️⃣ Return user info
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        plan: user.plan
      },
      accessToken, // must be included
      refreshToken,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /refresh-token
 * @access  Public
 */
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token provided" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: "Access token refreshed successfully" });
  } catch (err) {
    console.error("Refresh Token Error:", err);
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

/**
 * @desc    Logout user
 * @route   POST /logout
 * @access  Private
 */
export const logoutUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
