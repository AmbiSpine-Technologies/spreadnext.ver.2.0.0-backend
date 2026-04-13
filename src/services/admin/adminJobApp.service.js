import JobApplication from "../../models/jobApplication.model.js";
import Job from "../../models/job.model.js";
import Profile from "../../models/profile.model.js";
import User from "../../models/user.model.js";
import { createNotificationService } from "../notification.service.js";

// Get all applications (with filters)
export const getAllApplicationsAdminService = async (page = 1, limit = 20, filters = {}) => {
  try {
    const skip = (page - 1) * limit;
    const query = {};

    // Filter by status
    if (filters.status) {
      query.status = filters.status;
    }

    // Filter by job
    if (filters.jobId) {
      query.job = filters.jobId;
    }

    // Filter by applicant
    if (filters.applicantId) {
      query.applicant = filters.applicantId;
    }

    // Search by match score
    if (filters.minMatchScore) {
      query.matchScore = { $gte: parseInt(filters.minMatchScore) };
    }

    const applications = await JobApplication.find(query)
      .populate("job", "title company")
      .populate("applicant", "firstName lastName email")
      .populate("reviewedBy", "firstName lastName")
      .skip(skip)
      .limit(limit)
      .sort({ appliedAt: -1 })
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
    return {
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    };
  }
};

// Get application detail
export const getApplicationDetailService = async (applicationId) => {
  try {
    const application = await JobApplication.findById(applicationId)
      .populate("job")
      .populate({
        path: "applicant",
        populate: { path: "userId", model: "User" },
      })
      .populate("reviewedBy", "firstName lastName email");

    if (!application) {
      return {
        success: false,
        message: "Application not found",
      };
    }

    // Get applicant's profile details
    const profile = await Profile.findOne({ userId: application.applicant.userId }).lean();

    return {
      success: true,
      data: {
        application,
        applicantProfile: profile,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch application details",
      error: error.message,
    };
  }
};

// Update application status
export const updateApplicationStatusService = async (
  applicationId,
  adminId,
  status,
  notes = ""
) => {
  try {
    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return {
        success: false,
        message: "Application not found",
      };
    }

    // Valid status transitions
    const validStatuses = [
      "pending",
      "reviewing",
      "shortlisted",
      "interview",
      "rejected",
      "accepted",
      "withdrawn",
    ];

    if (!validStatuses.includes(status)) {
      return {
        success: false,
        message: "Invalid status",
      };
    }

    // Update application
    application.status = status;
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    if (notes) {
      application.notes = notes;
    }

    await application.save();

    // Get applicant user for notification
    const profile = await Profile.findById(application.applicant);
    const user = await User.findById(profile.userId);

    // Create notification based on status
    const notificationTypes = {
      shortlisted: "job_shortlisted",
      rejected: "job_rejected",
      interview: "job_shortlisted",
      accepted: "job_shortlisted",
    };

    if (notificationTypes[status]) {
      await createNotificationService({
        user: user._id,
        type: notificationTypes[status],
        actor: adminId,
        targetType: "Job",
        targetId: application.job,
        metadata: {
          applicationId: application._id.toString(),
          status,
        },
      });
    }

    // Log activity
    await logAdminActivity(adminId, "update_application_status", "JobApplication", applicationId, {
      oldStatus: "pending",
      newStatus: status,
      notes,
    });

    return {
      success: true,
      message: "Application status updated successfully",
      data: application,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update application status",
      error: error.message,
    };
  }
};

// Add notes to application
export const addApplicationNoteService = async (applicationId, adminId, note) => {
  try {
    const application = await JobApplication.findByIdAndUpdate(
      applicationId,
      { notes: note },
      { new: true }
    );

    if (!application) {
      return {
        success: false,
        message: "Application not found",
      };
    }

    // Log activity
    await logAdminActivity(adminId, "add_note", "JobApplication", applicationId, {
      note,
    });

    return {
      success: true,
      message: "Note added successfully",
      data: application,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to add note",
      error: error.message,
    };
  }
};

// Calculate match score
export const calculateMatchScoreService = async (applicationId) => {
  try {
    const application = await JobApplication.findById(applicationId)
      .populate("job")
      .populate("applicant");

    if (!application) {
      return {
        success: false,
        message: "Application not found",
      };
    }

    const job = application.job;
    const profile = application.applicant;

    let score = 0;

    // Check skills match (max 40 points)
    const profileSkills = [
      ...profile.skills.technical,
      ...profile.skills.soft,
    ];
    const jobSkills = job.skills || [];
    const matchedSkills = profileSkills.filter((skill) =>
      jobSkills.some((jSkill) =>
        jSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    score += (matchedSkills.length / Math.max(jobSkills.length, 1)) * 40;

    // Check education match (max 30 points)
    if (profile.learningJourney?.educationLevel === job.education) {
      score += 30;
    }

    // Check experience match (max 20 points)
    const experienceYears = parseInt(profile.recentExperience?.experienceYears) || 0;
    const jobExperience = parseInt(job.experience) || 0;
    if (experienceYears >= jobExperience) {
      score += 20;
    }

    // Check location preference (max 10 points)
    if (profile.careerExpectations?.availability === job.workMode) {
      score += 10;
    }

    const finalScore = Math.min(100, Math.round(score));

    // Update match score
    application.matchScore = finalScore;
    await application.save();

    return {
      success: true,
      message: "Match score calculated",
      data: {
        matchScore: finalScore,
        breakdown: {
          skillsMatch: (matchedSkills.length / Math.max(jobSkills.length, 1)) * 40,
          educationMatch: profile.learningJourney?.educationLevel === job.education ? 30 : 0,
          experienceMatch: experienceYears >= jobExperience ? 20 : 0,
          locationMatch: profile.careerExpectations?.availability === job.workMode ? 10 : 0,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to calculate match score",
      error: error.message,
    };
  }
};

// Get application statistics
export const getApplicationStatsService = async () => {
  try {
    const totalApplications = await JobApplication.countDocuments();
    
    const applicationsByStatus = await JobApplication.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const avgMatchScore = await JobApplication.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$matchScore" },
        },
      },
    ]);

    // Top matching applications
    const topMatches = await JobApplication.find()
      .sort({ matchScore: -1 })
      .limit(10)
      .lean();

    // Applications in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentApplications = await JobApplication.countDocuments({
      appliedAt: { $gte: thirtyDaysAgo },
    });

    return {
      success: true,
      data: {
        totalApplications,
        applicationsByStatus,
        averageMatchScore: avgMatchScore[0]?.avgScore || 0,
        recentApplicationsLast30Days: recentApplications,
        topMatches,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch application statistics",
      error: error.message,
    };
  }
};

// Export applications
export const exportApplicationsService = async (filters = {}) => {
  try {
    const query = {};

    if (filters.status) query.status = filters.status;
    if (filters.jobId) query.job = filters.jobId;

    const applications = await JobApplication.find(query)
      .populate("job", "title company")
      .populate("applicant", "firstName lastName email")
      .lean();

    const exportData = applications.map((app) => ({
      applicationId: app._id,
      applicantName: app.applicant.firstName + " " + app.applicant.lastName,
      applicantEmail: app.applicant.email,
      jobTitle: app.job.title,
      company: app.job.company,
      status: app.status,
      matchScore: app.matchScore,
      appliedAt: app.appliedAt,
      reviewedAt: app.reviewedAt,
    }));

    return {
      success: true,
      data: exportData,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to export applications",
      error: error.message,
    };
  }
};
