import Joi from "joi";

export const createCommunityValidation = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().max(1000).optional().allow("").allow(null),
  image: Joi.string().optional().allow("").allow(null), // Allow empty string or path
  coverImage: Joi.string().optional().allow("").allow(null), // Allow empty string or path
  privacy: Joi.string()
    .valid("public", "private", "restricted", "Public", "Private", "Restricted", "PUBLIC", "PRIVATE", "RESTRICTED") // Accept any case
    .optional()
    .default("public"),
  category: Joi.string().max(50).optional().allow("").allow(null),
  tags: Joi.array().items(Joi.string()).optional(),
  rules: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        description: Joi.string().optional().allow(""),
      })
    )
    .optional()
    .allow(null),
  settings: Joi.object({
    allowMemberPosts: Joi.boolean().optional(),
    requireApproval: Joi.boolean().optional(),
    allowFileUploads: Joi.boolean().optional(),
    allowEvents: Joi.boolean().optional(),
  }).optional(),
});

export const updateCommunityValidation = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(1000).optional().allow(""),
  image: Joi.string().uri().optional().allow(""),
  coverImage: Joi.string().uri().optional().allow(""),
  privacy: Joi.string().valid("public", "private", "restricted").optional(),
  category: Joi.string().max(50).optional().allow(""),
  tags: Joi.array().items(Joi.string()).optional(),
  rules: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        description: Joi.string().optional().allow(""),
      })
    )
    .optional(),
  settings: Joi.object({
    allowMemberPosts: Joi.boolean().optional(),
    requireApproval: Joi.boolean().optional(),
    allowFileUploads: Joi.boolean().optional(),
    allowEvents: Joi.boolean().optional(),
  }).optional(),
});

export const createCommunityPostValidation = Joi.object({
  content: Joi.string().required().min(1).max(5000),
  media: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().valid("image", "video").required(),
        url: Joi.string().uri().required(),
        thumbnail: Joi.string().uri().optional(),
      })
    )
    .optional(),
});

export const createCommunityEventValidation = Joi.object({
  title: Joi.string().required().min(3).max(200),
  description: Joi.string().max(2000).optional().allow(""),
  startDate: Joi.date().required(),
  endDate: Joi.date().optional(),
  location: Joi.string().max(200).optional().allow(""),
  isOnline: Joi.boolean().optional(),
  meetingLink: Joi.string().uri().optional().allow(""),
  image: Joi.string().uri().optional().allow(""),
});

export const sendCommunityChatValidation = Joi.object({
  message: Joi.string().required().min(1).max(1000),
  media: Joi.object({
    type: Joi.string().valid("image", "video", "file").optional(),
    url: Joi.string().uri().optional(),
  }).optional(),
});


