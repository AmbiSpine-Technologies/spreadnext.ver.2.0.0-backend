import express from "express";
import {
  createCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getMyCompanies,
  getAllCompanies,
  getCompanySuggestions,
  getAllWithoutFilterCompanies,
} from "../controllers/company.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { multerUpload } from "../middlewares/upload.middleware.js";

const router = express.Router();

/* =====================
   PUBLIC ROUTES
===================== */

// ⚠️ Static routes FIRST
router.get("/all", getAllCompanies);
router.get("/all-without-filter", getAllWithoutFilterCompanies);
router.get("/suggestions", authMiddleware, getCompanySuggestions);

/* =====================
   PROTECTED ROUTES
===================== */

router.post(
  "/create",
  authMiddleware,
  multerUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "verificationDoc", maxCount: 1 },
  ]),
  createCompany
);

// ⚠️ "my" route MUST come before :id
router.get("/my/companies", authMiddleware, getMyCompanies);

router.put("/update/:id", authMiddleware, updateCompany);
router.delete("/delete/:id", authMiddleware, deleteCompany);

/* =====================
   DYNAMIC ROUTES (LAST)
===================== */

router.get("/:id", getCompanyById);

export default router;

