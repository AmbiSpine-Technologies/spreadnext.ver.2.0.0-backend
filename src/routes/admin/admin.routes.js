import express from "express";
import * as adminController from "../../controllers/admin/admin.comman.controller.js";
import * as userController from '../../controllers/admin/user.controller.js';
import { protect, admin, superAdmin } from '../../middlewares/adminAuth.middleware.js';
import * as companyController from '../../controllers/admin/company.controller.js';
import * as companyCollege from '../../controllers/admin/college.controller.js';
import * as jobController from '../../controllers/admin/jobs.controller.js';
import * as jobApplication from "../../controllers/admin/jobapplication.controller.js";

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(protect);
router.use(admin); 

// ============= DASHBOARD =============
router.get("/dashboard/stats", adminController.getStats);

// ============= USER MANAGEMENT =============
router.get('/users', userController.getAllUsers);
router.get('/users/stats', userController.getUserStats);
router.get('/users/registrations', userController.getUserRegistrationsOverTime);
router.get('/users/active', userController.getActiveUsersOverTime);
router.get('/users/journey-stats', userController.getJourneyTypeStats);
router.get('/users/:userId', userController.getUserDetail);
router.patch('/users/:userId/suspend', userController.suspendUser);
router.patch('/users/:userId/reactivate', userController.reactivateUser);
router.patch('/users/:userId/profile', userController.updateUserProfile);
router.delete('/users/:userId', userController.deleteUser);
router.get('/export/users', userController.exportUsers);

// Super admin only
router.put('/users/:userId/promote', superAdmin, userController.promoteToAdmin);
router.put('/users/:userId/demote', superAdmin, userController.demoteToUser);

// ============= JOB MANAGEMENT =============
router.get("/jobs", jobController.getAllJobsAdmin);
router.get("/jobs/stats/get", jobController.getJobStats);
// FIX: Changed from /jobs/registrations to /jobs/posted to match frontend
router.get("/jobs/posted", jobController.getJobsPostedOverTime); 
router.get("/jobs/:jobId", jobController.getJobDetail);
router.patch("/jobs/:jobId/approve", jobController.approveJob);
router.patch("/jobs/:jobId/feature", jobController.featureJob);
router.patch("/jobs/:jobId", jobController.updateJob);
router.delete("/jobs/:jobId", jobController.deleteJob);
router.get("/export/jobs", jobController.exportJobs);

// ============= JOB APPLICATIONS =============
router.get("/applications", jobApplication.getAllApplications);
router.get("/applications/stats/get", jobApplication.getApplicationStats);
router.get("/applications/:applicationId", jobApplication.getApplicationDetail);
router.patch("/applications/:applicationId/status", jobApplication.updateApplicationStatus);
router.patch("/applications/:applicationId/notes", jobApplication.addApplicationNote);
router.get("/export/applications", jobApplication.exportApplications);

// ============= COMPANY MANAGEMENT =============
router.get("/companies", companyController.getAllCompanies);
router.get('/companies/registrations', companyController.getCompanyRegistrationsOverTime);
router.get('/companies/verification-stats', companyController.getCompanyVerificationStats);
router.get("/companies/:companyId", companyController.getCompanyDetail);
router.patch("/companies/:companyId/verify", companyController.verifyCompany);
router.patch("/companies/:companyId/suspend", companyController.suspendCompany);
router.patch("/companies/:companyId/reactivate", companyController.reactivateCompany);
router.patch("/companies/:companyId", companyController.updateCompany);

// ============= COLLEGE MANAGEMENT =============
router.get("/colleges", companyCollege.getAllColleges);
// FIX: Changed controller from companyController to companyCollege
router.get('/colleges/registrations', companyCollege.getCollegeRegistrationsOverTime); 
router.get('/colleges/status-stats', companyCollege.getCollegeVerificationStats); 
router.get("/colleges/:collegeId", companyCollege.getCollegeDetail);
router.patch("/colleges/:collegeId/verify", companyCollege.verifyCollege);
router.patch("/colleges/:collegeId/suspend", companyCollege.suspendCollege);
router.patch("/colleges/:collegeId/reactivate", companyCollege.reactivateCollege);
router.patch("/colleges/:collegeId", companyCollege.updateCollege);

export default router;