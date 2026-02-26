import express from "express";
import { getBudget, upsertBudget } from "../controllers/budget.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect); // all budget routes require login

router.get("/", getBudget);
router.post("/", upsertBudget);

export default router;