import express from "express";
import { getIncome, addIncome, updateIncome, deleteIncome } from "../controllers/income.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect); // all income routes require login

router.get("/", getIncome);
router.post("/", addIncome);
router.put("/:id", updateIncome);
router.delete("/:id", deleteIncome);

export default router;