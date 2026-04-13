import Joi from "joi";

const socialLinkSchema = Joi.object({
  platform: Joi.string().required(),
  customName: Joi.string().allow(""),
  url: Joi.string().uri().required(),
});

const workExperienceSchema = Joi.object({
  company: Joi.string().required(),
  jobTitle: Joi.string().required(),
  employmentType: Joi.string().valid("Full-time", "Part-time", "Contract", "Internship", "Freelance").default("Full-time"),
  location: Joi.string().allow(""),
  startDate: Joi.string().required(),
  endDate: Joi.string().allow(""),
  description: Joi.string().allow(""),
  bullets: Joi.array().items(Joi.string()),
  hidden: Joi.boolean().default(false),
});


const educationSchema = Joi.object({
  degree: Joi.string().required(),
  institution: Joi.string().required(),
  field: Joi.string().allow(""),
  specialization: Joi.string().allow(""),
  board: Joi.string().allow(""),
  startDate: Joi.string().allow(""),
  endDate: Joi.string().allow(""),
  grade: Joi.string().allow(""),
  description: Joi.string().allow(""),
  hidden: Joi.boolean().default(false),
});

const projectSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(""),
  url: Joi.string().uri().allow(""),
  startDate: Joi.string().allow(""),
  endDate: Joi.string().allow(""),
  bullets: Joi.array().items(Joi.string()),
  hidden: Joi.boolean().default(false),
});

const certificateSchema = Joi.object({
  name: Joi.string().required(),
  issuer: Joi.string().allow(""),
  issueDate: Joi.string().allow(""),
  expiryDate: Joi.string().allow(""),
  credentialId: Joi.string().allow(""),
  credentialUrl: Joi.string().uri().allow(""),
  description: Joi.string().allow(""),
  hidden: Joi.boolean().default(false),
});

const imageSchema = Joi.object({
  key: Joi.string().allow("").optional(),
  url: Joi.string().allow("").optional(),
}).optional();


const publicationSchema = Joi.object({
  title: Joi.string().required(),
  publisher: Joi.string().allow(""),
  publicationDate: Joi.string().allow(""),
  url: Joi.string().uri().allow(""),
  description: Joi.string().allow(""),
  hidden: Joi.boolean().default(false),
});

const awardAchievementSchema = Joi.object({
  title: Joi.string().required(),
  issuer: Joi.string().allow(""),
  date: Joi.string().allow(""),
  description: Joi.string().allow(""),
  hidden: Joi.boolean().default(false),
});

const personalInfoSchema = Joi.object({
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  headline: Joi.string().allow(""),
  email: Joi.string().email().required(),
  phone: Joi.array()
  .items(Joi.string().pattern(/^[0-9+\-\s()]*$/))
  .max(3),
  country: Joi.string().allow(""),
  state: Joi.string().allow(""),
  city: Joi.string().allow(""),
  address: Joi.string().allow(""),
  location: Joi.string().allow(""),
  preferredLanguage: Joi.string().allow(""),
   profileImage: imageSchema,
    profileCover: imageSchema,
  dateOfBirth: Joi.string().allow(""),
  userName:  Joi.string().allow(""),
  gender: Joi.string().valid("Male", "Female", "Others", "").allow(""),
  journeyType: Joi.string().valid("Student", "Professional / Jobseeker", "Recruiter", 
        "TPO", "").allow(""),
  
});

const learningJourneySchema = Joi.object({
  educationLevel: Joi.string().allow(""),
  fieldOfStudy: Joi.string().allow(""),
  specialization: Joi.string().allow(""),
  customEducationLevel: Joi.string().allow(""),
  degree: Joi.string().allow(""),
  learningMode: Joi.string().valid("Online", "Regular", "Hybrid", "").allow(""),
  lookingForJobOpportunities: Joi.boolean().default(false),
});

const careerExpectationsSchema = Joi.object({
  LookingPosition: Joi.string().allow(""),
  industry: Joi.string().allow(""),
  preferredJobRoles: Joi.array().items(Joi.string()).default([]),
  availability: Joi.string().valid("Remote", "Onsite", "Hybrid", "").allow(""),
  lookingForJobOpportunities: Joi.boolean().default(true),
});

const jobAlertPreferencesSchema = Joi.object({
  preferredRoleTypes: Joi.array().items(Joi.string()).default([]),
  locationPreference: Joi.string().valid("Remote", "Onsite", "Hybrid", "").allow(""),
  targetRole: Joi.string().allow(""),
  targetIndustry: Joi.string().allow(""),
  salaryRange: Joi.object({
    min: Joi.number().allow(null),
    max: Joi.number().allow(null),
    currency: Joi.string().default("USD"),
  }).optional(),
   recruitvisibility: Joi.boolean().default(false),
});

