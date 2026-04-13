import College from "../models/college.model.js";
import { MSG } from "../constants/messages.js";

export const createCollegeService = async (collegeData, userId) => {
  try {
    const existingCollege = await College.findOne({ email: collegeData.email });
    if (existingCollege) {
      return {
        success: false,
        message: MSG.COLLEGE.ALREADY_EXISTS,
      };
    }

    const college = await College.create({
      ...collegeData,
      createdBy: userId,
      admins: [userId],
    });

    const populatedCollege = await College.findById(college._id).populate(
      "createdBy",
      "userName email firstName lastName"
    );

    return {
      success: true,
      message: MSG.COLLEGE.CREATE_SUCCESS,
      data: populatedCollege,
    };
  } catch (error) {
    throw error;
  }
};

export const getAllCollegesService = async () => {
  try {
    const colleges = await College.find({ isActive: true })
      .populate("createdBy", "userName email firstName lastName")
      .populate("admins", "userName email firstName lastName")
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: MSG.COLLEGE.FETCH_ALL_SUCCESS,
      data: colleges,
      count: colleges.length,
    };
  } catch (error) {
    throw error;
  }
};


export const getCollegeByIdService = async (collegeId) => {
  try {
    const college = await College.findById(collegeId)
      .populate("createdBy", "userName email firstName lastName")
      .populate("admins", "userName email firstName lastName");

    if (!college) {
      return {
        success: false,
        message: MSG.COLLEGE.NOT_FOUND,
      };
    }

    return {
      success: true,
      message: MSG.COLLEGE.FETCH_SINGLE_SUCCESS,
      data: college,
    };
  } catch (error) {
    throw error;
  }
};

export const updateCollegeService = async (collegeId, userId, updateData) => {
  try {
    const college = await College.findById(collegeId);

    if (!college) {
      return {
        success: false,
        message: MSG.COLLEGE.NOT_FOUND,
      };
    }

    const isAdmin =
      college.createdBy.toString() === userId.toString() ||
      college.admins.some((adminId) => adminId.toString() === userId.toString());

    if (!isAdmin) {
      return {
        success: false,
        message: MSG.COLLEGE.UNAUTHORIZED,
      };
    }

    if (updateData.email && updateData.email !== college.email) {
      const existingCollege = await College.findOne({ email: updateData.email });
      if (existingCollege) {
        return {
          success: false,
          message: MSG.COLLEGE.ALREADY_EXISTS,
        };
      }
    }

    const updatedCollege = await College.findByIdAndUpdate(
      collegeId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "userName email firstName lastName")
      .populate("admins", "userName email firstName lastName");

    return {
      success: true,
      message: MSG.COLLEGE.UPDATE_SUCCESS,
      data: updatedCollege,
    };
  } catch (error) {
    throw error;
  }
};

export const getMyCollegesService = async (userId, pagination = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = pagination;

    const skip = (page - 1) * limit;
    const sortOrder = order === "desc" ? -1 : 1;

    const colleges = await College.find({
      $or: [{ createdBy: userId }, { admins: userId }],
    })
      .populate("createdBy", "userName email firstName lastName")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await College.countDocuments({
      $or: [{ createdBy: userId }, { admins: userId }],
    });

    return {
      success: true,
      message: MSG.COLLEGE.FETCH_SUCCESS,
      data: colleges,
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


