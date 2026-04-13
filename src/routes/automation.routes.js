import express from "express";
import { runInactiveUserAutomation } from "../controllers/automation.controller.js";

const router = express.Router();

router.get("/run-inactive-automation", runInactiveUserAutomation);

export default router;