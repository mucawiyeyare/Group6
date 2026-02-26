import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // later replace with ObjectId when auth added
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);