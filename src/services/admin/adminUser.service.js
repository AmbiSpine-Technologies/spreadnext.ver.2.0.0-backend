
// services/admin/user.service.js
import User from '../../models/user.model.js';
import Profile from '../../models/profile.model.js';
import { getDateRange, } from '../../utils/dateHelpers.js'
import Member from "../../models/member.model.js";
import JobApplication from "../../models/jobApplication.model.js";

// Get all users with pagination and search
// export const getAllUsersService = async (page = 1, limit = 20, filters = {}) => {
//   const skip = (page - 1) * limit;
//   const query = {};
//   if (filters.search) {
//     query.$or = [
//       { email: { $regex: filters.search, $options: 'i' } },
//       { userName: { $regex: filters.search, $options: 'i' } },
//       { firstName: { $regex: filters.search, $options: 'i' } },
//       { lastName: { $regex: filters.search, $options: 'i' } }
//     ];
//   }
//   if (filters.status) query.status = filters.status;
//   if (filters.role) query.role = filters.role;

//   const users = await User.find(query)
//     .select('-password')
//     .skip(skip)
//     .limit(limit)
//     .sort({ createdAt: -1 })
//     .lean();

//   const total = await User.countDocuments(query);

//   // Attach profile data
//   const usersWithProfile = await Promise.all(
//     users.map(async (user) => {
//       const profile = await Profile.findOne({ userId: user._id }).lean();
//       return { ...user, profile };
//     })
//   );

//   return {
//     success: true,
//     data: usersWithProfile,
//     pagination: { page, limit, total, pages: Math.ceil(total / limit) }
//   };
// };

// Helper to get date based on filter string


export const getAllUsersService = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  const query = {};

  // 1. Search Logic
  if (filters.search) {
    query.$or = [
      { email: { $regex: filters.search, $options: 'i' } },
      { userName: { $regex: filters.search, $options: 'i' } },
      { firstName: { $regex: filters.search, $options: 'i' } },
      { lastName: { $regex: filters.search, $options: 'i' } }
    ];
  }

  // 2. Status & Role Filters
  if (filters.status) query.status = filters.status;
  if (filters.role) query.role = filters.role;

  // 3. TIME FILTER (Yahan update kiya hai)
  // 'filter' frontend se '1d', '7d' etc. ke roop mein aayega
  if (filters.filter) {
    const startDate = getDateRange(filters.filter);
    if (startDate) {
      query.lastLogin = { $gte: startDate };
    }
  }

  const users = await User.find(query)
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ lastLogin: -1 }) // Login time ke hisaab se sort karein
    .lean();

  const total = await User.countDocuments(query);

  const usersWithProfile = await Promise.all(
    users.map(async (user) => {
      const profile = await Profile.findOne({ userId: user._id }).lean();
      return { ...user, profile };
    })
  );

  return {
    success: true,
    data: usersWithProfile,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

export const getUserDetailService = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password").lean();
    if (!user) return { success: false, message: "User not found" };

    // Get profile
    const profile = await Profile.findOne({ userId }).lean();

    // Get all memberships (organizations user is part of)
    const memberships = await Member.find({ userId })
      .populate("organizationId", "name email type isVerified")
      .sort({ createdAt: -1 })
      .lean();

    // Get job applications with full details
    const applications = await JobApplication.find({ applicantId: userId })
      .populate({
        path: "jobId",
        select: "title companyName companyId location employmentType salaryRange",
        populate: {
          path: "companyId",
          select: "name logo"
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Get activity timeline
    // const recentActivity = await getRecentActivity(userId);

    // Get statistics
    const stats = {
      totalApplications: await JobApplication.countDocuments({ applicantId: userId }),
      pendingApplications: await JobApplication.countDocuments({ 
        applicantId: userId, 
        status: 'pending' 
      }),
      acceptedApplications: await JobApplication.countDocuments({ 
        applicantId: userId, 
        status: 'accepted' 
      }),
      rejectedApplications: await JobApplication.countDocuments({ 
        applicantId: userId, 
        status: 'rejected' 
      }),
      activeMemberships: memberships.filter(m => m.status === 'active').length,
      totalMemberships: memberships.length,
      accountAgeDays: Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)),
      lastActiveDays: user.lastLogin ? Math.floor((Date.now() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24)) : null
    };

    return {
      success: true,
      data: {
        ...user,
        profile,
        memberships,
        applications,
        // recentActivity,
        stats
      }
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Suspend user
export const suspendUserService = async (userId, adminId, reason) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { status: 'suspended', suspensionReason: reason },
    { new: true }
  );
  if (!user) return { success: false, message: 'User not found' };
  // Log activity (optional)
  if (adminId) await logAdminActivity(adminId, 'suspend_user', 'User', userId, { reason });
  return { success: true, message: 'User suspended', data: user };
};

// Reactivate user
export const reactivateUserService = async (userId, adminId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { status: 'active', suspensionReason: null },
    { new: true }
  );
  if (!user) return { success: false, message: 'User not found' };
  if (adminId) await logAdminActivity(adminId, 'reactivate_user', 'User', userId);
  return { success: true, message: 'User reactivated', data: user };
};

