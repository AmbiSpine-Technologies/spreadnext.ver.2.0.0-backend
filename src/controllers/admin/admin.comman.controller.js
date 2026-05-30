
import User from '../../models/user.model.js';
import Company from '../../models/company.model.js';
import Job from '../../models/job.model.js';
import JobApplication from '../../models/job.model.js';
import College from "../../models/college.model.js";
import * as excelService from "../../services/admin/excel.service.js";

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await JobApplication.countDocuments();
    const pendingCompanies = await Company.countDocuments({ isVerified: false });
    const totalColleges = await College.countDocuments();
    const pendingColleges = await College.countDocuments({ isVerified: false });
    res.json({ totalUsers, totalCompanies, totalJobs, totalApplications, pendingCompanies, totalColleges, pendingColleges });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const handleDynamicExport = async (req, res) => {
  try {
    const { collectionType } = req.params; // contacts, earlyaccess, requirements
    const workbook = await excelService.exportCollectionToExcel(collectionType);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${collectionType}_export_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleDynamicImport = async (req, res) => {
  try {
    const { collectionType } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No Excel file provided" });
    }

    const result = await excelService.importExcelToCollection(collectionType, req.file.buffer);
    return res.status(200).json({ success: true, message: "Dataset imported efficiently", result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};