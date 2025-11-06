import mongoose from "mongoose";

const FypSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    collaborationMode: {
      type: String,
      enum: ["On-site", "Remote", "Hybrid"],
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    requirements: {
      type: String,
    },
    location: {
      type: String,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Fyp", FypSchema);
