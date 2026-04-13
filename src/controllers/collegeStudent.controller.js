import {
  createStudentService,
  getStudentsByCollegeService,
  getStudentByIdService,
  updateStudentService,
  deleteStudentService,
  bulkUploadStudentsService,
} from "../services/collegeStudent.service.js";
import College from "../models/college.model.js";
import { MSG } from "../constants/messages.js";

// Helper to check if user is admin of college
const checkCollegeAdmin = async (collegeId, userId) => {
  const college = await College.findById(collegeId);
  if (!college) return false;
  return (
    college.createdBy.toString() === userId.toString() ||
    college.admins.some((adminId) => adminId.toString() === userId.toString())
  );
};

export const createStudent = async (req, res) => {
  try {
    const { collegeId } = req.params;

    if (!(await checkCollegeAdmin(collegeId, req.user._id))) {
      return res.status(403).json({
        success: false,
        message: MSG.STUDENT.UNAUTHORIZED,
      });
    }

    const result = await createStudentService(req.body, collegeId, req.user._id);
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("CREATE STUDENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

export const getStudents = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const {
      search,
      course,
      branch,
      status,
      year,
      semester,
      isPremiumUser,
      page,
      limit,
      sortBy,
      order,
    } = req.query;

    if (!(await checkCollegeAdmin(collegeId, req.user._id))) {
      return res.status(403).json({
        success: false,
        message: MSG.STUDENT.UNAUTHORIZED,
      });
    }

    const filters = {
      search,
      course,
      branch,
      status,
      year,
      semester,
      isPremiumUser,
    };

    const pagination = {
      page: page || 1,
      limit: limit || 50,
      sortBy: sortBy || "createdAt",
      order: order || "desc",
    };

    const result = await getStudentsByCollegeService(collegeId, filters, pagination);
    res.status(200).json(result);
  } catch (err) {
    console.error("GET STUDENTS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getStudentByIdService(id);
    res.status(result.success ? 200 : 404).json(result);
  } catch (err) {
    console.error("GET STUDENT BY ID ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { collegeId, id } = req.params;

    if (!(await checkCollegeAdmin(collegeId, req.user._id))) {
      return res.status(403).json({
        success: false,
        message: MSG.STUDENT.UNAUTHORIZED,
      });
    }

    const result = await updateStudentService(id, collegeId, req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("UPDATE STUDENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { collegeId, id } = req.params;

    if (!(await checkCollegeAdmin(collegeId, req.user._id))) {
      return res.status(403).json({
        success: false,
        message: MSG.STUDENT.UNAUTHORIZED,
      });
    }

    const result = await deleteStudentService(id, collegeId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("DELETE STUDENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

export const bulkUploadStudents = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { students } = req.body;

    if (!(await checkCollegeAdmin(collegeId, req.user._id))) {
      return res.status(403).json({
        success: false,
        message: MSG.STUDENT.UNAUTHORIZED,
      });
    }

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Students array is required",
      });
    }

    const result = await bulkUploadStudentsService(students, collegeId);
    res.status(200).json(result);
  } catch (err) {
    console.error("BULK UPLOAD STUDENTS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};


