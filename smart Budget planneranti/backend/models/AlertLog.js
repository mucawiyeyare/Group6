import mongoose from "mongoose";

const alertLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    month: { type: String, required: true }, // YYYY-MM
    type: { type: String, enum: ["WARN_80", "LIMIT_100", "OVER"], required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("AlertLog", alertLogSchema);