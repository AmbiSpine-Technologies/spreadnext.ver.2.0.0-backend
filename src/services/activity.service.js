import Activity from "../models/activity.model.js";

// Create activity
export const createActivityService = async (data) => {
  try {
    const activity = await Activity.create(data);
    return {
      success: true,
      data: activity,
    };
  } catch (error) {
    console.error("CREATE ACTIVITY ERROR:", error);
    return {
      success: false,
      message: "Failed to create activity",
      error: error.message,
    };
  }
};

// Get user activities
export const getActivitiesService = async (userId, filters = {}, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const query = { user: userId };

    if (filters.type) {
      query.type = filters.type;
    }

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Activity.countDocuments(query);

    return {
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET ACTIVITIES ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch activities",
      error: error.message,
    };
  }
};

// Get activities by type
export const getActivitiesByTypeService = async (userId, type, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const activities = await Activity.find({
      user: userId,
      type,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Activity.countDocuments({
      user: userId,
      type,
    });

    return {
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET ACTIVITIES BY TYPE ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch activities",
      error: error.message,
    };
  }
};









