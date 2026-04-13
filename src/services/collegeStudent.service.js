import CollegeStudent from "../models/collegeStudent.model.js";
import { MSG } from "../constants/messages.js";

export const createStudentService = async (studentData, collegeId, userId) => {
  try {
    // Check if student with same rollNo already exists in this college
    const existingStudent = await CollegeStudent.findOne({
      collegeId,
      rollNo: studentData.rollNo,
    });

    if (existingStudent) {
      return {
        success: false,
        message: MSG.STUDENT.ALREADY_EXISTS,
      };
    }

    // Convert skills object to Map if it's an object
    let skillsMap = new Map();
    if (studentData.skills && typeof studentData.skills === "object") {
      Object.entries(studentData.skills).forEach(([key, value]) => {
        skillsMap.set(key, value);
      });
    }

    const student = await CollegeStudent.create({
      ...studentData,
      collegeId,
      skills: skillsMap,
    });

    const populatedStudent = await CollegeStudent.findById(student._id)
      .populate("collegeId", "name")
      .populate("userId", "userName email firstName lastName");

    return {
      success: true,
      message: MSG.STUDENT.CREATE_SUCCESS,
      data: populatedStudent,
    };
  } catch (error) {
    throw error;
  }
};

export const getStudentsByCollegeService = async (
  collegeId,
  filters = {},
  pagination = {}
) => {
  try {
    const {
      search,
      course,
      branch,
      status,
      year,
      semester,
      isPremiumUser,
    } = filters;

    const {
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      order = "desc",
    } = pagination;

    const query = { collegeId };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNo: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { branch: { $regex: search, $options: "i" } },
        { course: { $regex: search, $options: "i" } },
      ];
    }

    if (course && course !== "all") {
      query.course = course;
    }

    if (branch && branch !== "all") {
      query.branch = branch;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (year) {
      query.year = year;
    }

    if (semester) {
      query.semester = semester;
    }

    if (isPremiumUser !== undefined) {
      query.isPremiumUser = isPremiumUser === "true";
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === "desc" ? -1 : 1;

    const students = await CollegeStudent.find(query)
      .populate("userId", "userName email firstName lastName")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CollegeStudent.countDocuments(query);

    // Convert skills Map to Object for JSON response
    const studentsWithObjectSkills = students.map((student) => {
      const studentObj = student.toObject();
      if (studentObj.skills instanceof Map) {
        studentObj.skills = Object.fromEntries(studentObj.skills);
      }
      return studentObj;
    });

    return {
      success: true,
      message: MSG.STUDENT.FETCH_SUCCESS,
      data: studentsWithObjectSkills,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

export const getStudentByIdService = async (studentId) => {
  try {
    const student = await CollegeStudent.findById(studentId)
      .populate("collegeId", "name")
      .populate("userId", "userName email firstName lastName");

    if (!student) {
      return {
        success: false,
        message: MSG.STUDENT.NOT_FOUND,
      };
    }

    const studentObj = student.toObject();
    if (studentObj.skills instanceof Map) {
      studentObj.skills = Object.fromEntries(studentObj.skills);
    }

    return {
      success: true,
      message: MSG.STUDENT.FETCH_SUCCESS,
      data: studentObj,
    };
  } catch (error) {
    throw error;
  }
};

export const updateStudentService = async (studentId, collegeId, updateData) => {
  try {
    const student = await CollegeStudent.findById(studentId);

    if (!student) {
      return {
        success: false,
        message: MSG.STUDENT.NOT_FOUND,
      };
    }

    // Verify student belongs to this college
    if (student.collegeId.toString() !== collegeId.toString()) {
      return {
        success: false,
        message: MSG.STUDENT.UNAUTHORIZED,
      };
    }

    // Convert skills object to Map if provided
    if (updateData.skills && typeof updateData.skills === "object") {
      const skillsMap = new Map();
      Object.entries(updateData.skills).forEach(([key, value]) => {
        skillsMap.set(key, value);
      });
      updateData.skills = skillsMap;
    }

    const updatedStudent = await CollegeStudent.findByIdAndUpdate(
      studentId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("collegeId", "name")
      .populate("userId", "userName email firstName lastName");

    const studentObj = updatedStudent.toObject();
    if (studentObj.skills instanceof Map) {
      studentObj.skills = Object.fromEntries(studentObj.skills);
    }

    return {
      success: true,
      message: MSG.STUDENT.UPDATE_SUCCESS,
      data: studentObj,
    };
  } catch (error) {
    throw error;
  }
};

export const deleteStudentService = async (studentId, collegeId) => {
  try {
    const student = await CollegeStudent.findById(studentId);

    if (!student) {
      return {
        success: false,
        message: MSG.STUDENT.NOT_FOUND,
      };
    }

    if (student.collegeId.toString() !== collegeId.toString()) {
      return {
        success: false,
        message: MSG.STUDENT.UNAUTHORIZED,
      };
    }

    await CollegeStudent.findByIdAndDelete(studentId);

    return {
      success: true,
      message: MSG.STUDENT.DELETE_SUCCESS,
    };
  } catch (error) {
    throw error;
  }
};

export const bulkUploadStudentsService = async (studentsData, collegeId) => {
  try {
    const results = {
      success: [],
      failed: [],
    };

    for (const studentData of studentsData) {
      try {
        // Check if student already exists
        const existingStudent = await CollegeStudent.findOne({
          collegeId,
          rollNo: studentData.rollNo,
        });

        if (existingStudent) {
          results.failed.push({
            rollNo: studentData.rollNo,
            name: studentData.name,
            error: "Student with this roll number already exists",
          });
          continue;
        }

        // Convert skills object to Map
        let skillsMap = new Map();
        if (studentData.skills && typeof studentData.skills === "object") {
          Object.entries(studentData.skills).forEach(([key, value]) => {
            skillsMap.set(key, value);
          });
        }

        const student = await CollegeStudent.create({
          ...studentData,
          collegeId,
          skills: skillsMap,
        });

        results.success.push({
          rollNo: student.rollNo,
          name: student.name,
        });
      } catch (error) {
        results.failed.push({
          rollNo: studentData.rollNo || "Unknown",
          name: studentData.name || "Unknown",
          error: error.message,
        });
      }
    }

    return {
      success: true,
      message: MSG.STUDENT.BULK_UPLOAD_SUCCESS,
      data: results,
    };
  } catch (error) {
    throw error;
  }
};


