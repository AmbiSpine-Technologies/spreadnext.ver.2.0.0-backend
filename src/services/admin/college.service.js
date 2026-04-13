import { getDateRange, getTimeSeries } from '../../utils/dateHelpers.js';
import College from "../../models/college.model.js";

// ============= COLLEGE MANAGEMENT =============

// Get all colleges
export const getAllCollegesAdminService = async (page = 1, limit = 20, filters = {}) => {
  try {
    const skip = (page - 1) * limit;
    const query = {};

    // Search
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
        { city: { $regex: filters.search, $options: "i" } },
      ];
    }

    // Filter by type
    if (filters.type) {
      query.type = filters.type;
    }

    // Filter by verification status
    if (filters.verified !== undefined) {
      query.isVerified = filters.verified === "true" || filters.verified === true;
    }

    // Filter by active status
    if (filters.active !== undefined) {
      query.isActive = filters.active === "true" || filters.active === true;
    }

    const colleges = await College.find(query)
      .populate("createdBy", "firstName lastName email")
      .populate("admins", "firstName lastName email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await College.countDocuments(query);

    return {
      success: true,
      data: colleges,
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
      message: "Failed to fetch colleges",
      error: error.message,
    };
  }
};

// Get college detail
export const getCollegeDetailService = async (collegeId) => {
  try {
    const college = await College.findById(collegeId)
      .populate("createdBy", "firstName lastName email")
      .populate("admins", "firstName lastName email")
      .lean();

    if (!college) {
      return {
        success: false,
        message: "College not found",
      };
    }

    return {
      success: true,
      data: college,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch college details",
      error: error.message,
    };
  }
};

// Verify college
export const verifyCollegeService = async (collegeId, adminId, verified = true) => {
  try {
    const college = await College.findByIdAndUpdate(
      collegeId,
      { isVerified: verified },
      { new: true }
    );

    if (!college) {
      return {
        success: false,
        message: "College not found",
      };
    }

    // Log activity
    await logAdminActivity(
      adminId,
      verified ? "verify_college" : "unverify_college",
      "College",
      collegeId,
      {
        verified,
      }
    );

    return {
      success: true,
      message: `College ${verified ? "verified" : "unverified"} successfully`,
      data: college,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update college verification",
      error: error.message,
    };
  }
};

// Suspend college
export const suspendCollegeService = async (collegeId, adminId, reason = "") => {
  try {
    const college = await College.findByIdAndUpdate(
      collegeId,
      { isActive: false },
      { new: true }
    );

    if (!college) {
      return {
        success: false,
        message: "College not found",
      };
    }

    // Log activity
    await logAdminActivity(adminId, "suspend_college", "College", collegeId, {
      reason,
      suspendedAt: new Date(),
    });

    return {
      success: true,
      message: "College suspended successfully",
      data: college,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to suspend college",
      error: error.message,
    };
  }
};

// Reactivate college
export const reactivateCollegeService = async (collegeId, adminId) => {
  try {
    const college = await College.findByIdAndUpdate(
      collegeId,
      { isActive: true },
      { new: true }
    );

    if (!college) {
      return {
        success: false,
        message: "College not found",
      };
    }

    // Log activity
    await logAdminActivity(adminId, "reactivate_college", "College", collegeId, {
      reactivatedAt: new Date(),
    });

    return {
      success: true,
      message: "College reactivated successfully",
      data: college,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to reactivate college",
      error: error.message,
    };
  }
};

// Update college (admin edit)
export const updateCollegeService = async (collegeId, adminId, updates) => {
  try {
    const college = await College.findByIdAndUpdate(collegeId, updates, {
      new: true,
      runValidators: true,
    });

    if (!college) {
      return {
        success: false,
        message: "College not found",
      };
    }

    // Log activity
    await logAdminActivity(adminId, "edit_college", "College", collegeId, {
      changes: updates,
    });

    return {
      success: true,
      message: "College updated successfully",
      data: college,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update college",
      error: error.message,
    };
  }
};


export const getCollegeRegistrationsOverTimeService = async (filter) => {
  const startDate = getDateRange(filter);
  return getTimeSeries(College, 'createdAt', startDate);
};

export const getCollegeStatusStatsService = async () => {
  const active = await College.countDocuments({ isActive: true });
  const suspended = await College.countDocuments({ isActive: false });
  return [
    { _id: "Active", count: active },
    { _id: "Suspended", count: suspended }
  ];
};

export const getCollegeVerificationStats = async () => {
  const verified = await College.countDocuments({ isVerified: true });
  const unverified = await College.countDocuments({ isVerified: false });
  return [
    { _id: "Verified", count: verified },
    { _id: "Unverified", count: unverified }
  ];
};
