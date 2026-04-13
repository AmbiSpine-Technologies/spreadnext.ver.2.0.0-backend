import Joi from "joi";

export const createJobValidation = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  company: Joi.string().min(2).max(100).required(),
  companyLogo: Joi.string().allow("").optional(),
  companyColor: Joi.string().allow("").optional(),
  location: Joi.string().min(2).max(200).required(),
  salary: Joi.string().min(2).max(100).required(),
  workMode: Joi.string().valid("Remote", "Hybrid", "On-site").required(),
  jobType: Joi.string()
    .valid("Full-time", "Part-time", "Contract", "Internship", "Freelance")
    .required(),
  education: Joi.string()
    .valid("High School", "Bachelor's", "Master's", "PhD", "Any")
    .optional(),
  experience: Joi.string().min(1).max(50).required(),
  skills: Joi.array().items(Joi.string()).min(1).required(),
  description: Joi.string().min(50).max(5000).required(),
  responsibilities: Joi.array().items(Joi.string()).optional(),
  requirements: Joi.array().items(Joi.string()).optional(),
  benefits: Joi.array().items(Joi.string()).optional(),
  companySize: Joi.string()
    .valid("Startup", "Mid-size", "Large", "Enterprise")
    .optional(),
  industry: Joi.string()
  .required()
  .messages({
    "any.required": "Please select an industry to post this job",
  }),
  website: Joi.string().uri().allow("").optional(), 
  companyEmail: Joi.string().email().allow("").optional(),
  companyProfile: Joi.string().allow("").optional(),
  applyEmail: Joi.string().email().required().messages({
    "any.required": "Recruitment email is required to receive applications"
  }),
  applyLink: Joi.string().uri().allow("").optional(),
  isFeatured: Joi.boolean().optional(),
  expiresAt: Joi.date().optional(),
});

export const updateJobValidation = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  company: Joi.string().min(2).max(100).optional(),
  companyLogo: Joi.string().allow("").optional(),
  companyColor: Joi.string().allow("").optional(),
  location: Joi.string().min(2).max(200).optional(),
  salary: Joi.string().min(2).max(100).optional(),
  workMode: Joi.string().valid("Remote", "Hybrid", "On-site").optional(),
  jobType: Joi.string()
    .valid("Full-time", "Part-time", "Contract", "Internship", "Freelance")
    .optional(),
  education: Joi.string()
    .valid("High School", "Bachelor's", "Master's", "PhD", "Any")
    .optional(),
  experience: Joi.string().min(1).max(50).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().min(50).max(5000).optional(),
  responsibilities: Joi.array().items(Joi.string()).optional(),
  requirements: Joi.array().items(Joi.string()).optional(),
  benefits: Joi.array().items(Joi.string()).optional(),
  companySize: Joi.string()
    .valid("Startup", "Mid-size", "Large", "Enterprise")
    .optional(),
  industry: Joi.string()
    .optional(),
    website: Joi.string().uri().allow("").optional(), 
  companyEmail: Joi.string().email().allow("").optional(),
  companyProfile: Joi.string().allow("").optional(),
  applyEmail: Joi.string().email().required().messages({
    "any.required": "Recruitment email is required to receive applications"
  }),
  applyLink: Joi.string().uri().allow("").optional(),
  isFeatured: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  expiresAt: Joi.date().optional(),
});
