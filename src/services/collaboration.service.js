import Collaboration from "../models/collaboration.model.js";
import User from "../models/user.model.js";

// Create collaboration
export const createCollaborationService = async (data, userId) => {
  try {
    const collaboration = await Collaboration.create({
      ...data,
      creator: userId,
      participants: [
        {
          user: userId,
          role: "owner",
          status: "active",
        },
      ],
    });

    const populatedCollaboration = await Collaboration.findById(collaboration._id)
      .populate("creator", "firstName lastName userName email profileImage")
      .populate("participants.user", "firstName lastName userName email profileImage")
      .lean();

    return {
      success: true,
      message: "Collaboration created successfully",
      data: populatedCollaboration,
    };
  } catch (error) {
    console.error("CREATE COLLABORATION ERROR:", error);
    return {
      success: false,
      message: "Failed to create collaboration",
      error: error.message,
    };
  }
};

// Get all collaborations
export const getCollaborationsService = async (filters = {}, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const query = { status: "active" };

    if (filters.userId) {
      query["participants.user"] = filters.userId;
      query["participants.status"] = "active";
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    if (filters.category) {
      query.category = filters.category;
    }

    const collaborations = await Collaboration.find(query)
      .populate("creator", "firstName lastName userName email profileImage")
      .populate("participants.user", "firstName lastName userName email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Collaboration.countDocuments(query);

    return {
      success: true,
      data: collaborations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET COLLABORATIONS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch collaborations",
      error: error.message,
    };
  }
};

// Get collaboration by ID
export const getCollaborationByIdService = async (collaborationId, userId = null) => {
  try {
    const collaboration = await Collaboration.findById(collaborationId)
      .populate("creator", "firstName lastName userName email profileImage")
      .populate("participants.user", "firstName lastName userName email profileImage")
      .lean();

    if (!collaboration) {
      return {
        success: false,
        message: "Collaboration not found",
      };
    }

    // Check if user is participant
    if (userId) {
      const isParticipant = collaboration.participants.some(
        (p) => p.user._id.toString() === userId.toString() && p.status === "active"
      );
      collaboration.isParticipant = isParticipant;
    }

    return {
      success: true,
      data: collaboration,
    };
  } catch (error) {
    console.error("GET COLLABORATION BY ID ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch collaboration",
      error: error.message,
    };
  }
};

// Update collaboration
export const updateCollaborationService = async (collaborationId, data, userId) => {
  try {
    const collaboration = await Collaboration.findById(collaborationId);

    if (!collaboration) {
      return {
        success: false,
        message: "Collaboration not found",
      };
    }

    // Check if user is creator or owner
    const isCreator = collaboration.creator.toString() === userId.toString();
    const participant = collaboration.participants.find(
      (p) => p.user.toString() === userId.toString() && p.role === "owner"
    );

    if (!isCreator && !participant) {
      return {
        success: false,
        message: "Unauthorized - Only creator or owner can update",
      };
    }

    Object.assign(collaboration, data);
    await collaboration.save();

    const updatedCollaboration = await Collaboration.findById(collaborationId)
      .populate("creator", "firstName lastName userName email profileImage")
      .populate("participants.user", "firstName lastName userName email profileImage")
      .lean();

    return {
      success: true,
      message: "Collaboration updated successfully",
      data: updatedCollaboration,
    };
  } catch (error) {
    console.error("UPDATE COLLABORATION ERROR:", error);
    return {
      success: false,
      message: "Failed to update collaboration",
      error: error.message,
    };
  }
};

// Join collaboration
export const joinCollaborationService = async (collaborationId, userId) => {
  try {
    const collaboration = await Collaboration.findById(collaborationId);

    if (!collaboration || collaboration.status !== "active") {
      return {
        success: false,
        message: "Collaboration not found or not active",
      };
    }

    // Check if already a participant
    const existingParticipant = collaboration.participants.find(
      (p) => p.user.toString() === userId.toString()
    );

    if (existingParticipant) {
      if (existingParticipant.status === "active") {
        return {
          success: false,
          message: "You are already a participant",
        };
      }
      // Reactivate if left
      existingParticipant.status = "active";
      await collaboration.save();
    } else {
      // Add as new participant
      collaboration.participants.push({
        user: userId,
        role: "collaborator",
        status: "active",
      });
      await collaboration.save();
    }

    const updatedCollaboration = await Collaboration.findById(collaborationId)
      .populate("creator", "firstName lastName userName email profileImage")
      .populate("participants.user", "firstName lastName userName email profileImage")
      .lean();

    return {
      success: true,
      message: "Joined collaboration successfully",
      data: updatedCollaboration,
    };
  } catch (error) {
    console.error("JOIN COLLABORATION ERROR:", error);
    return {
      success: false,
      message: "Failed to join collaboration",
      error: error.message,
    };
  }
};

// Leave collaboration
export const leaveCollaborationService = async (collaborationId, userId) => {
  try {
    const collaboration = await Collaboration.findById(collaborationId);

    if (!collaboration) {
      return {
        success: false,
        message: "Collaboration not found",
      };
    }

    // Don't allow creator to leave
    if (collaboration.creator.toString() === userId.toString()) {
      return {
        success: false,
        message: "Creator cannot leave collaboration",
      };
    }

    const participant = collaboration.participants.find(
      (p) => p.user.toString() === userId.toString()
    );

    if (!participant) {
      return {
        success: false,
        message: "You are not a participant",
      };
    }

    participant.status = "left";
    await collaboration.save();

    return {
      success: true,
      message: "Left collaboration successfully",
    };
  } catch (error) {
    console.error("LEAVE COLLABORATION ERROR:", error);
    return {
      success: false,
      message: "Failed to leave collaboration",
      error: error.message,
    };
  }
};









