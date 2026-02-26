import express from "express";
import { createUser, getAllUsers, updateUserRole, updateUser, deleteUser } from "../controllers/user.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect, adminOnly); // all routes below are admin-only

router.post("/", createUser);
router.get("/", getAllUsers);
router.put("/:id", updateUser);
router.put("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;
