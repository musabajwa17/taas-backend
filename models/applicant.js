import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StdResume",
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Reviewed", "Shortlisted", "Rejected", "Hired"],
      default: "Applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Applicant = mongoose.model("Applicant", applicantSchema);
export default Applicant;
