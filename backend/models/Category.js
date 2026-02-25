import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, 
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);