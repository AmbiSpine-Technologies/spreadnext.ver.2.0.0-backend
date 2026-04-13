import Job from "../../models/job.model.js";
import JobApplication from "../../models/jobApplication.model.js";
import { logAdminActivity } from "../../middlewares/adminAuth.middleware.js";
import { getDateRange, getTimeSeries } from '../../utils/dateHelpers.js';



export const getJobsPostedOverTimeService = async (filter) => {
  const startDate = getDateRange(filter);
  return getTimeSeries(Job, 'createdAt', startDate);
};

export const getJobFeaturedStatsService = async () => {
  const featured = await Job.countDocuments({ isFeatured: true });
  const regular = await Job.countDocuments({ isFeatured: false });
  return [
    { _id: "Featured", count: featured },
    { _id: "Regular", count: regular }
  ];
};


// Get all jobs (admin)
export const getAllJobsAdminService = async (page = 1, limit = 20, filters = {}) => {
  try {
    const skip = (page - 1) * limit;
    const query = {};
 
    // Search
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { company: { $regex: filters.search, $options: "i" } },
      ];
    }
 
    // Filter by status
    if (filters.status) {
      query.isActive = filters.status === "active";
    }
 
    // Filter by featured
    if (filters.featured !== undefined) {
      query.isFeatured = filters.featured === "true" || filters.featured === true;
    }
 
    const jobs = await Job.find(query)
      .populate("postedBy", "firstName lastName email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
 
    const total = await Job.countDocuments(query);
 
    // Get application count for each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const applications = await JobApplication.countDocuments({
          job: job._id,
        });
        return { ...job, applicationsCount: applications };
      })
    );
 
    return {
      success: true,
      data: jobsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET ALL JOBS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch jobs",
      error: error.message,
      data: [],
      pagination: { page, limit, total: 0, pages: 0 },
    };
  }
};
 
// Get job details
export const getJobDetailService = async (jobId) => {
  try {
    const job = await Job.findById(jobId)
      .populate("postedBy", "firstName lastName email userName")
      .lean();
 
    if (!job) {
      return {
        success: false,
        message: "Job not found",
      };
    }
 
    const applications = await JobApplication.find({ job: jobId })
      .populate("applicant", "firstName lastName email")
      .lean();
 
    return {
      success: true,
      data: {
        job,
        applicationsCount: applications.length,
        applications,
      },
    };
  } catch (error) {
    console.error("GET JOB DETAIL ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch job details",
      error: error.message,
    };
  }
};
 
// Approve job (deactivate/activate)
export const approveJobService = async (jobId, adminId, approved = true) => {
  try {
    const job = await Job.findByIdAndUpdate(jobId, { isActive: approved }, { new: true });
 
    if (!job) {
      return {
        success: false,
        message: "Job not found",
      };
    }
 
    // Log activity
    if (adminId) {
      await logAdminActivity(
        adminId,
        approved ? "approve_job" : "reject_job",
        "Job",
        jobId,
        {
          status: approved ? "approved" : "rejected",
        }
      );
    }
 
    return {
      success: true,
      message: `Job ${approved ? "approved" : "rejected"} successfully`,
      data: job,
    };
  } catch (error) {
    console.error("APPROVE JOB ERROR:", error);
    return {
      success: false,
      message: "Failed to update job status",
      error: error.message,
    };
  }
};
 
// Feature job
export const featureJobService = async (jobId, adminId, featured = true) => {
  try {
    const job = await Job.findByIdAndUpdate(jobId, { isFeatured: featured }, { new: true });
 
    if (!job) {
      return {
        success: false,
        message: "Job not found",
      };
    }
 
    // Log activity
    if (adminId) {
      await logAdminActivity(adminId, "feature_job", "Job", jobId, {
        featured,
      });
    }
 
    return {
      success: true,
      message: `Job ${featured ? "featured" : "unfeatured"} successfully`,
      data: job,
    };
  } catch (error) {
    console.error("FEATURE JOB ERROR:", error);
    return {
      success: false,
      message: "Failed to update job featured status",
      error: error.message,
    };
  }
};
 
