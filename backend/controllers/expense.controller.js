import Expense from "../models/Expense.js";
import { checkBudgetAfterExpense } from "../utils/budgetCheck.js";

const DEMO_USER_ID = "demo-user";

export async function getExpenses(req, res) {
  const items = await Expense.find({ userId: DEMO_USER_ID }).sort({ date: -1 }).populate("categoryId");
  res.json(items);
}

export async function addExpense(req, res) {
  const { amount, categoryId, paymentMethod, date, note } = req.body;

  if (!amount || amount <= 0) return res.status(400).json({ error: "Amount must be > 0" });
  if (!categoryId) return res.status(400).json({ error: "Category required" });
  if (!date) return res.status(400).json({ error: "Date required" });

  const expense = await Expense.create({
    userId: DEMO_USER_ID,
    amount,
    categoryId,
    paymentMethod: paymentMethod || "Cash",
    date,
    note: note || "",
  });

  const budgetResult = await checkBudgetAfterExpense({
    userId: DEMO_USER_ID,
    expenseDate: new Date(date),
  });

  res.status(201).json({ expense, budgetResult });
}

export async function updateExpense(req, res) {
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: DEMO_USER_ID },
    req.body,
    { new: true }
  );

  if (!expense) return res.status(404).json({ error: "Expense not found" });

  const budgetResult = await checkBudgetAfterExpense({
    userId: DEMO_USER_ID,
    expenseDate: new Date(expense.date),
  });

  res.json({ expense, budgetResult });
}

export async function deleteExpense(req, res) {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: DEMO_USER_ID });
  if (!expense) return res.status(404).json({ error: "Expense not found" });
  res.json({ message: "Deleted" });
}