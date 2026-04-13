
// services/admin/user.service.js
import User from '../../models/user.model.js';
import Profile from '../../models/profile.model.js';
import { getDateRange, } from '../../utils/dateHelpers.js'
import Member from "../../models/member.model.js";
import JobApplication from "../../models/jobApplication.model.js";

// Get all users with pagination and search
export const getAllUsersService = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  const query = {};
  if (filters.search) {
    query.$or = [
      { email: { $regex: filters.search, $options: 'i' } },
      { userName: { $regex: filters.search, $options: 'i' } },
      { firstName: { $regex: filters.search, $options: 'i' } },
      { lastName: { $regex: filters.search, $options: 'i' } }
    ];
  }
  if (filters.status) query.status = filters.status;
  if (filters.role) query.role = filters.role;

  const users = await User.find(query)
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const total = await User.countDocuments(query);

  // Attach profile data
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

// Get single user details
// export const getUserDetailService = async (userId) => {
//   const user = await User.findById(userId).select('-password').lean();
//   if (!user) return { success: false, message: 'User not found' };

//   const profile = await Profile.findOne({ userId }).lean();

//   return { success: true, data: { user, profile: profile || null } };
// };


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
  const totalUsers = await User.countDocuments();
  const verifiedUsers = await User.countDocuments({ emailVerified: true });
  const suspendedUsers = await User.countDocuments({ status: 'suspended' });
  const premiumUsers = await User.countDocuments({ isPremium: true });
  const activeUsers = await User.countDocuments({ status: 'active', isBlocked: false }); // adjust based on your fields

  // New users last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newUsersLast30Days = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

  // Active users last 24 hours (based on lastLogin)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeUsersLast24Hours = await User.countDocuments({ lastLogin: { $gte: twentyFourHoursAgo }, status: 'active' });

  return {
    success: true,
    data: {
      totalUsers,
      verifiedUsers,
      suspendedUsers,
      premiumUsers,
      activeUsers,
      newUsersLast30Days,
      activeUsersLast24Hours
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

