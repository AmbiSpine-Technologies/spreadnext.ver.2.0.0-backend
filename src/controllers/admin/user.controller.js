// controllers/admin/user.controller.js
import * as userService from '../../services/admin/adminUser.service.js';

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, role } = req.query;
    const result = await userService.getAllUsersService(parseInt(page), parseInt(limit), { search, status, role });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await userService.getUserDetailService(userId);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const result = await userService.suspendUserService(userId, req.user._id, reason);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await userService.reactivateUserService(userId, req.user._id);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await userService.deleteUserService(userId, req.user._id);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await userService.updateUserProfileService(userId, req.user._id, req.body);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await userService.promoteToAdminService(userId, req.user._id);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const demoteToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await userService.demoteToUserService(userId, req.user._id);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const result = await userService.getUserStatsService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// New: registrations over time with filter
export const getUserRegistrationsOverTime = async (req, res) => {
  try {
    const { filter = '1week' } = req.query;
    const result = await userService.getUserRegistrationsOverTimeService(filter);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// New: active users over time with filter
export const getActiveUsersOverTime = async (req, res) => {
  try {
    // Frontend sends '7d', '1d', etc. 
    const { filter = '7d' } = req.query; 
    const result = await userService.getActiveUsersOverTimeService(filter);
    
    // Ensure we always return the structure the frontend expects
    return res.status(200).json({
      success: true,
      data: result.data || { total: 0, timeSeries: [] }
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getJourneyTypeStats = async (req, res) => {
  try {
    const data = await userService.getJourneyTypeStatsService();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const exportUsers = async (req, res) => {
  try {
    const result = await userService.exportUsersService();
    if (!result.success) return res.status(400).json(result);
    // Convert to CSV
    const csvRows = [];
    const headers = Object.keys(result.data[0] || {});
    csvRows.push(headers.join(','));
    for (const row of result.data) {
      const values = headers.map(header => JSON.stringify(row[header] || ''));
      csvRows.push(values.join(','));
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    return res.status(200).send(csvRows.join('\n'));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};