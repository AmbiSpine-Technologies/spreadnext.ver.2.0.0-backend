import * as adminJobAppService from "../../services/admin/adminJobApp.service.js";


// ============= JOB APPLICATIONS =============

export const getAllApplications = async (req, res) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;
    const result = await adminJobAppService.getAllApplicationsAdminService(page, limit, filters);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getApplicationDetail = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const result = await adminJobAppService.getApplicationDetailService(applicationId);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;
    const result = await adminJobAppService.updateApplicationStatusService(
      applicationId,
      req.user._id,
      status,
      notes
    );
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const addApplicationNote = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { note } = req.body;
    const result = await adminJobAppService.addApplicationNoteService(
      applicationId,
      req.user._id,
      note
    );
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getApplicationStats = async (req, res) => {
  try {
    const result = await adminJobAppService.getApplicationStatsService();
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const exportApplications = async (req, res) => {
  try {
    const result = await adminJobAppService.exportApplicationsService(req.query);
    if (result.success) {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="applications.csv"');
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

