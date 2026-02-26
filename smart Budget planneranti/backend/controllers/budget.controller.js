import Budget from "../models/Budget.js";

export async function getBudget(req, res) {
  const { month } = req.query; // YYYY-MM
  if (!month) return res.status(400).json({ error: "month query required (YYYY-MM)" });

  const userId = req.user._id.toString();
  const budget = await Budget.findOne({ userId, month }).populate("categoryLimits.categoryId");
  res.json(budget || null);
}

export async function upsertBudget(req, res) {
  const { month, totalLimit, categoryLimits } = req.body;
  if (!month) return res.status(400).json({ error: "month required (YYYY-MM)" });

  const userId = req.user._id.toString();
  const budget = await Budget.findOneAndUpdate(
    { userId, month },
    { totalLimit: totalLimit ?? 0, categoryLimits: categoryLimits ?? [] },
    { returnDocument: "after", upsert: true }
  );

  res.json(budget);
}
