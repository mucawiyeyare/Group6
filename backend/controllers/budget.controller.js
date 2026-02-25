import Budget from "../models/Budget.js";

const DEMO_USER_ID = "demo-user";

export async function getBudget(req, res) {
  const { month } = req.query; // YYYY-MM
  if (!month) return res.status(400).json({ error: "month query required (YYYY-MM)" });

  const budget = await Budget.findOne({ userId: DEMO_USER_ID, month }).populate("categoryLimits.categoryId");
  res.json(budget || null);
}

export async function upsertBudget(req, res) {
  const { month, totalLimit, categoryLimits } = req.body;
  if (!month) return res.status(400).json({ error: "month required (YYYY-MM)" });

  const budget = await Budget.findOneAndUpdate(
    { userId: DEMO_USER_ID, month },
    { totalLimit: totalLimit ?? 0, categoryLimits: categoryLimits ?? [] },
    { new: true, upsert: true }
  );

  res.json(budget);
}