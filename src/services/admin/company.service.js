import { getDateRange, getTimeSeries } from '../../utils/dateHelpers.js';
import Company from "../../models/company.model.js";

// Get all companies
export const getAllCompaniesAdminService = async (page = 1, limit = 20, filters = {}) => {
  try {
    const skip = (page - 1) * limit;
    const query = {};

    // Search
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
      ];
    }

    // Filter by verification status
    if (filters.verified !== undefined) {
      query.isVerified = filters.verified === "true" || filters.verified === true;
    }

    // Filter by active status
    if (filters.active !== undefined) {
      query.isActive = filters.active === "true" || filters.active === true;
    }

    const companies = await Company.find(query)
      .populate("createdBy", "firstName lastName email")
      .populate("admins", "firstName lastName email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Company.countDocuments(query);

    return {
      success: true,
      data: companies,
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
      message: "Failed to fetch companies",
      error: error.message,
    };
  }
};

// Get company detail
export const getCompanyDetailService = async (companyId) => {
  try {
    const company = await Company.findById(companyId)
      .populate("createdBy", "firstName lastName email")
      .populate("admins", "firstName lastName email")
      .lean();

    if (!company) {
      return {
        success: false,
        message: "Company not found",
      };
    }

    return {
      success: true,
      data: company,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch company details",
      error: error.message,
    };
  }
};

// Verify company
export const verifyCompanyService = async (companyId, adminId, verified = true) => {
  try {
    const company = await Company.findByIdAndUpdate(
      companyId,
      { isVerified: verified },
      { new: true }
    );

    if (!company) {
      return {
        success: false,
        message: "Company not found",
      };
    }

    // Log activity
    await logAdminActivity(
      adminId,
      verified ? "verify_company" : "unverify_company",
      "Company",
      companyId,
      {
        verified,
      }
    );

    return {
      success: true,
      message: `Company ${verified ? "verified" : "unverified"} successfully`,
      data: company,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update company verification",
      error: error.message,
    };
  }
};

// Suspend company
export const suspendCompanyService = async (companyId, adminId, reason = "") => {
  try {
    const company = await Company.findByIdAndUpdate(
      companyId,
      { isActive: false },
      { new: true }
    );

    if (!company) {
      return {
        success: false,
        message: "Company not found",
      };
    }

    // Log activity
    await logAdminActivity(adminId, "suspend_company", "Company", companyId, {
      reason,
      suspendedAt: new Date(),
    });

    return {
      success: true,
      message: "Company suspended successfully",
      data: company,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to suspend company",
      error: error.message,
    };
  }
};

// Reactivate company
export const reactivateCompanyService = async (companyId, adminId) => {
  try {
    const company = await Company.findByIdAndUpdate(
      companyId,
      { isActive: true },
      { new: true }
    );

    if (!company) {
      return {
        success: false,
        message: "Company not found",
      };
    }

    // Log activity
    await logAdminActivity(adminId, "reactivate_company", "Company", companyId, {
      reactivatedAt: new Date(),
    });

    return {
      success: true,
      message: "Company reactivated successfully",
      data: company,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to reactivate company",
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


// Update company (admin edit)
export const updateCompanyService = async (companyId, adminId, updates) => {
  try {
    const company = await Company.findByIdAndUpdate(companyId, updates, {
      new: true,
      runValidators: true,
    });

    if (!company) {
      return {
        success: false,
        message: "Company not found",
      };
    }

    // Log activity
    await logAdminActivity(adminId, "edit_company", "Company", companyId, {
      changes: updates,
    });

    return {
      success: true,
      message: "Company updated successfully",
      data: company,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update company",
      error: error.message,
    };
  }
};

export const getCompanyRegistrationsOverTimeService = async (filter) => {
  const startDate = getDateRange(filter);
  return getTimeSeries(Company, 'createdAt', startDate);
};

export const getCompanyVerificationStatsService = async () => {
  const verified = await Company.countDocuments({ isVerified: true });
  const unverified = await Company.countDocuments({ isVerified: false });
  return [
    { _id: "Verified", count: verified },
    { _id: "Unverified", count: unverified }
  ];
};