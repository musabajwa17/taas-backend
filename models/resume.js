import mongoose from "mongoose";

// ===== Sub-Schemas =====
const educationSchema = new mongoose.Schema({
  degree: { type: String },
  institution: { type: String, required: true },
  year: { type: String, required: true },
});

const experienceSchema = new mongoose.Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  years: { type: String, required: true },
});
// const achievementSchema = new mongoose.Schema({
//   year: { type: String },
//   award: { type: String },
// });
const professionalTrainingSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  year: { type: String },
});

const technicalSkillSchema = new mongoose.Schema({
  title: { type: String },
  lang: { type: String },
});

const membershipSchema = new mongoose.Schema({
  heading: { type: String },
  desc: { type: String },
});

const referenceSchema = new mongoose.Schema({
  prof: { type: String },
  designation: { type: String },
  mail: { type: String },
  phone: { type: String },
});

const researchPublicationSchema = new mongoose.Schema({
  journal: { type: String },
  workshop: { type: String },
  category: { type: String, enum: ["journal", "workshop"], default: "journal" },
  title: { type: String },
  link: { type: String },
});

// ===== AI Suggestion Schema =====
const aiSuggestionSchema = new mongoose.Schema({
  missing_details: [{ type: String }],
  missing_sections: [{ type: String }],
  suggested_additions: [{ type: String }],
  summary_improvement: [{ type: String }],
});

// ===== Main Resume Schema =====
const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ⚠️ ensures one CV per user (for your “basic plan” rule)
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    citations: { type: Number },
    impactFactor: { type: Number },
    scholar: { type: String },

    education: { type: [educationSchema], required: true },
    experience: [experienceSchema],
    achievements: [{ type: String }],
    bookAuthorship: [{ type: String }],
    journalGuestEditor: [{ type: String }],
    researchPublications: [researchPublicationSchema],
    bookChapters: [{ type: String }],
    msStudentsSupervised: { type: Number },
    phdStudentsSupervised: { type: Number },
    researchProjects: [{ type: String }],
    professionalServices: [{ type: String }],
    professionalTraining: [professionalTrainingSchema],
    technicalSkills: [technicalSkillSchema],
    membershipsAndAssociations: [membershipSchema],
    references: [referenceSchema],
    ai_suggestions: aiSuggestionSchema,
  },
  { timestamps: true }
);

// Prevent model overwrite during hot reload in dev
export const Resume =
  mongoose.models.Resume || mongoose.model("Resume", resumeSchema);
