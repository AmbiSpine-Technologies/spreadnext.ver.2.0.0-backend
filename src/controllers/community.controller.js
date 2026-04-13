import {
  createCommunityValidation,
  updateCommunityValidation,
  createCommunityPostValidation,
  createCommunityEventValidation,
  sendCommunityChatValidation,
} from "../validations/community.validation.js";
import {
  createCommunityService,
  getCommunitiesService,
  getCommunityByIdService,
  updateCommunityService,
  deleteCommunityService,
  joinCommunityService,
  leaveCommunityService,
  getCommunityMembersService,
  updateMemberRoleService,
  removeMemberService,
  getCommunityFeedService,
  createCommunityPostService,
  getCommunityEventsService,
  createCommunityEventService,
  getCommunityFilesService,
  getCommunityChatService,
  sendCommunityChatService,
  getCommunityAnalyticsService,
} from "../services/community.service.js";
import { MSG } from "../constants/messages.js";

// Create community
export const createCommunity = async (req, res) => {
  try {
    // Debug: Log all incoming data
    console.log("📥 Request body:", req.body);
    console.log("📁 Request files:", req.files);
    console.log("📋 Request body keys:", Object.keys(req.body || {}));
    console.log("📝 Name field value:", req.body.name);
    console.log("📝 Name field type:", typeof req.body.name);
    
    // Handle FormData from frontend - check multiple possible field names
    const name = req.body.name?.trim() || req.body.name || "";
    
    console.log("🔍 Trimmed name:", name, "Length:", name.length);
    
    if (!name || name.length === 0) {
      console.error("❌ Name validation failed - name is empty or undefined");
      return res.status(400).json({
        success: false,
        message: '"name" is required',
        receivedData: {
          bodyKeys: Object.keys(req.body || {}),
          nameValue: req.body.name,
          nameType: typeof req.body.name,
        },
      });
    }
    
    if (name.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Community name must be at least 3 characters",
      });
    }
    
    // Map visibility to privacy and ensure lowercase BEFORE creating communityData
    const visibilityValue = req.body.visibility || req.body.privacy || "public";
    const privacyValue = typeof visibilityValue === 'string' 
      ? visibilityValue.toLowerCase().trim() 
      : "public";
    
    console.log("🔍 Privacy conversion:", {
      received: visibilityValue,
      converted: privacyValue,
      type: typeof visibilityValue
    });
    
    // Validate privacy value BEFORE Joi validation
    if (!["public", "private", "restricted"].includes(privacyValue)) {
      return res.status(400).json({
        success: false,
        message: `"privacy" must be one of [public, private, restricted]. Received: "${visibilityValue}"`,
      });
    }
    
    let communityData = {
      name: name,
      description: req.body.description?.trim() || "",
      category: req.body.category || "",
      privacy: privacyValue, // Use lowercase privacy value - MUST be lowercase
    };
    
    console.log("✅ Community data with converted privacy:", communityData);

    // Handle rules field - can be string, array, or empty
    if (req.body.rules) {
      try {
        if (typeof req.body.rules === 'string') {
          // Try to parse as JSON, if fails, treat as empty
          const parsed = JSON.parse(req.body.rules);
          if (Array.isArray(parsed) && parsed.length > 0) {
            communityData.rules = parsed;
          }
        } else if (Array.isArray(req.body.rules) && req.body.rules.length > 0) {
          communityData.rules = req.body.rules;
        }
      } catch (e) {
        // If parsing fails, leave rules empty (optional field)
        console.log("Rules parsing failed, using empty array");
      }
    }

    // Handle file uploads
    if (req.files) {
      // Map frontend field names to backend field names
      if (req.files.bannerImage && req.files.bannerImage[0]) {
        communityData.coverImage = `/uploads/images/${req.files.bannerImage[0].filename}`;
      }
      if (req.files.community_image && req.files.community_image[0]) {
        communityData.image = `/uploads/images/${req.files.community_image[0].filename}`;
      }
    }

    console.log("📝 Community data to validate:", communityData);

    // Validate the data (validation accepts any case, but we've already converted to lowercase)
    const { error, value: validatedData } = createCommunityValidation.validate(communityData);
    if (error) {
      console.error("❌ Validation error:", error.details);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        details: error.details,
      });
    }

    // Ensure privacy is lowercase after validation (defensive check)
    if (validatedData.privacy && typeof validatedData.privacy === 'string') {
      validatedData.privacy = validatedData.privacy.toLowerCase();
    }
    
    // Use validated data
    communityData = validatedData;

    const result = await createCommunityService(communityData, req.user._id);
    
    if (result.success) {
      console.log("✅ Community created successfully:", result.data?._id);
      res.status(201).json(result);
    } else {
      console.error("❌ Community creation failed in service:", result.message);
      res.status(400).json({
        success: false,
        message: result.message || "Failed to create community",
        error: result.error || result.message,
      });
    }
  } catch (err) {
    console.error("❌ CREATE COMMUNITY EXCEPTION:", err);
    res.status(500).json({
      success: false,
      message: err.message || MSG.ERROR.SERVER_ERROR || "Internal server error",
      error: err.message,
    });
  }
};

// Get all communities
export const getCommunities = async (req, res) => {
  try {
    const { search, privacy, category, page = 1, limit = 10 } = req.query;
    const filters = {};
    if (search) filters.search = search;
    if (privacy) filters.privacy = privacy;
    if (category) filters.category = category;

    const result = await getCommunitiesService(filters, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET COMMUNITIES ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get community by ID
export const getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user._id : null;

    const result = await getCommunityByIdService(id, userId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("GET COMMUNITY BY ID ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Update community
export const updateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = updateCommunityValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await updateCommunityService(id, req.body, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("UPDATE COMMUNITY ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Delete community
export const deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteCommunityService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("DELETE COMMUNITY ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Join community
export const joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await joinCommunityService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("JOIN COMMUNITY ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Leave community
export const leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await leaveCommunityService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("LEAVE COMMUNITY ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get community members
export const getCommunityMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, page = 1, limit = 20 } = req.query;
    const filters = {};
    if (role) filters.role = role;

    const result = await getCommunityMembersService(id, filters, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET COMMUNITY MEMBERS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Update member role
export const updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    if (!role || !["admin", "moderator", "member"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role is required (admin, moderator, member)",
      });
    }

    const result = await updateMemberRoleService(id, userId, role, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("UPDATE MEMBER ROLE ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Remove member
export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const result = await removeMemberService(id, userId, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("REMOVE MEMBER ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get community feed
export const getCommunityFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await getCommunityFeedService(id, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET COMMUNITY FEED ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Create community post
export const createCommunityPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = createCommunityPostValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await createCommunityPostService(id, req.body, req.user._id);
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("CREATE COMMUNITY POST ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get community events
export const getCommunityEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await getCommunityEventsService(id, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET COMMUNITY EVENTS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Create community event
export const createCommunityEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = createCommunityEventValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await createCommunityEventService(id, req.body, req.user._id);
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("CREATE COMMUNITY EVENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get community files
export const getCommunityFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, page = 1, limit = 20 } = req.query;
    const filters = {};
    if (category) filters.category = category;

    const result = await getCommunityFilesService(id, filters, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET COMMUNITY FILES ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get community chat
export const getCommunityChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const result = await getCommunityChatService(id, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET COMMUNITY CHAT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Send community chat message
export const sendCommunityChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = sendCommunityChatValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await sendCommunityChatService(id, req.body, req.user._id);
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("SEND COMMUNITY CHAT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get community analytics
export const getCommunityAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getCommunityAnalyticsService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET COMMUNITY ANALYTICS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};


