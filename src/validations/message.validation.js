import Joi from "joi";

export const createConversationValidation = Joi.object({
  participants: Joi.array().items(Joi.string()).min(1).required(),
  type: Joi.string().valid("one-on-one", "group").optional(),
  name: Joi.string().max(100).optional().allow(""),
  description: Joi.string().max(500).optional().allow(""),
  image: Joi.string().uri().optional().allow(""),
});

export const sendMessageValidation = Joi.object({
  content: Joi.string().max(5000).optional().allow(""),
  media: Joi.object({
    type: Joi.string().valid("image", "video", "file", "audio").optional(),
    url: Joi.string().uri().optional(),
    thumbnail: Joi.string().uri().optional(),
    filename: Joi.string().optional(),
    size: Joi.number().optional(),
  }).optional(),
  replyTo: Joi.string().optional(),
});

export const updateMessageValidation = Joi.object({
  content: Joi.string().required().min(1).max(5000),
});









