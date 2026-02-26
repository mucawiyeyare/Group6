import User from "../models/User.js";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";

// POST /api/users  (admin only)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "user", profileImage = "" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = String(role || "user").trim().toLowerCase();

    if (!["user", "admin"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
      role: normalizedRole,
      profileImage: typeof profileImage === "string" ? profileImage.trim() : "",
    });

    const safeUser = await User.findById(user._id).select("-password");

    res.status(201).json({ message: "User created", user: safeUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/users  (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/users/:id/role  (admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { returnDocument: "after" }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Role updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/users/:id  (admin only)
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, profileImage } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Name, email, and role are required" });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.params.id },
    });

    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: String(name).trim(),
        email: normalizedEmail,
        role,
        profileImage: typeof profileImage === "string" ? profileImage.trim() : "",
      },
      { returnDocument: "after", runValidators: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/users/:id  (admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    // Delete user's data
    await Income.deleteMany({ userId: user._id.toString() });
    await Expense.deleteMany({ userId: user._id.toString() });
    await Budget.deleteMany({ userId: user._id.toString() });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User and all their data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
