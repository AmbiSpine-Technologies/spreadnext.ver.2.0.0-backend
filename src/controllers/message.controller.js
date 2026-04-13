import {
  createConversationValidation,
  sendMessageValidation,
  updateMessageValidation,
} from "../validations/message.validation.js";
import {
  createOrGetConversationService,
  getConversationsService,
  getConversationByIdService,
  getMessagesService,
  sendMessageService,
  updateMessageService,
  deleteMessageService,
  markMessageAsReadService,
  getUnreadCountService,
} from "../services/message.service.js";
import { MSG } from "../constants/messages.js";

// Create or get conversation
export const createOrGetConversation = async (req, res) => {
  try {
    const { error } = createConversationValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { participants, type, name, description, image } = req.body;
    // Ensure current user is in participants
    const allParticipants = [...new Set([...participants, req.user._id.toString()])];

    const result = await createOrGetConversationService(
      allParticipants,
      type || "one-on-one",
      { name, description, image, createdBy: req.user._id }
    );
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("CREATE CONVERSATION ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get all conversations
export const getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await getConversationsService(req.user._id, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET CONVERSATIONS ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get conversation by ID
export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getConversationByIdService(id, req.user._id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("GET CONVERSATION BY ID ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get messages
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const result = await getMessagesService(id, req.user._id, parseInt(page), parseInt(limit));
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET MESSAGES ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = sendMessageValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await sendMessageService(id, req.body, req.user._id);
    res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Update message
export const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = updateMessageValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await updateMessageService(id, req.body, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("UPDATE MESSAGE ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteMessageService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("DELETE MESSAGE ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await markMessageAsReadService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("MARK MESSAGE AS READ ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getUnreadCountService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("GET UNREAD COUNT ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR || "Internal server error",
    });
  }
};









