import { uploadFileToS3 } from "../middlewares/upload.middleware.js";
import Contact from "../models/contact.model.js";
import Requirement from "../models/requirement.model.js";
import EarlyAccess from '../models/earlyAccess.model.js'



export const createContactTicket = async (formData, file) => {
  let fileKey = null;

  // Agar file upload ki gayi hai to S3 par bhejein
  if (file) {
    fileKey = await uploadFileToS3(file);
  }

  // Database mein entry save karein
  const newTicket = new Contact({
    ...formData,
    attachmentKey: fileKey, // S3 key store kar rahe hain, URL nahi
  });

  return await newTicket.save();
};


export const Eearlyuserregister = async (userData) => {
  // Check if email exists
  const existingUser = await EarlyAccess.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('This email is already registered for early access.');
  }

  const newUser = new EarlyAccess(userData);
  return await newUser.save();
};

export const createRequirement = async (requirementData) => {
  const newRequirement = new Requirement(requirementData);
  return await newRequirement.save();
};