import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import cvRoutes from "./routes/resume.routes.js"; // ✅ newly added
import studentResumeRoutes from "./routes/studentResume.routes.js";
dotenv.config();

const app = express();

// 🔹 Middleware
app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  credentials: true, // allow cookies
}));
app.use(cookieParser())
app.use(express.json());

// 🔹 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🔹 Base Route
app.get("/", (req, res) => {
  res.send("🚀 TaaS Grid API is running...");
});

// 🔹 Routes
app.use("/api/user", userRoutes);
app.use("/api/cv", cvRoutes); // ✅ CV management routes
app.use("/api/resume", studentResumeRoutes);
// 🔹 Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
