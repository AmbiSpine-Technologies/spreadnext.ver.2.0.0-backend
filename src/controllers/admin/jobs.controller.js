import * as adminJobService from "../../services/admin/adminJob.service.js";

// ============= JOB MANAGEMENT =============

export const getAllJobsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;
    const result = await adminJobService.getAllJobsAdminService(page, limit, filters);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getJobDetail = async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await adminJobService.getJobDetailService(jobId);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const approveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { approved = true } = req.body;
    const result = await adminJobService.approveJobService(jobId, req.user._id, approved);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const featureJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { featured = true } = req.body;
    const result = await adminJobService.featureJobService(jobId, req.user._id, featured);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await adminJobService.deleteJobService(jobId, req.user._id);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await adminJobService.updateJobService(jobId, req.user._id, req.body);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getJobStats = async (req, res) => {
  try {
    const result = await adminJobService.getJobStatsService();
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const exportJobs = async (req, res) => {
  try {
    const result = await adminJobService.exportJobsService();
    if (result.success) {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="jobs.csv"');
      const csv = convertToCSV(result.data);
      return res.status(200).send(csv);
    }
    return res.status(400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


export const getJobsPostedOverTime = async (req, res) => {
  try {
    const { filter = '7d' } = req.query;
    const data = await adminJobService.getJobsPostedOverTimeService(filter);
    res.json({ success: true, data: { ...data, filter } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobFeaturedStats = async (req, res) => {
  try {
    const data = await adminJobService.getJobFeaturedStatsService();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

