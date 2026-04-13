import * as companyService from '../../services/admin/company.service.js';

// Companies
export const getAllCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;
    const result = await companyService.getAllCompaniesAdminService(page, limit, filters);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getCompanyDetail = async (req, res) => {
  try {
    const { companyId } = req.params;
    const result = await companyService.getCompanyDetailService(companyId);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const verifyCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { verified = true } = req.body;
    const result = await companyService.verifyCompanyService(companyId, req.user._id, verified);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const suspendCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { reason } = req.body;
    const result = await companyService.suspendCompanyService(companyId, req.user._id, reason);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getCompanyRegistrationsOverTime = async (req, res) => {
  try {
    const { filter = '7d' } = req.query;
    const data = await companyService.getCompanyRegistrationsOverTimeService(filter);
    res.json({ success: true, data: { ...data, filter } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCompanyVerificationStats = async (req, res) => {
  try {
    const data = await companyService.getCompanyVerificationStatsService();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const reactivateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const result = await companyService.reactivateCompanyService(companyId, req.user._id);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const result = await companyService.updateCompanyService(companyId, req.user._id, req.body);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};






