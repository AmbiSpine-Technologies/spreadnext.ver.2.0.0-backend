export const MSG = {
  AUTH: {
    REGISTER_SUCCESS: "User registered successfully",
    LOGIN_SUCCESS: "Login successful",
    INVALID_CREDENTIALS: "Invalid username/email or password",
    USER_EXISTS: "User already exists",
  },

  VALIDATION: {
    REQUIRED_FIELDS: "Please fill all required fields",
    INVALID_EMAIL: "Email format is invalid",
    PASSWORD_SHORT: "Password must be at least 6 characters",
    PASSWORD_NOT_MATCH: "Passwords do not match",
  },
  JOB: {
    CREATE_SUCCESS: "Job posted successfully",
    UPDATE_SUCCESS: "Job updated successfully",
    DELETE_SUCCESS: "Job deleted successfully",
    NOT_FOUND: "Job not found",
    UNAUTHORIZED: "You are not authorized to perform this action",
    FETCH_SUCCESS: "Jobs fetched successfully",
    FETCH_SINGLE_SUCCESS: "Job details fetched successfully",
  },
  COMPANY: {
    CREATE_SUCCESS: "Company created successfully",
    UPDATE_SUCCESS: "Company updated successfully",
    DELETE_SUCCESS: "Company deleted successfully",
    NOT_FOUND: "Company not found",
    UNAUTHORIZED: "You are not authorized to perform this action",
    FETCH_SUCCESS: "Companies fetched successfully",
    FETCH_SINGLE_SUCCESS: "Company details fetched successfully",
    ALREADY_EXISTS: "Company with this email already exists",
  },
  COLLEGE: {
    CREATE_SUCCESS: "College created successfully",
    UPDATE_SUCCESS: "College updated successfully",
    DELETE_SUCCESS: "College deleted successfully",
    NOT_FOUND: "College not found",
    UNAUTHORIZED: "You are not authorized to perform this action",
    FETCH_SUCCESS: "Colleges fetched successfully",
    FETCH_SINGLE_SUCCESS: "College details fetched successfully",
    ALREADY_EXISTS: "College with this email already exists",
  },
  STUDENT: {
    CREATE_SUCCESS: "Student added successfully",
    UPDATE_SUCCESS: "Student updated successfully",
    DELETE_SUCCESS: "Student deleted successfully",
    NOT_FOUND: "Student not found",
    UNAUTHORIZED: "You are not authorized to perform this action",
    FETCH_SUCCESS: "Students fetched successfully",
    BULK_UPLOAD_SUCCESS: "Students uploaded successfully",
    ALREADY_EXISTS: "Student with this roll number already exists",
  },

  ERROR: {
    SERVER_ERROR: "Something went wrong, please try again later",
    UNAUTHORIZED: "Unauthorized access",
  },
};


export const generateReminderMessage = (user) => {
  if (user.journeyType === "Student") {
    return "Complete your profile and add projects to improve visibility.";
  }

  if (user.journeyType === "Professional / Jobseeker") {
    return "Update your latest experience to attract recruiters.";
  }

  return "Your profile is inactive. Update it to stay visible.";
};