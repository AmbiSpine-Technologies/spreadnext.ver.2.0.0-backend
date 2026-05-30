
import Contact from "../models/contact.model.js";
import Requirement from "../models/requirement.model.js";
import EarlyAccess from '../models/earlyAccess.model.js'
import { uploadToS3, deleteFromS3 } from "../utils/s3.js"; 
import { getDateRange, getTimeSeries } from "../utils/dateHelpers.js";

export const createContactTicket = async (formData, file) => {
  let mediaAsset = null;

  if (file) {
    const uploaded = await uploadToS3(file, "contact-tickets");
    
    if (uploaded && uploaded.url && uploaded.key) {
      mediaAsset = {
        url: uploaded.url,
        key: uploaded.key
      };
    }
  }

  const { attachment, ...cleanFormData } = formData;

  const newTicket = new Contact({
    ...cleanFormData,
    attachment: mediaAsset 
  });

  return await newTicket.save();
};

export const Eearlyuserregister = async (userData) => {
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



// admin sides


/**
 * Common reusable paginated query engine for administrative models
 */
const executePaginatedQuery = async (Model, query, page, limit, searchFields = [], sortField = "createdAt") => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  let findQuery = {};
  
  if (query && searchFields.length > 0) {
    findQuery.$or = searchFields.map(field => ({
      [field]: { $regex: query, $options: "i" }
    }));
  }

  const data = await Model.find(findQuery)
    .sort({ [sortField]: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Model.countDocuments(findQuery);

  return {
    data,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      limit: limitNum
    }
  };
};


export const fetchDashboardMetrics = async (timelineString) => {
  const startDate = getDateRange(timelineString);

  // Executes database queries in parallel to speed up response times
  const [contacts, earlyAccess, requirements] = await Promise.all([
    getTimeSeries(Contact, "createdAt", startDate),
    getTimeSeries(EarlyAccess, "createdAt", startDate),
    getTimeSeries(Requirement, "createdAt", startDate)
  ]);

  return {
    timeline: timelineString,
    summary: {
      totalContacts: contacts.total,
      totalEarlyAccess: earlyAccess.total,
      totalRequirements: requirements.total
    },
    charts: {
      contacts: contacts.timeSeries,
      earlyAccess: earlyAccess.timeSeries,
      requirements: requirements.timeSeries
    }
  };
};

export const fetchPaginatedContacts = async ({ page, limit, query }) => {
  const searchFields = ["name", "email", "subject", "category"];
  return await executePaginatedQuery(Contact, query, page, limit, searchFields);
};

export const updateContactStatusById = async (id, status) => {
  const updatedTicket = await Contact.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
  
  if (!updatedTicket) {
    throw new Error("Target support ticket resource was not found");
  }
  return updatedTicket;
};

export const fetchPaginatedEarlyAccess = async ({ page, limit, query }) => {
  const searchFields = ["name", "email", "stage"];
  return await executePaginatedQuery(EarlyAccess, query, page, limit, searchFields);
};

export const fetchPaginatedRequirements = async ({ page, limit, query }) => {
  const searchFields = ["name", "email", "institutionName", "requirement", "country"];
  return await executePaginatedQuery(Requirement, query, page, limit, searchFields);
};