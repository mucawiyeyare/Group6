import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import AlertLog from "../models/AlertLog.js";

export async function checkBudgetAfterExpense({ userId, expenseDate }) {
  const month = expenseDate.toISOString().slice(0, 7); // YYYY-MM

  const budget = await Budget.findOne({ userId, month });
  if (!budget || !budget.totalLimit || budget.totalLimit <= 0) return null;

  const start = new Date(`${month}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  const expenses = await Expense.find({ userId, date: { $gte: start, $lt: end } });
  const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  const percent = (totalSpent / budget.totalLimit) * 100;

  let type = null;
  if (percent >= 100) type = totalSpent > budget.totalLimit ? "OVER" : "LIMIT_100";
  else if (percent >= 80) type = "WARN_80";

  if (!type) return null;

  // prevent spamming same type alerts multiple times in same month
  const exists = await AlertLog.findOne({ userId, month, type });
  if (exists) return { type, totalSpent, percent, skipped: true };

  const message =
    type === "WARN_80"
      ? `Warning: You used ${Math.round(percent)}% of your monthly budget.`
      : type === "LIMIT_100"
      ? `Budget limit reached: You used 100% of your monthly budget.`
      : `Overspent: You went above your monthly budget limit.`;

  const alert = await AlertLog.create({ userId, month, type, message });

  return { alert, totalSpent, percent };
}