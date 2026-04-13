import {
  createOrUpdateProfile,
  getProfileByUserId,
  getProfileByUsername,
  updateProfileSection,
  addItemToSection,
  updateItemInSection,
  deleteItemFromSection,
  updateArrayField,
  deleteProfile,
} from "../services/profile.service.js";
import  Profile  from '../models/profile.model.js';
import {
  createProfileValidation,
  updateProfileValidation,
  updatePersonalInfoValidation,
  updateSocialLinksValidation,
  updateWorkExperienceValidation,
  updateEducationValidation,
  updateProjectsValidation,
  updateSkillsValidation,
  updateInterestsValidation,
  updateLanguagesValidation,
  updateCertificatesValidation,
  updatePublicationsValidation,
  updateAwardsAchievementsValidation,
  updateLearningJourneyValidation,
  updateCareerExpectationsValidation,
  updateJobAlertPreferencesValidation,
  updateRecentExperienceValidation,
  updateInterestsAndPreferencesValidation,
} from "../validations/profile.validation.js";
import { MSG } from "../constants/messages.js";
import User from "../models/user.model.js";
import { updateContactInfoService, updateProfileMedia  } from "../services/profile.service.js";

import {
  addWorkExperienceValidation,
  updateWorkExperienceItemValidation
} from "../validations/profile.validation.js";

