import Joi from "joi";

export const createJobApplicationValidation = Joi.object({
  // Personal & Professional Fields
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  linkedin: Joi.string().uri().optional().allow(""),
  portfolio: Joi.string().uri().optional().allow(""),
  experience: Joi.string().required(),
  currentCtc: Joi.string().required(),
  expectedCtc: Joi.string().required(),
  noticePeriod: Joi.string().required(),
  
  // Existing Fields
  coverLetter: Joi.string().max(5000).optional().allow(""),
  resumeUrl: Joi.string().uri().optional().allow(""),
  answers: Joi.array().items(
    Joi.object({
      question: Joi.string().required(),
      answer: Joi.string().required(),
    })
  ).optional(),
});

export const updateApplicationStatusValidation = Joi.object({
  status: Joi.string()
    .valid("pending", "reviewing", "shortlisted", "interview", "rejected", "accepted", "withdrawn")
    .required(),
  notes: Joi.string().max(1000).optional().allow(""),
});

