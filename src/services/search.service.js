import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import Community from "../models/community.model.js";
import Profile from "../models/profile.model.js";
import Company from "../models/company.model.js";
import College from "../models/college.model.js";
// Global search
export const globalSearchService = async (query, filters = {}, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const results = {
      users: [],
      posts: [],
      jobs: [],
      communities: [],
      companies: [], // New
      colleges: [],  // New
    };

    // Search users
    if (!filters.type || filters.type === "users") {
      const users = await Profile.find({
        $or: [
          { "personalInfo.firstName": { $regex: query, $options: "i" } },
          { "personalInfo.lastName": { $regex: query, $options: "i" } },
          { "personalInfo.userName": { $regex: query, $options: "i" } },
        ],
      })
        .select("personalInfo.firstName personalInfo.lastName personalInfo.email personalInfo.userName  personalInfo.profileImage personalInfo.headline ")
        .limit(limit)
        .lean();
      results.users = users;
    }

    // 2. Search Companies
    if (!filters.type || filters.type === "companies") {
      results.companies = await Company.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { industry: { $regex: query, $options: "i" } }
        ],
        isActive: true
      })
      .select("name logo tagline industry location followers")
      .limit(limit)
      .lean();
    }

    // 3. Search Colleges
    if (!filters.type || filters.type === "colleges") {
      results.colleges = await College.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { city: { $regex: query, $options: "i" } }
        ],
        isActive: true
      })
      .select("name logo tagline type city followers")
      .limit(limit)
      .lean();
    }

    // Search posts
    if (!filters.type || filters.type === "posts") {
      const posts = await Post.find({
        $text: { $search: query },
        isDeleted: false,
      })
        .populate("author", "firstName lastName userName email profileImage")
        .limit(limit)
        .lean();
      results.posts = posts;
    }

    // Search jobs
    if (!filters.type || filters.type === "jobs") {
      const jobs = await Job.find({
        $text: { $search: query },
        isActive: true,
      })
        .populate("postedBy", "firstName lastName userName")
        .limit(limit)
        .lean();
      results.jobs = jobs;
    }

    // Search communities
    if (!filters.type || filters.type === "communities") {
      const communities = await Community.find({
        $text: { $search: query },
        isActive: true,
      })
        .populate("creator", "firstName lastName userName email profileImage")
        .limit(limit)
        .lean();
      results.communities = communities;
    }

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("GLOBAL SEARCH ERROR:", error);
    return {
      success: false,
      message: "Failed to perform search",
      error: error.message,
    };
  }
};

// Search users
export const searchUsersService = async (query, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { userName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("firstName lastName userName email profileImage headline")
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { userName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    });

    return {
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("SEARCH USERS ERROR:", error);
    return {
      success: false,
      message: "Failed to search users",
      error: error.message,
    };
  }
};

// Search posts
export const searchPostsService = async (query, filters = {}, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const searchQuery = {
      $text: { $search: query },
      isDeleted: false,
    };

    if (filters.author) {
      searchQuery.author = filters.author;
    }

    if (filters.tags && filters.tags.length > 0) {
      searchQuery.tags = { $in: filters.tags };
    }

    const posts = await Post.find(searchQuery)
      .populate("author", "firstName lastName userName email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(searchQuery);

    return {
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("SEARCH POSTS ERROR:", error);
    return {
      success: false,
      message: "Failed to search posts",
      error: error.message,
    };
  }
};

// Search jobs
export const searchJobsService = async (query, filters = {}, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const searchQuery = {
      $text: { $search: query },
      isActive: true,
    };

    if (filters.location) {
      searchQuery.location = { $regex: filters.location, $options: "i" };
    }

    if (filters.workMode) {
      searchQuery.workMode = filters.workMode;
    }

    if (filters.jobType) {
      searchQuery.jobType = filters.jobType;
    }

    const jobs = await Job.find(searchQuery)
      .populate("postedBy", "firstName lastName userName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Job.countDocuments(searchQuery);

    return {
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("SEARCH JOBS ERROR:", error);
    return {
      success: false,
      message: "Failed to search jobs",
      error: error.message,
    };
  }
};

// Search communities
export const searchCommunitiesService = async (query, filters = {}, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const searchQuery = {
      $text: { $search: query },
      isActive: true,
    };

    if (filters.privacy) {
      searchQuery.privacy = filters.privacy;
    }

    if (filters.category) {
      searchQuery.category = filters.category;
    }

    const communities = await Community.find(searchQuery)
      .populate("creator", "firstName lastName userName email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Community.countDocuments(searchQuery);

    return {
      success: true,
      data: communities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("SEARCH COMMUNITIES ERROR:", error);
    return {
      success: false,
      message: "Failed to search communities",
      error: error.message,
    };
  }
};



// Search Colleges Service
export const searchCollegesService = async (query, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }
      ],
      isActive: true
    };

    const colleges = await College.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ followers: -1 })
      .lean();

    const total = await College.countDocuments(searchQuery);

    return {
      success: true,
      data: colleges,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  } catch (error) {
    return { success: false, message: "Failed to search colleges", error: error.message };
  }
};

// Search Companies Service
export const searchCompaniesService = async (query, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { industry: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } }
      ],
      isActive: true
    };

    const companies = await Company.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ followers: -1 })
      .lean();

    const total = await Company.countDocuments(searchQuery);

    return {
      success: true,
      data: companies,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  } catch (error) {
    return { success: false, message: "Failed to search companies", error: error.message };
  }
};





