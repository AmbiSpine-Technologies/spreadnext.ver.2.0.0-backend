import express from "express";
import {
  createCollege,
  getCollegeById,
  updateCollege,
  getMyColleges,
  getAllColleges,
} from "../controllers/college.controller.js";
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  bulkUploadStudents,
} from "../controllers/collegeStudent.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { multerUpload } from "../middlewares/upload.middleware.js";
import Company from "../models/company.model.js"; // Import College Model
import College from "../models/college.model.js"; // Import Company Model

const router = express.Router();

// College routes
router.post("/create", authMiddleware, multerUpload.fields([
   { name: "logo", maxCount: 1 },
    { name: "verificationDoc", maxCount: 1 },
]), createCollege);


router.get("/my-entities", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; 
    
    // Dono collections se data fetch karein
    const [companies, colleges] = await Promise.all([
      Company.find({ createdBy: userId }),
      College.find({ createdBy: userId })
    ]);

    // Data ko combine karein aur front-end ke liye flag add karein
    const allPages = [
      ...companies.map(c => ({ ...c._doc, entityType: 'company' })),
      ...colleges.map(c => ({ ...c._doc, entityType: 'college' }))
    ];

    res.json({ 
      success: true, 
      count: allPages.length,
      data: allPages 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/colleges", getAllColleges);
router.get("/my/colleges", authMiddleware, getMyColleges);
router.get("/:id", getCollegeById);
router.put("/update/:id", authMiddleware, updateCollege);

// Student routes (nested under college)
router.post("/:collegeId/students", authMiddleware, createStudent);
router.get("/:collegeId/students", authMiddleware, getStudents);
router.get("/students/:id", getStudentById);
router.put("/:collegeId/students/:id", authMiddleware, updateStudent);
router.delete("/:collegeId/students/:id", authMiddleware, deleteStudent);
router.post("/:collegeId/students/bulk-upload", authMiddleware, bulkUploadStudents);

export default router;


