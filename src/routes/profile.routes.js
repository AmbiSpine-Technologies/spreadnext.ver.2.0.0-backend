import express from "express";
import {
  updateProfileMediaController,
  updateContactInfo,
  createOrUpdateProfileController,
  getProfileController,
  getProfileByUsernameController,
  updatePersonalInfoController,
  updateProfileSummaryController,
  updateSocialLinksController,
  updateWorkExperienceController,
  addWorkExperienceController,
  updateWorkExperienceItemController,
  deleteWorkExperienceItemController,
  updateEducationController,
  addEducationController,
  updateEducationItemController,
  deleteEducationItemController,
  updateProjectsController,
  addProjectController,
  updateProjectItemController,
  deleteProjectItemController,
  updateSkillsController,
  updateInterestsController,
  updateLanguagesController,
  updateCertificatesController,
  addCertificateController,
  updateCertificateItemController,
  deleteCertificateItemController,
  addAwardController,
  deleteAwardController,
  updateLearningJourneyController,
  updateCareerExpectationsController,
  updateJobAlertPreferencesController,
  updateRecentExperienceController,
  updateInterestsAndPreferencesController,
  deleteProfileController,
  addPublicationController,
  updatePublicationItemController,
  deletePublicationItemController,
  updateAwardController,
} from "../controllers/profile.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

// ✅ Fixed S3 import
import { multerUpload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/username/:username", getProfileByUsernameController);

router.use(authMiddleware);

router.put("/media", authMiddleware, multerUpload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'profileCover', maxCount: 1 }
]), updateProfileMediaController);
router.put("/contact", updateContactInfo);
router.get("/", getProfileController);
router.post("/", createOrUpdateProfileController);
router.put("/", createOrUpdateProfileController);
router.delete("/", deleteProfileController);

router.put("/personal-info", updatePersonalInfoController);
router.put("/profile-summary", updateProfileSummaryController);
router.put("/social-links", updateSocialLinksController);

router.put("/work-experience", updateWorkExperienceController);
router.post("/work-experience", addWorkExperienceController);
router.put("/work-experience/:itemId", updateWorkExperienceItemController);
router.delete("/work-experience/:itemId", deleteWorkExperienceItemController);

router.put("/education", updateEducationController);
router.post("/education", addEducationController);
router.put("/education/:itemId", updateEducationItemController);
router.delete("/education/:itemId", deleteEducationItemController);

router.put("/projects", updateProjectsController);
router.post("/projects", addProjectController);
router.put("/projects/:itemId", updateProjectItemController);
router.delete("/projects/:itemId", deleteProjectItemController);

router.put("/skills", updateSkillsController);
router.put("/interests", updateInterestsController);
router.put("/languages", updateLanguagesController);

// ---- Certificates ----
router.put("/certificates", multerUpload.single("certificateImage"), updateCertificatesController);
router.post("/certificates", multerUpload.single("certificateImage"), addCertificateController);
router.put("/certificates/:itemId", updateCertificateItemController);
router.delete("/certificates/:itemId", deleteCertificateItemController);

// ---- Awards ----
router.post("/awards", multerUpload.single("media"), addAwardController);
router.delete("/awards/:itemId", deleteAwardController);
router.put("/awards/:itemId", multerUpload.single("media"), updateAwardController);

// ---- Publications ----
router.post("/publications", authMiddleware, addPublicationController);
router.put("/publications/:itemId", authMiddleware, updatePublicationItemController);
router.delete("/publications/:itemId", authMiddleware, deletePublicationItemController);

router.put("/learning-journey", updateLearningJourneyController);
router.put("/career-expectations", updateCareerExpectationsController);
router.put("/job-alert-preferences", updateJobAlertPreferencesController);
router.put("/recent-experience", updateRecentExperienceController);
router.put("/interests-preferences", updateInterestsAndPreferencesController);

export default router;

