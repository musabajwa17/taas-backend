import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
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
    experience: String,
    qualification: String,
    location: {
      type: String,
      required: true,
    },
    salary: String,
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract"],
      default: "Full-time",
    },
    requirements: String,
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },

    // 🔥 Dynamic reference: either Company or Employer
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "postedByModel",
      required: true,
    },
    postedByModel: {
      type: String,
      required: true,
      enum: ["Company", "Employer"],
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