// Delete job
export const deleteJobService = async (jobId, adminId) => {
  try {
    const job = await Job.findByIdAndDelete(jobId);
 
    if (!job) {
      return {
        success: false,
        message: "Job not found",
      };
    }
 
    // Delete associated applications
    await JobApplication.deleteMany({ job: jobId });
 
    // Log activity
    if (adminId) {
      await logAdminActivity(adminId, "delete_job", "Job", jobId, {
        deletedAt: new Date(),
      });
    }
 
    return {
      success: true,
      message: "Job deleted successfully",
    };
  } catch (error) {
    console.error("DELETE JOB ERROR:", error);
    return {
      success: false,
      message: "Failed to delete job",
      error: error.message,
    };
  }
};
 
// Update job (admin edit)
export const updateJobService = async (jobId, adminId, updates) => {
  try {
    const job = await Job.findByIdAndUpdate(jobId, updates, {
      new: true,
      runValidators: true,
    });
 
    if (!job) {
      return {
        success: false,
        message: "Job not found",
      };
    }
 
    // Log activity
    if (adminId) {
      await logAdminActivity(adminId, "edit_job", "Job", jobId, {
        changes: updates,
      });
    }
 
    return {
      success: true,
      message: "Job updated successfully",
      data: job,
    };
  } catch (error) {
    console.error("UPDATE JOB ERROR:", error);
    return {
      success: false,
      message: "Failed to update job",
      error: error.message,
    };
  }
};
 
// Get job statistics
export const getJobStatsService = async () => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const featuredJobs = await Job.countDocuments({ isFeatured: true });
    const totalApplications = await JobApplication.countDocuments();
 
    // Jobs by work mode
    let jobsByWorkMode = [];
    try {
      jobsByWorkMode = await Job.aggregate([
        {
          $group: {
            _id: "$workMode",
            count: { $sum: 1 },
          },
        },
        { $match: { _id: { $ne: null } } },
      ]);
    } catch (e) {
      console.warn("Work mode aggregation failed:", e.message);
    }
 
    // Jobs by type
    let jobsByType = [];
    try {
      jobsByType = await Job.aggregate([
        {
          $group: {
            _id: "$jobType",
            count: { $sum: 1 },
          },
        },
        { $match: { _id: { $ne: null } } },
      ]);
    } catch (e) {
      console.warn("Job type aggregation failed:", e.message);
    }
 
    // Applications by status
    let applicationsByStatus = [];
    try {
      applicationsByStatus = await JobApplication.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $match: { _id: { $ne: null } } },
      ]);
    } catch (e) {
      console.warn("Application status aggregation failed:", e.message);
    }
 
    // Jobs created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newJobs = await Job.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
 
    return {
      success: true,
      data: {
        totalJobs,
        activeJobs,
        featuredJobs,
        totalApplications,
        newJobsLast30Days: newJobs,
        jobsByWorkMode: jobsByWorkMode || [],
        jobsByType: jobsByType || [],
        applicationsByStatus: applicationsByStatus || [],
      },
    };
  } catch (error) {
    console.error("GET JOB STATS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch job statistics",
      error: error.message,
      data: {
        totalJobs: 0,
        activeJobs: 0,
        featuredJobs: 0,
        totalApplications: 0,
        newJobsLast30Days: 0,
        jobsByWorkMode: [],
        jobsByType: [],
        applicationsByStatus: [],
      },
    };
  }
};
 
// Export jobs data
export const exportJobsService = async () => {
  try {
    const jobs = await Job.find().lean();
 
    const exportData = await Promise.all(
      jobs.map(async (job) => {
        const applicationsCount = await JobApplication.countDocuments({
          job: job._id,
        });
        return {
          jobId: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          workMode: job.workMode,
          jobType: job.jobType,
          salary: job.salary,
          isActive: job.isActive,
          isFeatured: job.isFeatured,
          applicationsCount,
          createdAt: job.createdAt,
        };
      })
    );
 
    return {
      success: true,
      data: exportData,
    };
  } catch (error) {
    console.error("EXPORT JOBS ERROR:", error);
    return {
      success: false,
      message: "Failed to export jobs",
      error: error.message,
      data: [],
    };
  }
};
 