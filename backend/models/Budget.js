import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    month: { type: String, required: true }, 
    totalLimit: { type: Number, default: 0 },
    categoryLimits: [
      {
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        limit: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Budget", budgetSchema);