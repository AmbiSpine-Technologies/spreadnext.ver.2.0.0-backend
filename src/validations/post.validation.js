import Joi from "joi";

// export const createPostValidation = Joi.object({
//   content: Joi.string().required().min(1).max(5000),
//   media: Joi.array()
//     .items(
//       Joi.object({
//         type: Joi.string().valid("image", "video").required(),
//         url: Joi.string().uri().required(),
//         thumbnail: Joi.string().uri().optional(),
//       })
//     )
//     .optional(),
//   location: Joi.string().optional().allow(""),
//   tags: Joi.array().items(Joi.string()).optional(),
//   mentions: Joi.array().items(Joi.string()).optional(),
//   privacy: Joi.string().valid("public", "friends", "private").optional(),
// });



export const createPostValidation = Joi.object({
  content: Joi.string().trim().max(5000).allow(""),

  location: Joi.string().allow(""),
  tags: Joi.array().items(Joi.string()),
  mentions: Joi.array().items(Joi.string()),
  privacy: Joi.string().valid("public", "friends", "private"),

  // ❌ media removed from Joi
});


export const updatePostValidation = Joi.object({
  content: Joi.string().min(1).max(5000).optional(),
  media: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().valid("image", "video").required(),
        url: Joi.string().uri().required(),
        thumbnail: Joi.string().uri().optional(),
      })
    )
    .optional(),
  location: Joi.string().optional().allow(""),
  tags: Joi.array().items(Joi.string()).optional(),
  mentions: Joi.array().items(Joi.string()).optional(),
  privacy: Joi.string().valid("public", "friends", "private").optional(),
});



export const createCommentValidation = Joi.object({
  content: Joi.string().required().min(1).max(1000),
  parentComment: Joi.string().optional(), // For nested comments
});

export const updateCommentValidation = Joi.object({
  content: Joi.string().required().min(1).max(1000),
});

export const createStoryValidation = Joi.object({
  media: Joi.object({
    type: Joi.string().valid("image", "video").required(),
    url: Joi.string().uri().required(),
    thumbnail: Joi.string().uri().optional(),
  }).required(),
  caption: Joi.string().max(500).optional().allow(""),
});

export const reportContentValidation = Joi.object({
  reason: Joi.string()
    .valid(
      "Spam",
      "Harassment",
      "Inappropriate Content",
      "False Information",
      "Copyright Violation",
      "Other"
    )
    .required(),
  description: Joi.string().max(1000).optional().allow(""),
});









