
import User from '../../models/user.model.js';
import Company from '../../models/company.model.js';
import Job from '../../models/job.model.js';
import JobApplication from '../../models/job.model.js';
import College from "../../models/college.model.js";

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
