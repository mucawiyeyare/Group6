import Income from "../models/Income.js";

export async function getIncome(req, res) {
  const userId = req.user._id.toString();
  // Admin can pass ?all=true to see all users' income
  const filter = req.user.role === "admin" && req.query.all === "true"
    ? {}
    : { userId };
  const items = await Income.find(filter).sort({ date: -1 });
  res.json(items);
}

export async function addIncome(req, res) {
  const { amount, source, date, note } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Amount must be > 0" });
  if (!source) return res.status(400).json({ error: "Source required" });
  if (!date) return res.status(400).json({ error: "Date required" });

  const item = await Income.create({
    userId: req.user._id.toString(),
    amount,
    source,
    date,
    note: note || "",
  });

  res.status(201).json(item);
}

export async function updateIncome(req, res) {
  const item = await Income.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id.toString() },
    req.body,
    { returnDocument: "after" }
  );
  if (!item) return res.status(404).json({ error: "Income not found" });
  res.json(item);
}

export async function deleteIncome(req, res) {
  const item = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user._id.toString() });
  if (!item) return res.status(404).json({ error: "Income not found" });
  res.json({ message: "Deleted" });
}
