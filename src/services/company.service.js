import Company from "../models/company.model.js";
import { MSG } from "../constants/messages.js";
import Profile from "../models/profile.model.js"
import Connection from '../models/connection.model.js'

export const createCompanyService = async (companyData, userId) => {
  try {
    
    // Check if company with same email already exists
    const existingCompany = await Company.findOne({ email: companyData.email });
    if (existingCompany) {
      return {
        success: false,
        message: MSG.COMPANY.ALREADY_EXISTS,
      };
    }

    const company = await Company.create({
      ...companyData,
      createdBy: userId,
      admins: [userId], // Creator is also an admin
    });

    const populatedCompany = await Company.findById(company._id).populate(
      "createdBy",
      "userName email firstName lastName"
    );

    return {
      success: true,
      message: MSG.COMPANY.CREATE_SUCCESS,
      data: populatedCompany,
    };
  } catch (error) {
    throw error;
  }
};

export const getCompanyByIdService = async (companyId) => {
  try {
    const company = await Company.findById(companyId)
      .populate("createdBy", "userName email firstName lastName")
      .populate("admins", "userName email firstName lastName");

    if (!company) {
      return {
        success: false,
        message: MSG.COMPANY.NOT_FOUND,
      };
    }

    return {
      success: true,
      message: MSG.COMPANY.FETCH_SINGLE_SUCCESS,
      data: company,
    };
  } catch (error) {
    throw error;
  }
};

export const updateCompanyService = async (companyId, userId, updateData) => {
  try {
    const company = await Company.findById(companyId);

    if (!company) {
      return {
        success: false,
        message: MSG.COMPANY.NOT_FOUND,
      };
    }

    // Check if user is creator or admin
    const isAdmin =
      company.createdBy.toString() === userId.toString() ||
      company.admins.some((adminId) => adminId.toString() === userId.toString());

    if (!isAdmin) {
      return {
        success: false,
        message: MSG.COMPANY.UNAUTHORIZED,
      };
    }

    // If email is being updated, check if it's already taken
    if (updateData.email && updateData.email !== company.email) {
      const existingCompany = await Company.findOne({ email: updateData.email });
      if (existingCompany) {
        return {
          success: false,
          message: MSG.COMPANY.ALREADY_EXISTS,
        };
      }
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "userName email firstName lastName")
      .populate("admins", "userName email firstName lastName");

    return {
      success: true,
      message: MSG.COMPANY.UPDATE_SUCCESS,
      data: updatedCompany,
    };
  } catch (error) {
    throw error;
  }
};

export const deleteCompanyService = async (companyId, userId) => {
  try {
    const company = await Company.findById(companyId);

    if (!company) {
      return {
        success: false,
        message: MSG.COMPANY.NOT_FOUND,
      };
    }

    // Only creator can delete company
    if (company.createdBy.toString() !== userId.toString()) {
      return {
        success: false,
        message: MSG.COMPANY.UNAUTHORIZED,
      };
    }

    await Company.findByIdAndDelete(companyId);

    return {
      success: true,
      message: MSG.COMPANY.DELETE_SUCCESS,
    };
  } catch (error) {
    throw error;
  }
};

export const getMyCompaniesService = async (userId, pagination = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = pagination;

    const skip = (page - 1) * limit;
    const sortOrder = order === "desc" ? -1 : 1;

    // Get companies where user is creator or admin
    const companies = await Company.find({
      $or: [{ createdBy: userId }, { admins: userId }],
    })
      .populate("createdBy", "userName email firstName lastName")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Company.countDocuments({
      $or: [{ createdBy: userId }, { admins: userId }],
    });

    return {
      success: true,
      message: MSG.COMPANY.FETCH_SUCCESS,
      data: companies,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

export const getAllCompaniesService = async (filters = {}, pagination = {}) => {
  try {
    const { search, industry, location, isVerified } = filters;

    const {
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      order = "desc",
    } = pagination;

    const query = { isActive: true };

    // Search in name, industry, description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (industry) {
      query.industry = { $regex: industry, $options: "i" };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (isVerified !== undefined) {
      query.isVerified = isVerified === "true";
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOrder = order === "desc" ? -1 : 1;

    const companies = await Company.find(query)
      .populate("createdBy", "userName email firstName lastName")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Company.countDocuments(query);

    return {
      success: true,
      message: MSG.COMPANY.FETCH_SUCCESS,
      data: companies,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};


export const getAllWithoutFilterCompaniesService = async () => {
  try {
    const companies = await Company.find({}) // ❌ koi filter nahi
      .populate("createdBy", "userName email firstName lastName")
      .populate("admins", "userName email firstName lastName")
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: MSG.COMPANY?.FETCH_ALL_SUCCESS || "All companies fetched successfully",
      data: companies,
      count: companies.length,
    };
  } catch (error) {
    throw error;
  }
};




// src/services/company.service.js
export const getCompanySuggestionsService = async (userId, limit = 10) => {
  try {
    const profile = await Profile.findOne({ userId }).lean();

    // Just like in Friend Suggestions, we check who the user is already following
    const following = await Connection.find({ follower: userId }).select("following");
    
    // Create a list of IDs (Users + Companies) that are already followed
    const followingIds = following.map((c) => c.following.toString());

    let scoredResults = [];

    // Only run scoring logic if profile exists
    if (profile) {
      // followedCompanies = profile.followedCompanies || [];

      const industryPref = profile.careerExpectations?.industry;
      const locationPref = profile.jobAlertPreferences?.locationPreference;
      const interests = profile.interestsAndPreferences?.communityInterestClusters || [];

      const companies = await Company.find({
        isActive: true,
        _id: { $nin: followingIds },
      }).select("name logo tagline industry orgType location followers isVerified createdAt").lean();

      const scored = companies.map((company) => {
        let score = 0;
        if (industryPref && company.industry?.toLowerCase().includes(industryPref.toLowerCase())) score += 4;
        if (interests.some((i) => company.industry?.toLowerCase().includes(i.toLowerCase()))) score += 3;
        if (locationPref && company.location?.toLowerCase().includes(locationPref.toLowerCase())) score += 2;
        score += Math.min((company.followers || 0) / 100, 5);
        if (company.isVerified) score += 1.5;
        return { company, score };
      });

      scoredResults = scored.filter((c) => c.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
    }

    // 6️⃣ Fallback (Runs if no profile OR not enough scored results)
    if (scoredResults.length < limit) {
      const usedIds = scoredResults.map((r) => r.company._id);
      const excludeIds = [...followingIds, ...usedIds];

      const fallback = await Company.find({
        isActive: true,
        _id: { $nin: excludeIds },
      })
        .sort({ followers: -1 }) // Show popular companies
        .limit(limit - scoredResults.length)
        .lean();

      fallback.forEach((company) => {
        scoredResults.push({ company, score: 0 });
      });
    }

    return { success: true, count: scoredResults.length, data: scoredResults };
  } catch (error) {
    console.error("SERVICE ERROR:", error);
    return { success: false, message: "Suggestion failed", data: [] };
  }
};
