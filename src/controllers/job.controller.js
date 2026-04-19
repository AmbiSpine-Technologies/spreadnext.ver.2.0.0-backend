import {
  createJobValidation,
  updateJobValidation,
} from "../validations/job.validation.js";
import {
  createJobService,
  getAllJobsService,
  getJobByIdService,
  updateJobService,
  deleteJobService,
  getMyJobsService,
  getMyJobsAppliedService,
  getFeaturedJobsService,
  getTrendingJobsService,
} from "../services/job.service.js";
import { MSG } from "../constants/messages.js";
import { requestCompanyEmailOTP, verifyOTP } from "../services/otp.service.js";


// Create a new job
export const createJob = async (req, res) => {
  try {
    const { error } = createJobValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await createJobService(req.body, req.user._id);
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("CREATE JOB ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};



// @desc    Get top 8 trending jobs
// @route   GET /api/jobs/trending
export const getTrendingJobs = async (req, res) => {
  try {
    const result = await getTrendingJobsService();
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (err) {
    console.error("TRENDING JOBS CONTROLLER ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const requestVerification = async (req, res) => {
  try {
    const { email, companyName } = req.body;
    
    if (!email || !companyName) {
      return res.status(400).json({ success: false, message: "Email and Company Name are required" });
    }

    const result = await requestCompanyEmailOTP(email, companyName);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while sending OTP" });
  }
};

// Step 2: Sirf OTP check karta hai
export const validateOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    // Aapki existing verifyOTP service use kar rahe hain
    const verification = await verifyOTP(email, otp);

    if (verification.success) {
      return res.status(200).json({ 
        success: true, 
        message: "Email verified successfully!" 
      });
    } else {
      return res.status(400).json(verification);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during verification" });
  }
};



// Get all jobs with filters and pagination
export const getAllJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      workMode,
      jobType,
      industry,
      companySize,
      skills,
      page,
      limit,
      sortBy,
      order,
    } = req.query;

    const filters = {
      search,
      location,
      workMode,
      jobType: jobType ? jobType.split(",") : undefined,
      industry: industry ? industry.split(",") : undefined,
      companySize,
      skills: skills ? skills.split(",") : undefined,
    };

    const pagination = {
      page: page || 1,
      limit: limit || 12,
      sortBy: sortBy || "createdAt",
      order: order || "desc",
    };

    const result = await getAllJobsService(filters, pagination);
    res.status(200).json(result);
  } catch (err) {
    console.error("GET ALL JOBS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

// Get single job by ID
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const result = await getJobByIdService(id);
    res.status(result.success ? 200 : 404).json(result);
  } catch (err) {
    console.error("GET JOB BY ID ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

// Update job
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const { error } = updateJobValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await updateJobService(id, req.user._id, req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("UPDATE JOB ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const result = await deleteJobService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("DELETE JOB ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

// Get jobs posted by logged-in user
export const getMyJobs = async (req, res) => {
  try {
    const { page, limit, sortBy, order } = req.query;

    const pagination = {
      page: page || 1,
      limit: limit || 10,
      sortBy: sortBy || "createdAt",
      order: order || "desc",
    };

    const result = await getMyJobsService(req.user._id, pagination);
    res.status(200).json(result);
  } catch (err) {
    console.error("GET MY JOBS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};



// Get jobs posted by logged-in user
export const getJobsAppliedController = async (req, res) => {
  try {
    
    const { page, limit, sortBy, order } = req.query;

    const pagination = {
      page: page || 1,
      limit: limit || 10,
      sortBy: sortBy || "createdAt",
      order: order || "desc",
    };

    const result = await getMyJobsAppliedService(req.user._id, pagination);
    res.status(200).json(result);
  } catch (err) {
    console.error("GET MY JOBS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

// Get featured jobs
export const getFeaturedJobs = async (req, res) => {
  try {
    const { limit } = req.query;
    const result = await getFeaturedJobsService(parseInt(limit) || 10);
    res.status(200).json(result);
  } catch (err) {
    console.error("GET FEATURED JOBS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

// Toggle job active status
export const toggleJobStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: MSG.JOB.NOT_FOUND,
      });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: MSG.JOB.UNAUTHORIZED,
      });
    }

    job.isActive = !job.isActive;
    await job.save();

    res.status(200).json({
      success: true,
      message: `Job ${job.isActive ? "activated" : "deactivated"} successfully`,
      data: job,
    });
  } catch (err) {
    console.error("TOGGLE JOB STATUS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};
