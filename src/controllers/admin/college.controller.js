import * as collegeService from '../../services/admin/college.service.js';


// Colleges
export const getAllColleges = async (req, res) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;
    const result = await collegeService.getAllCollegesAdminService(page, limit, filters);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getCollegeDetail = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const result = await collegeService.getCollegeDetailService(collegeId);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const verifyCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { verified = true } = req.body;
    const result = await collegeService.verifyCollegeService(collegeId, req.user._id, verified);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const suspendCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { reason } = req.body;
    const result = await collegeService.suspendCollegeService(collegeId, req.user._id, reason);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const reactivateCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const result = await collegeService.reactivateCollegeService(collegeId, req.user._id);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const result = await collegeService.updateCollegeService(collegeId, req.user._id, req.body);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getCollegeRegistrationsOverTime = async (req, res) => {
  try {
    const { filter = '7d' } = req.query;
    const data = await collegeService.getCollegeRegistrationsOverTimeService(filter);
    res.json({ success: true, data: { ...data, filter } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCollegeStatusStats = async (req, res) => {
  try {
    const data = await collegeService.getCollegeStatusStatsService();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getCollegeVerificationStats = async (req, res) => {
  try {
    const data = await collegeService.getCollegeVerificationStats();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
