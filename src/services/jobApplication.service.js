import JobApplication from "../models/jobApplication.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";

/**
 * Calculate match score between applicant profile and job requirements
 * Based on skills match, experience match, and role match
 * Returns a score between 0-100
 */
const calculateMatchScore = (profile, job) => {
  try {
    if (!profile || !job) return 0;

    let matchCount = 0;
    let totalCriteria = 0;

    // 1. Skills Match (most important - 60% weight)
    const profileSkills = (profile.skills || []).map((s) => s.toLowerCase().trim());
    const jobSkills = (job.skills || []).map((s) => s.toLowerCase().trim());
    
    if (jobSkills.length > 0) {
      const matchedSkills = jobSkills.filter((skill) =>
        profileSkills.some((ps) => ps === skill || ps.includes(skill) || skill.includes(ps))
      );
      matchCount += matchedSkills.length;
      totalCriteria += jobSkills.length;
    }

    // 2. Experience Match (20% weight)
    const jobExp = parseInt(job.experience) || 0;
    let userExp = 0;
    
    // Calculate user experience from workExperience
    if (profile.workExperience && profile.workExperience.length > 0) {
      profile.workExperience.forEach((exp) => {
        if (exp.startDate) {
          const startYear = parseInt(exp.startDate.split("-")[0] || exp.startDate.split("/")[0] || new Date(exp.startDate).getFullYear()) || 0;
          const endYear = exp.endDate 
            ? parseInt(exp.endDate.split("-")[0] || exp.endDate.split("/")[0] || new Date(exp.endDate).getFullYear()) || new Date().getFullYear()
            : new Date().getFullYear();
          userExp = Math.max(userExp, endYear - startYear);
        }
      });
    }
    
    // Also check recentExperience.experienceYears
    if (profile.recentExperience?.experienceYears) {
      const recentExp = parseInt(profile.recentExperience.experienceYears) || 0;
      userExp = Math.max(userExp, recentExp);
    }

    const isExpMatch = userExp >= jobExp;
    if (isExpMatch) {
      matchCount += 2;
    }
    totalCriteria += 2;

    // 3. Role Match (20% weight)
    const jobTitle = (job.title || "").toLowerCase();
    let userRole = "";
    
    if (profile.recentExperience?.jobTitle) {
      userRole = profile.recentExperience.jobTitle.toLowerCase();
    } else if (profile.recentExperience?.currentRole) {
      userRole = profile.recentExperience.currentRole.toLowerCase();
    } else if (profile.personalInfo?.headline) {
      userRole = profile.personalInfo.headline.toLowerCase();
    }
    
    const isRoleMatch = userRole && (
      jobTitle.includes(userRole) || 
      userRole.includes(jobTitle) ||
      jobTitle.split(" ").some((word) => userRole.includes(word)) ||
      userRole.split(" ").some((word) => jobTitle.includes(word))
    );
    
    if (isRoleMatch) {
      matchCount += 2;
    }
    totalCriteria += 2;

    // Calculate percentage (clamp between 10-98 to match frontend logic)
    if (totalCriteria === 0) return 50; // Default score if no criteria
    
    const rawPercentage = Math.round((matchCount / totalCriteria) * 100);
    const matchPercentage = Math.min(Math.max(rawPercentage, 10), 98);
    
    return matchPercentage;
  } catch (error) {
    console.error("Calculate match score error:", error);
    return 50; // Default score on error
  }
};

// Create a job application


export const createJobApplicationService = async (jobId, userId, data) => {
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return {
        success: false,
        message: "Job not found",
      };
    }
      const profile = await Profile.findOne({ userId });

      if (!profile) {
      return {
        success: false,
        message: "Profile not found. Please complete your profile first.",
      };
    }
    // Check if user already applied
    const existing = await JobApplication.findOne({
      job: jobId,
      applicant: profile._id,
    });

    if (existing) {
      return {
        success: false,
        message: "You have already applied for this job",
      };
    }

    // Calculate match score based on user profile and job requirements
    let matchScore = 0;
    try {
    
        matchScore = calculateMatchScore(profile.toObject(), job);
      
    } catch (error) {
      console.error("Error calculating match score:", error);
      // Continue with default score (0)
    }

    const application = await JobApplication.create({
      job: jobId,
      applicant: profile._id,
      resume: data.resume || null,
      resumeUrl: data.resumeUrl || "",
      coverLetter: data.coverLetter || "",
      answers: data.answers || [],
      experience: data.experience,         // <--- Added
      currentCtc: data.currentCtc,         // <--- Added
      expectedCtc: data.expectedCtc,       // <--- Added
      noticePeriod: data.noticePeriod,     // <--- Added
      status: "pending",
      matchScore: matchScore,
    });

    // Increment applications count on job
    job.applicationsCount += 1;
    await job.save();

    const populatedApplication = await JobApplication.findById(application._id)
      .populate("job", "title company location")
      .populate("applicant")
      .populate("resume")
      .lean();

    return {
      success: true,
      message: "Application submitted successfully",
      data: populatedApplication,
    };
  } catch (error) {
    console.error("CREATE JOB APPLICATION ERROR:", error);
    if (error.code === 11000) {
      return {
        success: false,
        message: "You have already applied for this job",
      };
    }
    return {
      success: false,
      message: "Failed to submit application",
      error: error.message,
    };
  }
};




