import Category from "../models/Category.js";

export async function getCategories(req, res) {
  const userId = req.user._id.toString();
  const items = await Category.find({ userId }).sort({ createdAt: -1 });
  res.json(items);
}

export async function addCategory(req, res) {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Name required" });

  const item = await Category.create({ userId: req.user._id.toString(), name: name.trim() });
  res.status(201).json(item);
}

export async function deleteCategory(req, res) {
  const item = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user._id.toString() });
  if (!item) return res.status(404).json({ error: "Category not found" });
  res.json({ message: "Deleted" });
}