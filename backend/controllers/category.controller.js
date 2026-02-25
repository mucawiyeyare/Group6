import Category from "../models/Category.js";

const DEMO_USER_ID = "demo-user";

export async function getCategories(req, res) {
  const items = await Category.find({ userId: DEMO_USER_ID }).sort({ createdAt: -1 });
  res.json(items);
}

export async function addCategory(req, res) {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Name required" });

  const item = await Category.create({ userId: DEMO_USER_ID, name: name.trim() });
  res.status(201).json(item);
}

export async function deleteCategory(req, res) {
  const item = await Category.findOneAndDelete({ _id: req.params.id, userId: DEMO_USER_ID });
  if (!item) return res.status(404).json({ error: "Category not found" });
  res.json({ message: "Deleted" });
}