// Get my applications
export const getMyApplicationsService = async (userId, filters = {}, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const query = { applicant: userId };

    if (filters.status) {
      query.status = filters.status;
    }

    const applications = await JobApplication.find(query)
      .populate("job", "title company companyLogo location jobType workMode salary")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await JobApplication.countDocuments(query);

    return {
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET MY APPLICATIONS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    };
  }
};



// Get applications for a job (employer view)
export const getJobApplicationsService = async (jobId, userId, filters = {}, page = 1, limit = 20) => {
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return {
        success: false,
        message: "Job not found",
      };
    }

    // Check if user is the job poster
    if (job.postedBy.toString() !== userId.toString()) {
      return {
        success: false,
        message: "Unauthorized - You are not the job poster",
      };
    }

    const skip = (page - 1) * limit;
    const query = { job: jobId };

    if (filters.status) {
      query.status = filters.status;
    }

    // Fetch applications and populate applicant data including isPremium
    const applications = await JobApplication.find(query)
      .populate("applicant")
      .populate("resume")
      .lean();

    // Sort by premium membership first, then by match score (descending), then by appliedAt (newest first)
    applications.sort((a, b) => {
      // First priority: Premium users come first
      const aIsPremium = a.applicant?.isPremium || false;
      const bIsPremium = b.applicant?.isPremium || false;
      if (aIsPremium !== bIsPremium) {
        return bIsPremium ? -1 : 1; // Premium users first (b comes before a if b is premium)
      }
      
      // Second priority: Higher match score
      const aScore = a.matchScore || 0;
      const bScore = b.matchScore || 0;
      if (aScore !== bScore) {
        return bScore - aScore; // Higher score first
      }
      
      // Third priority: Newer applications first
      return new Date(b.appliedAt) - new Date(a.appliedAt);
    });

    // Apply pagination after sorting
    const paginatedApplications = applications.slice(skip, skip + limit);
    const total = applications.length;

    return {
      success: true,
      data: paginatedApplications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET JOB APPLICATIONS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    };
  }
};



// Get application by ID
export const getApplicationByIdService = async (applicationId, userId) => {
  try {
    const application = await JobApplication.findById(applicationId)
      .populate("job")
      .populate("applicant")
      .populate("resume")
      .populate("reviewedBy", "firstName lastName userName")
      .lean();

    if (!application) {
      return {
        success: false,
        message: "Application not found",
      };
    }

    // Check authorization - applicant or job poster
    const isApplicant = application.applicant._id.toString() === userId.toString();
    const job = await Job.findById(application.job._id);
    const isJobPoster = job && job.postedBy.toString() === userId.toString();

    if (!isApplicant && !isJobPoster) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    return {
      success: true,
      data: application,
    };
  } catch (error) {
    console.error("GET APPLICATION BY ID ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch application",
      error: error.message,
    };
  }
};

// Update application status (employer only)
export const updateApplicationStatusService = async (applicationId, status, userId, notes = "") => {
  try {
    const application = await JobApplication.findById(applicationId).populate("job");

    if (!application) {
      return {
        success: false,
        message: "Application not found",
      };
    }

    // Check if user is the job poster
    if (application.job.postedBy.toString() !== userId.toString()) {
      return {
        success: false,
        message: "Unauthorized - You are not the job poster",
      };
    }

    const validStatuses = ["pending", "reviewing", "shortlisted", "interview", "rejected", "accepted", "withdrawn"];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        message: "Invalid status",
      };
    }

    application.status = status;
    application.reviewedAt = new Date();
    application.reviewedBy = userId;
    if (notes) {
      application.notes = notes;
    }

    await application.save();

    const updatedApplication = await JobApplication.findById(applicationId)
      .populate("job", "title company")
      .populate("applicant")
      .populate("reviewedBy", "firstName lastName userName")
      .lean();

    return {
      success: true,
      message: "Application status updated",
      data: updatedApplication,
    };
  } catch (error) {
    console.error("UPDATE APPLICATION STATUS ERROR:", error);
    return {
      success: false,
      message: "Failed to update application status",
      error: error.message,
    };
  }
};

// Withdraw application (applicant only)
export const withdrawApplicationService = async (applicationId, userId) => {
  try {
    const application = await JobApplication.findOne({
      _id: applicationId,
      applicant: userId,
    });

    if (!application) {
      return {
        success: false,
        message: "Application not found or unauthorized",
      };
    }

    if (application.status === "withdrawn") {
      return {
        success: false,
        message: "Application already withdrawn",
      };
    }

    application.status = "withdrawn";
    await application.save();

    return {
      success: true,
      message: "Application withdrawn successfully",
    };
  } catch (error) {
    console.error("WITHDRAW APPLICATION ERROR:", error);
    return {
      success: false,
      message: "Failed to withdraw application",
      error: error.message,
    };
  }
};