const recentExperienceSchema = Joi.object({
  jobTitle: Joi.string().allow(""),
  currentRole: Joi.string().allow(""),
  experienceYears: Joi.string().allow(""),
  skills: Joi.array().items(Joi.string().trim()),

  portfolio: Joi.string()
    .uri()
    .allow("")
    .messages({
      "string.uri": "Portfolio must be a valid URL",
    }),

});

const interestsAndPreferencesSchema = Joi.object({
  whyJoining: Joi.string().allow(""),
  contentStylePreference: Joi.string().allow(""),
  communityInterestClusters: Joi.array().items(Joi.string()).default([]),
  contributionLevel: Joi.string().allow(""),
  skillsOrThemesToShare: Joi.array().items(Joi.string()).default([]),
  professionalIntent: Joi.string().allow(""),
}).unknown(false); // Explicitly reject unknown fields like 'interests', 'hobbies', etc.

export const createProfileValidation = Joi.object({
  personalInfo: personalInfoSchema.required(),
  socialLinks: Joi.array().items(socialLinkSchema).default([]),
  profileSummary: Joi.string().allow(""),
  workExperience: Joi.array().items(workExperienceSchema).default([]),
  education: Joi.array().items(educationSchema).default([]),
  projects: Joi.array().items(projectSchema).default([]),
  skills: Joi.array().items(Joi.string()).default([]),
  interests: Joi.array().items(Joi.string()).default([]),

  languages: Joi.array().items(
  Joi.object({
    name: Joi.string().required(),
    level: Joi.string().valid("Basic", "Intermediate", "Fluent", "Native")
  })
).default([]),
  certificates: Joi.array().items(certificateSchema).default([]),
  publications: Joi.array().items(publicationSchema).default([]),
  awardsAchievements: Joi.array().items(awardAchievementSchema).default([]),
});

export const updateProfileValidation = Joi.object({
  personalInfo: personalInfoSchema.optional(),
  socialLinks: Joi.array().items(socialLinkSchema).optional(),
  profileSummary: Joi.string().allow("").optional(),
  workExperience: Joi.array().items(workExperienceSchema).optional(),
  education: Joi.array().items(educationSchema).optional(),
  projects: Joi.array().items(projectSchema).optional(),
  skills: Joi.object({
  technical: Joi.array().items(Joi.string()).default([]),
  soft: Joi.array().items(Joi.string()).default([]),
}).default({
  technical: [],
  soft: [],
}),
interests: Joi.array()
  .items(Joi.string())
  .default([]),
  languages: Joi.array()
  .items(
    Joi.object({
      name: Joi.string().required(),
      proficiency: Joi.string().optional()
    })
  )
  .default([]),
  certificates: Joi.array().items(certificateSchema).optional(),
  publications: Joi.array().items(publicationSchema).optional(),
  awardsAchievements: Joi.array().items(awardAchievementSchema).optional(),
  learningJourney: learningJourneySchema.optional(),
  careerExpectations: careerExpectationsSchema.optional(),
  jobAlertPreferences: jobAlertPreferencesSchema.optional(),
  recentExperience: recentExperienceSchema.optional(),
  interestsAndPreferences: interestsAndPreferencesSchema.optional(),

  
}).unknown(false); // Explicitly reject unknown fields


export const addWorkExperienceValidation = workExperienceSchema;
export const updateWorkExperienceItemValidation = workExperienceSchema;


export const updatePersonalInfoValidation = personalInfoSchema;
export const updateSocialLinksValidation = Joi.array().items(socialLinkSchema);
export const updateWorkExperienceValidation = Joi.array().items(workExperienceSchema);
export const updateEducationValidation = Joi.array().items(educationSchema);
export const updateProjectsValidation = Joi.array().items(projectSchema);

export const updateSkillsValidation = Joi.object({
  technical: Joi.array().items(Joi.string()).default([]),
  soft: Joi.array().items(Joi.string()).default([]),
});

export const updateInterestsValidation = Joi.array().items(Joi.string());

export const updateLanguagesValidation = Joi.array().items(
  Joi.object({
    language: Joi.string().required(),
    proficiency: Joi.string()
      .valid("beginner", "intermediate", "advanced", "native")
      .required(),
  })
);

export const updateCertificatesValidation = Joi.array().items(certificateSchema);
export const updatePublicationsValidation = Joi.array().items(publicationSchema);
export const updateAwardsAchievementsValidation = Joi.array().items(awardAchievementSchema);
export const updateLearningJourneyValidation = learningJourneySchema;
export const updateCareerExpectationsValidation = careerExpectationsSchema;
export const updateJobAlertPreferencesValidation = jobAlertPreferencesSchema;
export const updateRecentExperienceValidation = recentExperienceSchema;
export const updateInterestsAndPreferencesValidation = interestsAndPreferencesSchema;
