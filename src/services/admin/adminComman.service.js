import Company from "../../models/company.model.js";

// Get organization statistics
export const getOrgStatsService = async () => {
  try {
    const totalCompanies = await Company.countDocuments();
    const verifiedCompanies = await Company.countDocuments({ isVerified: true });
    const activeCompanies = await Company.countDocuments({ isActive: true });

    const totalColleges = await College.countDocuments();
    const verifiedColleges = await College.countDocuments({ isVerified: true });
    const activeColleges = await College.countDocuments({ isActive: true });

    // Companies by size
    const companiesBySize = await Company.aggregate([
      {
        $group: {
          _id: "$orgSize",
          count: { $sum: 1 },
        },
      },
    ]);

    // Colleges by type
    const collegesByType = await College.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      success: true,
      data: {
        companies: {
          total: totalCompanies,
          verified: verifiedCompanies,
          active: activeCompanies,
          bySize: companiesBySize,
        },
        colleges: {
          total: totalColleges,
          verified: verifiedColleges,
          active: activeColleges,
          byType: collegesByType,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch organization statistics",
      error: error.message,
    };
  }
};
