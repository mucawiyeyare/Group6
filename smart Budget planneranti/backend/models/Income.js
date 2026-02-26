import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    source: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Income", incomeSchema);