// Delete user (hard delete)
export const deleteUserService = async (userId, adminId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) return { success: false, message: 'User not found' };
  await Profile.deleteOne({ userId });
  if (adminId) await logAdminActivity(adminId, 'delete_user', 'User', userId);
  return { success: true, message: 'User deleted' };
};

// Update user profile (admin edit)
export const updateUserProfileService = async (userId, adminId, updates) => {
  const profile = await Profile.findOneAndUpdate({ userId }, updates, { new: true, runValidators: true });
  if (!profile) return { success: false, message: 'Profile not found' };
  if (adminId) await logAdminActivity(adminId, 'edit_user_profile', 'User', userId, { changes: updates });
  return { success: true, message: 'Profile updated', data: profile };
};

// Promote user to admin (superAdmin only)
export const promoteToAdminService = async (userId, adminId) => {
  const user = await User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true }).select('-password');
  if (!user) return { success: false, message: 'User not found' };
  if (adminId) await logAdminActivity(adminId, 'promote_to_admin', 'User', userId);
  return { success: true, message: 'User promoted to admin', data: user };
};

// Demote admin to user (superAdmin only)
export const demoteToUserService = async (userId, adminId) => {
  const user = await User.findByIdAndUpdate(userId, { role: 'user' }, { new: true }).select('-password');
  if (!user) return { success: false, message: 'User not found' };
  if (adminId) await logAdminActivity(adminId, 'demote_to_user', 'User', userId);
  return { success: true, message: 'User demoted to regular user', data: user };
};

// Get user statistics (totals, active/inactive, new users over time)
export const getUserStatsService = async () => {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers, 
    verifiedUsers, 
    premiumUsers, 
    active24h, 
    active48h, 
    newUsers30d
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ emailVerified: true }),
    User.countDocuments({ isPremium: true }),
    // Active users based on timestamp (Not just string status)
    User.countDocuments({ lastLogin: { $gte: last24h }, isActive: { $ne: false } }),
    User.countDocuments({ lastLogin: { $gte: last48h }, isActive: { $ne: false } }),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
  ]);

  return {
    success: true,
    data: {
      totalUsers,
      verifiedUsers,
      premiumUsers,
      active24h, // Card: Active (24h)
      active48h, // Card: Active (48h)
      newUsersLast30Days: newUsers30d
    }
  };
};
// Get user registrations over time (for graph)
export const getUserRegistrationsOverTimeService = async (filter) => {
  const startDate = getDateRange(filter);
  if (!startDate) return { success: false, message: 'Invalid filter' };

  const data = await User.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const total = await User.countDocuments({ createdAt: { $gte: startDate } });
  return { success: true, data: { total, timeSeries: data, filter } };
};

export const getActiveUsersOverTimeService = async (filter) => {
  const startDate = getDateRange(filter);
  
  // LOG THIS: See if startDate is actually a valid Date object
  console.log("Filtering from:", startDate); 

  const data = await User.aggregate([
    { 
      $match: { 
        lastLogin: { $gte: startDate },
        // Temporarily comment this out to see if it's the cause
        // status: 'active' 
      } 
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastLogin' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);


  const total = data.reduce((acc, curr) => acc + curr.count, 0);
  return { success: true, data: { total, timeSeries: data, filter } };
};

export const getJourneyTypeStatsService = async () => {
  try {
    // Aggregate from Profile collection
    const result = await Profile.aggregate([
      { $match: { "personalInfo.journeyType": { $ne: null, $ne: "" } } },
      { $group: { _id: "$personalInfo.journeyType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log("result journy type", result);
    return result;
  } catch (error) {
    console.error("Journey stats error:", error);
    return [];
  }
};
// Export users as CSV
export const exportUsersService = async () => {
  const users = await User.find().select('-password').lean();
  const profiles = await Profile.find().lean();
  const exportData = users.map(user => {
    const profile = profiles.find(p => p.userId.toString() === user._id.toString());
    return {
      userId: user._id,
      email: user.email,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      isPremium: user.isPremium,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      journeyType: profile?.personalInfo?.journeyType || 'N/A'
    };
  });
  return { success: true, data: exportData };
};

