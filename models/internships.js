import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: String },
    qualification: { type: String },
    location: { type: String },
    requirements: { type: String },
    stipend: { type: String },
    type: { type: String, default: "Internship" },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or "Company" if you have a separate model
      required: true,
    },
  },
  { timestamps: true }
);

const Internship = mongoose.model("Internship", internshipSchema);

export default Internship;
