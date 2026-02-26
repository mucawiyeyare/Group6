import Expense from "../models/Expense.js";
import { checkBudgetAfterExpense } from "../utils/budgetCheck.js";

export async function getExpenses(req, res) {
  const userId = req.user._id.toString();
  const filter = req.user.role === "admin" && req.query.all === "true"
    ? {}
    : { userId };
  const items = await Expense.find(filter).sort({ date: -1 }).populate("categoryId");
  res.json(items);
}

export async function addExpense(req, res) {
  const { amount, categoryId, paymentMethod, date, note } = req.body;
  const userId = req.user._id.toString();

  if (!amount || amount <= 0) return res.status(400).json({ error: "Amount must be > 0" });
  if (!categoryId) return res.status(400).json({ error: "Category required" });
  if (!date) return res.status(400).json({ error: "Date required" });

  const expense = await Expense.create({
    userId,
    amount,
    categoryId,
    paymentMethod: paymentMethod || "Cash",
    date,
    note: note || "",
  });

  const budgetResult = await checkBudgetAfterExpense({
    userId,
    expenseDate: new Date(date),
  });

  res.status(201).json({ expense, budgetResult });
}

export async function updateExpense(req, res) {
  const userId = req.user._id.toString();
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId },
    req.body,
    { returnDocument: "after" }
  );

  if (!expense) return res.status(404).json({ error: "Expense not found" });

  const budgetResult = await checkBudgetAfterExpense({
    userId,
    expenseDate: new Date(expense.date),
  });

  res.json({ expense, budgetResult });
}

export async function deleteExpense(req, res) {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id.toString() });
  if (!expense) return res.status(404).json({ error: "Expense not found" });
  res.json({ message: "Deleted" });
}
