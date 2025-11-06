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
    experience: {
      type: String,
    },
    qualification: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract"],
      default: "Full-time",
    },
    requirements: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // if you have an employer or admin model
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