export const createOrUpdateProfileController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const requestBody = { ...req.body };
    
    const getFirstName = () => {
      if (requestBody.personalInfo?.firstName && requestBody.personalInfo.firstName.trim().length >= 2) {
        return requestBody.personalInfo.firstName.trim();
      }
      if (user.firstName && user.firstName.trim().length >= 2) {
        return user.firstName.trim();
      }
      return null; 
    };

    const getLastName = () => {
      if (requestBody.personalInfo?.lastName && requestBody.personalInfo.lastName.trim().length >= 2) {
        return requestBody.personalInfo.lastName.trim();
      }
      if (user.lastName && user.lastName.trim().length >= 2) {
        return user.lastName.trim();
      }
      return null; 
    };

    const firstName = getFirstName();
    const lastName = getLastName();
    const email = requestBody.personalInfo?.email || user.email || "";
    const userName = requestBody.personalInfo?.userName || user.userName || "";

    if (!firstName || !lastName) {
      return res.status(400).json({ 
        success: false, 
        message: "firstName and lastName are required. Please ensure your account has these fields set." 
      });
    }

    if (requestBody.personalInfo) {
      requestBody.personalInfo = {
        ...requestBody.personalInfo,
        firstName,
        lastName,
        email,
        userName,
      };
    } else {
      requestBody.personalInfo = {
        firstName,
        lastName,
        email,
        userName,
      };
    }

    // Debug: Log request body before validation
    console.log("🔍 Profile Controller - Request Body:", JSON.stringify(requestBody, null, 2));
    
    const { error } = updateProfileValidation.validate(requestBody);
    if (error) {
      console.error("❌ Profile Validation Error:", {
        message: error.details[0].message,
        path: error.details[0].path,
        allErrors: error.details.map(d => ({ path: d.path, message: d.message })),
      });
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message,
        validationErrors: error.details.map(d => ({ path: d.path.join('.'), message: d.message }))
      });
    }

    console.log("✅ Profile Validation Passed");
    const result = await createOrUpdateProfile(userId, requestBody);
    
    // Debug: Log result
    console.log("🔍 Profile Service Result:", {
      success: result.success,
      message: result.message,
      hasData: !!result.data,
    });
    
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Create/Update profile error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const updateContactInfo = async (req, res) => {
  try {
    const profile = await updateContactInfoService(
      req.user._id,
      req.body.contactInfo
    );

    res.json({ success: true, contactInfo: profile.contactInfo });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};



export const updateProfileMediaController = async (req, res) => {
  try {
    const userId = req.user._id;
    const files = req.files;

    console.log("FILES RECEIVED:", files);

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const result = await updateProfileMedia(userId, files);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};




export const getProfileController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const result = await getProfileByUserId(userId);
    res.status(result.success ? 200 : 404).json(result);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const getProfileByUsernameController = async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        message: "Username is required" 
      });
    }

    const result = await getProfileByUsername(username);
    res.status(result.success ? 200 : 404).json(result);
  } catch (err) {
    console.error("Get profile by username error:", err);
    res.status(500).json({ 
      success: false,
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const updatePersonalInfoController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const { error } = updatePersonalInfoValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const result = await updateProfileSection(userId, "personalInfo", req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Update personal info error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const updateProfileSummaryController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const { profileSummary } = req.body;
    const result = await updateProfileSection(userId, "profileSummary", profileSummary || "");
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Update profile summary error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

// Social Links ke liye specific update logic
export const updateSocialLinksController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    // Joi Validation: Body array honi chahiye
    const { error, value: validatedLinks } = updateSocialLinksValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Database Update: Use helper function with runValidators: false
    const result = await updateArrayField(userId, "socialLinks", validatedLinks);
    
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Social Links Update Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateWorkExperienceController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    // Extract userName from the authenticated user object
    const userName = req.user?.userName || req.user?.firstName || "User";
    console.log("REQ BODY TYPE:", Array.isArray(req.body));
console.log("REQ BODY:", req.body);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    // Joi validation for the array
    const { error } = updateWorkExperienceValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Service call
    const result = await updateProfileSection(userId, "workExperience", req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const addWorkExperienceController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // ✅ VALIDATE OBJECT (NOT ARRAY)
    const { error, value } = addWorkExperienceValidation.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await addItemToSection(
      userId,
      "workExperience",
      value // CLEAN OBJECT
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Add work experience error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateWorkExperienceItemController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { itemId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // ✅ VALIDATE OBJECT
    const { error, value } = updateWorkExperienceItemValidation.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await updateItemInSection(
      userId,
      "workExperience",
      itemId,
      value
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Update work experience item error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
export const deleteWorkExperienceItemController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { itemId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const result = await deleteItemFromSection(userId, "workExperience", itemId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Delete work experience item error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const updateEducationController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const { error } = updateEducationValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const result = await updateProfileSection(userId, "education", req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Update education error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const addEducationController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const result = await addItemToSection(userId, "education", req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Add education error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const updateEducationItemController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { itemId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const result = await updateItemInSection(userId, "education", itemId, req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Update education item error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const deleteEducationItemController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { itemId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const result = await deleteItemFromSection(userId, "education", itemId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Delete education item error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const updateProjectsController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const { error } = updateProjectsValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const result = await updateProfileSection(userId, "projects", req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Update projects error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const addProjectController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const result = await addItemToSection(userId, "projects", req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Add project error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const updateProjectItemController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { itemId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const result = await updateItemInSection(userId, "projects", itemId, req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Update project item error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const deleteProjectItemController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { itemId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const result = await deleteItemFromSection(userId, "projects", itemId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Delete project item error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};


export const updateSkillsController = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Validate request body matches { technical: [], soft: [] }
    const { error, value: validatedSkills } = updateSkillsValidation.validate(req.body);

    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    // Pass the OBJECT directly
    const result = await updateArrayField(userId, "skills", validatedSkills);
    
    // Status handling
    if (!result.success) return res.status(400).json(result);
    res.status(200).json(result);

  } catch (err) {
    console.error("Skills Controller Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



export const updateInterestsController = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Validate that req.body is an array of strings ["Coding", "Design"]
    const { error, value: validatedInterests } = updateInterestsValidation.validate(req.body);

    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    // 🔥 Update Database atomically
    const result = await updateArrayField(userId, "interests", validatedInterests);
    
    if (!result.success) return res.status(400).json(result);
    
    // res.status(200).json(result);
    res.status(200).json({
  success: true,
  data: result.data // Ye updated interests array hoga
});
  } catch (err) {
    console.error("Interests Update Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. Languages Controller
export const updateLanguagesController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { error, value: validatedLanguages } = updateLanguagesValidation.validate(req.body);

    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const result = await updateArrayField(userId, "languages", validatedLanguages);
    
    if (!result.success) return res.status(400).json(result);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCertificatesController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const { error } = updateCertificatesValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const result = await updateProfileSection(userId, "certificates", req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Update certificates error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};
// certificates 
export const addCertificateController = async (req, res) => {
  try {
    const userId = req.user?.id;
    let itemData = { ...req.body };

    // Agar multer ne file upload karke Cloudinary URL diya hai
    if (req.file) {
      // Cloudinary storage engine (multer-storage-cloudinary) 
      // automatically path ya secure_url return karta hai
      itemData.credentialUrl = req.file.path || req.file.secure_url;
    }

    const result = await addItemToSection(userId, "certificates", itemData);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCertificateItemController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { itemId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const result = await updateItemInSection(userId, "certificates", itemId, req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Update certificate item error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const deleteCertificateItemController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { itemId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const result = await deleteItemFromSection(userId, "certificates", itemId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Delete certificate item error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const deleteAwardController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { itemId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const result = await deleteItemFromSection(userId, "awardsAchievements", itemId);
    res.status(result.success ? 200 : 400).json(result);

  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ success: false, message: "Server error during deletion" });
  }
};

// controller.js
export const updateAwardController = async (req, res) => {
  try {
     const userId = req.user?._id || req.user?.id;
    const { itemId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const result = await updateItemInSection(userId, "awardsAchievements", itemId, req.body);
    res.status(result.success ? 200 : 400).json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error during update" });
  }
};

// awards
export const addAwardController = async (req, res) => {
  try {
    const userId = req.user?.id;
    let itemData = { ...req.body };

    // Handle image upload if provided
    if (req.file) {
      itemData.media = req.file.path || req.file.secure_url;
    }

    const result = await addItemToSection(userId, "awardsAchievements", itemData);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add a new publication
export const addPublicationController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    // Matches your publicationSchema fields: title, publisher, publicationDate, url, description
    const result = await addItemToSection(userId, "publications", req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Add publication error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error while adding publication" 
    });
  }
};

// Update an existing publication
export const updatePublicationItemController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { itemId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const result = await updateItemInSection(userId, "publications", itemId, req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Update publication item error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error while updating publication" 
    });
  }
};

// Delete a publication
export const deletePublicationItemController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { itemId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const result = await deleteItemFromSection(userId, "publications", itemId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Delete publication item error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error while deleting publication" 
    });
  }
};


export const updateLearningJourneyController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const { error } = updateLearningJourneyValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const result = await updateProfileSection(userId, "learningJourney", req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Update learning journey error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const updateCareerExpectationsController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const { error } = updateCareerExpectationsValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const result = await updateProfileSection(userId, "careerExpectations", req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Update career expectations error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const updateJobAlertPreferencesController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const { error } = updateJobAlertPreferencesValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const result = await updateProfileSection(userId, "jobAlertPreferences", req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Update job alert preferences error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const updateRecentExperienceController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const { error } = updateRecentExperienceValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const result = await updateProfileSection(userId, "recentExperience", req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Update recent experience error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const updateInterestsAndPreferencesController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const { error } = updateInterestsAndPreferencesValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const result = await updateProfileSection(userId, "interestsAndPreferences", req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Update interests and preferences error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};

export const deleteProfileController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please login first." 
      });
    }

    const result = await deleteProfile(userId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Delete profile error:", err);
    res.status(500).json({ 
      success: false, 
      message: MSG.ERROR.SERVER_ERROR 
    });
  }
};
