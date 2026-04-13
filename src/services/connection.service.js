import Connection from "../models/connection.model.js";
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";

// Follow user
export const followUserService = async (targetUserId, userId) => {
  try {
    if (targetUserId.toString() === userId.toString()) {
      return {
        success: false,
        message: "You cannot follow yourself",
      };
    }

    // Check if already following
    const existing = await Connection.findOne({
      follower: userId,
      following: targetUserId,
    });

    if (existing) {
      if (existing.status === "blocked") {
        return {
          success: false,
          message: "You cannot follow this user",
        };
      }
      return {
        success: false,
        message: "Already following this user",
      };
    }

    await Connection.create({
      follower: userId,
      following: targetUserId,
      status: "accepted", // Can be changed to "pending" if approval required
    });

    return {
      success: true,
      message: "followed successfully",
    };
  } catch (error) {
    console.error("FOLLOW USER ERROR:", error);
    if (error.code === 11000) {
      return {
        success: false,
        message: "Already following this user",
      };
    }
    return {
      success: false,
      message: "Failed to follow",
      error: error.message,
    };
  }
};

// Unfollow user
export const unfollowUserService = async (targetUserId, userId) => {
  try {
    const connection = await Connection.findOneAndDelete({
      follower: userId,
      following: targetUserId,
    });

    if (!connection) {
      return {
        success: false,
        message: "Not following this user",
      };
    }

    return {
      success: true,
      message: "User unfollowed successfully",
    };
  } catch (error) {
    console.error("UNFOLLOW USER ERROR:", error);
    return {
      success: false,
      message: "Failed to unfollow user",
      error: error.message,
    };
  }
};

// Get followers
export const getFollowersService = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const connections = await Connection.find({
      following: userId,
      status: "accepted",
    })
      .populate("follower", "firstName lastName userName email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Connection.countDocuments({
      following: userId,
      status: "accepted",
    });

    return {
      success: true,
      data: connections.map((c) => ({
        ...c.follower,
        followedAt: c.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET FOLLOWERS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch followers",
      error: error.message,
    };
  }
};

// Get following
export const getFollowingService = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const connections = await Connection.find({
      follower: userId,
      status: "accepted",
    })
      .populate("following", "firstName lastName userName email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Connection.countDocuments({
      follower: userId,
      status: "accepted",
    });

    return {
      success: true,
      data: connections.map((c) => ({
        ...c.following,
        followedAt: c.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET FOLLOWING ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch following",
      error: error.message,
    };
  }
};

// Check connection status
export const checkConnectionService = async (targetUserId, userId) => {
  try {
    const connection = await Connection.findOne({
      follower: userId,
      following: targetUserId,
    });

    return {
      success: true,
      data: {
        isFollowing: !!connection && connection.status === "accepted",
        isPending: !!connection && connection.status === "pending",
        isBlocked: !!connection && connection.status === "blocked",
      },
    };
  } catch (error) {
    console.error("CHECK CONNECTION ERROR:", error);
    return {
      success: false,
      message: "Failed to check connection",
      error: error.message,
    };
  }
};

// // Get friend suggestions
// export const getFriendSuggestionsService = async (userId, limit = 10) => {
//   try {
//     // Get users that current user is following
//     const following = await Connection.find({ follower: userId }).select("following");
//     const followingIds = following.map((c) => c.following.toString());
//     followingIds.push(userId.toString());

//     // Get users that follow the people current user follows (friends of friends)
//     const friendsOfFriends = await Connection.find({
//       follower: { $in: following.map((c) => c.following) },
//       following: { $nin: followingIds },
//       status: "accepted",
//     })
//       .populate("following", "firstName lastName userName email profileImage")
//       .limit(limit * 2)
//       .lean();

//     // Get mutual connections count
//     const suggestions = {};
//     friendsOfFriends.forEach((conn) => {
//       const userIdStr = conn.following._id.toString();
//       if (!suggestions[userIdStr]) {
//         suggestions[userIdStr] = {
//           user: conn.following,
//           mutualConnections: 1,
//         };
//       } else {
//         suggestions[userIdStr].mutualConnections += 1;
//       }
//     });

//     // Sort by mutual connections and return top suggestions
//     const sortedSuggestions = Object.values(suggestions)
//       .sort((a, b) => b.mutualConnections - a.mutualConnections)
//       .slice(0, limit);

//     // If not enough suggestions, add random users
//     if (sortedSuggestions.length < limit) {
//       const randomUsers = await User.find({
//         _id: { $nin: followingIds },
//       })
//         .select("firstName lastName userName email profileImage")
//         .limit(limit - sortedSuggestions.length)
//         .lean();

//       randomUsers.forEach((user) => {
//         sortedSuggestions.push({
//           user,
//           mutualConnections: 0,
//         });
//       });
//     }

//     return {
//       success: true,
//       data: sortedSuggestions,
//     };
//   } catch (error) {
//     console.error("GET FRIEND SUGGESTIONS ERROR:", error);
//     return {
//       success: false,
//       message: "Failed to fetch suggestions",
//       error: error.message,
//     };
//   }
// };



export const getFriendSuggestionsService = async (userId, limit = 10) => {
  try {
    const following = await Connection.find({ follower: userId }).select("following");
    const followingIds = following.map((c) => c.following.toString());
    followingIds.push(userId.toString());

    const friendsOfFriends = await Connection.find({
      follower: { $in: following.map((c) => c.following) },
      following: { $nin: followingIds },
      status: "accepted",
    })
      // UPDATE 1: User details ke saath 'profile' virtual ko populate karein
      .populate({
        path: "following",
        select: "firstName lastName userName email headline",
        populate: { path: "profile" } // User ke andar profile details laane ke liye
      })
      .limit(limit * 2)
      .lean();

    const suggestions = {};
    friendsOfFriends.forEach((conn) => {
      if (conn.following) {
        const userIdStr = conn.following._id.toString();
        if (!suggestions[userIdStr]) {
          suggestions[userIdStr] = {
            user: conn.following,
            mutualConnections: 1,
          };
        } else {
          suggestions[userIdStr].mutualConnections += 1;
        }
      }
    });

    const sortedSuggestions = Object.values(suggestions)
      .sort((a, b) => b.mutualConnections - a.mutualConnections)
      .slice(0, limit);

    if (sortedSuggestions.length < limit) {
      // UPDATE 2: Random users fetch karte waqt bhi profile populate karein
      const randomUsers = await User.find({
        _id: { $nin: followingIds },
      })
        .select("firstName lastName userName email headline")
        .populate("profile") // Profile details (image, bio etc.) yahan se aayengi
        .limit(limit - sortedSuggestions.length)
        .lean();

      randomUsers.forEach((user) => {
        sortedSuggestions.push({
          user,
          mutualConnections: 0,
        });
      });
    }

    return { success: true, data: sortedSuggestions };
  } catch (error) {
    console.error("GET FRIEND SUGGESTIONS ERROR:", error);
    return { success: false, message: "Failed to fetch suggestions", error: error.message };
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
      .select("firstName lastName userName email profileImage")
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









