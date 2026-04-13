import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

// Create or get conversation
export const createOrGetConversationService = async (participants, type = "one-on-one", data = {}) => {
  try {
    // For one-on-one, check if conversation already exists
    if (type === "one-on-one" && participants.length === 2) {
      const existing = await Conversation.findOne({
        type: "one-on-one",
        participants: { $all: participants, $size: 2 },
      })
        .populate("participants", "firstName lastName userName email profileImage")
        .populate("lastMessage")
        .lean();

      if (existing) {
        return {
          success: true,
          message: "Conversation found",
          data: existing,
        };
      }
    }

    const conversation = await Conversation.create({
      participants,
      type,
      name: data.name || "",
      description: data.description || "",
      image: data.image || "",
      createdBy: data.createdBy || participants[0],
    });

    // Initialize unread counts
    participants.forEach((participantId) => {
      conversation.unreadCount.set(participantId.toString(), 0);
    });
    await conversation.save();

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "firstName lastName userName email profileImage")
      .lean();

    return {
      success: true,
      message: "Conversation created successfully",
      data: populatedConversation,
    };
  } catch (error) {
    console.error("CREATE CONVERSATION ERROR:", error);
    return {
      success: false,
      message: "Failed to create conversation",
      error: error.message,
    };
  }
};

// Get all conversations for a user
export const getConversationsService = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "firstName lastName userName email profileImage")
      .populate("lastMessage")
      .populate("createdBy", "firstName lastName userName")
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Add unread count for this user
    conversations.forEach((conv) => {
      conv.unreadCount = conv.unreadCount?.get?.(userId.toString()) || 0;
    });

    const total = await Conversation.countDocuments({
      participants: userId,
    });

    return {
      success: true,
      data: conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET CONVERSATIONS ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    };
  }
};

// Get conversation by ID
export const getConversationByIdService = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    })
      .populate("participants", "firstName lastName userName email profileImage")
      .populate("lastMessage")
      .populate("createdBy", "firstName lastName userName")
      .lean();

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found",
      };
    }

    conversation.unreadCount = conversation.unreadCount?.get?.(userId.toString()) || 0;

    return {
      success: true,
      data: conversation,
    };
  } catch (error) {
    console.error("GET CONVERSATION BY ID ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch conversation",
      error: error.message,
    };
  }
};

// Get messages for a conversation
export const getMessagesService = async (conversationId, userId, page = 1, limit = 50) => {
  try {
    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found or unauthorized",
      };
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false,
    })
      .populate("sender", "firstName lastName userName email profileImage")
      .populate("replyTo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Mark messages as read
    const unreadMessages = messages.filter(
      (msg) => !msg.readBy?.some((r) => r.user.toString() === userId.toString())
    );

    if (unreadMessages.length > 0) {
      await Message.updateMany(
        {
          _id: { $in: unreadMessages.map((m) => m._id) },
          "readBy.user": { $ne: userId },
        },
        {
          $push: {
            readBy: {
              user: userId,
              readAt: new Date(),
            },
          },
        }
      );

      // Update conversation unread count
      const currentUnread = conversation.unreadCount.get(userId.toString()) || 0;
      conversation.unreadCount.set(
        userId.toString(),
        Math.max(0, currentUnread - unreadMessages.length)
      );
      await conversation.save();
    }

    return {
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total: await Message.countDocuments({ conversation: conversationId, isDeleted: false }),
        pages: Math.ceil(
          (await Message.countDocuments({ conversation: conversationId, isDeleted: false })) /
            limit
        ),
      },
    };
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    };
  }
};

// Send message
export const sendMessageService = async (conversationId, data, userId) => {
  try {
    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found or unauthorized",
      };
    }

    const message = await Message.create({
      ...data,
      conversation: conversationId,
      sender: userId,
    });

    // Update conversation last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();

    // Increment unread count for all participants except sender
    conversation.participants.forEach((participantId) => {
      if (participantId.toString() !== userId.toString()) {
        const currentUnread = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), currentUnread + 1);
      }
    });

    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "firstName lastName userName email profileImage")
      .populate("replyTo")
      .lean();

    return {
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    };
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    return {
      success: false,
      message: "Failed to send message",
      error: error.message,
    };
  }
};

// Update message
export const updateMessageService = async (messageId, data, userId) => {
  try {
    const message = await Message.findOne({
      _id: messageId,
      sender: userId,
      isDeleted: false,
    });

    if (!message) {
      return {
        success: false,
        message: "Message not found or unauthorized",
      };
    }

    message.content = data.content || message.content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate("sender", "firstName lastName userName email profileImage")
      .lean();

    return {
      success: true,
      message: "Message updated successfully",
      data: updatedMessage,
    };
  } catch (error) {
    console.error("UPDATE MESSAGE ERROR:", error);
    return {
      success: false,
      message: "Failed to update message",
      error: error.message,
    };
  }
};

// Delete message
export const deleteMessageService = async (messageId, userId) => {
  try {
    const message = await Message.findOne({
      _id: messageId,
      sender: userId,
      isDeleted: false,
    });

    if (!message) {
      return {
        success: false,
        message: "Message not found or unauthorized",
      };
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    return {
      success: true,
      message: "Message deleted successfully",
    };
  } catch (error) {
    console.error("DELETE MESSAGE ERROR:", error);
    return {
      success: false,
      message: "Failed to delete message",
      error: error.message,
    };
  }
};

// Mark message as read
export const markMessageAsReadService = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return {
        success: false,
        message: "Message not found",
      };
    }

    // Check if already read
    const alreadyRead = message.readBy?.some(
      (r) => r.user.toString() === userId.toString()
    );

    if (!alreadyRead) {
      message.readBy.push({
        user: userId,
        readAt: new Date(),
      });
      await message.save();

      // Update conversation unread count
      const conversation = await Conversation.findById(message.conversation);
      if (conversation) {
        const currentUnread = conversation.unreadCount.get(userId.toString()) || 0;
        conversation.unreadCount.set(userId.toString(), Math.max(0, currentUnread - 1));
        await conversation.save();
      }
    }

    return {
      success: true,
      message: "Message marked as read",
    };
  } catch (error) {
    console.error("MARK MESSAGE AS READ ERROR:", error);
    return {
      success: false,
      message: "Failed to mark message as read",
      error: error.message,
    };
  }
};

// Get unread count for conversation
export const getUnreadCountService = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found",
      };
    }

    const unreadCount = conversation.unreadCount.get(userId.toString()) || 0;

    return {
      success: true,
      data: { unreadCount },
    };
  } catch (error) {
    console.error("GET UNREAD COUNT ERROR:", error);
    return {
      success: false,
      message: "Failed to get unread count",
      error: error.message,
    };
  }
};









