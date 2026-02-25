import express from "express";
import { getIncome, addIncome, updateIncome, deleteIncome } from "../controllers/income.controller.js";

const router = express.Router();

router.get("/", getIncome);
router.post("/", addIncome);
router.put("/:id", updateIncome);
router.delete("/:id", deleteIncome);

export default router;