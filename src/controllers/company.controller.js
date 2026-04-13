import {
  createCompanyService,
  getCompanyByIdService,
  updateCompanyService,
  getCompanySuggestionsService,
  deleteCompanyService,
  getMyCompaniesService,
  getAllCompaniesService,
  getAllWithoutFilterCompaniesService,
} from "../services/company.service.js";
import { MSG } from "../constants/messages.js";
import { uploadToS3 } from "../utils/s3.js";

// Create a new company

export const createCompany = async (req, res) => {
  try {
    const files = req.files;
    const companyData = { ...req.body };

    // 1. Upload Company Logo to S3
    if (files?.logo?.length) {
      const logoUpload = await uploadToS3(files.logo[0], "companies/logos");
      companyData.logo = logoUpload.url; // Storing URL string in schema
    }

    // 2. Upload Verification Document to S3
    if (files?.verificationDoc?.length) {
      const docUpload = await uploadToS3(files.verificationDoc[0], "companies/docs");
      companyData.verificationDoc = docUpload.url; // Storing URL string in schema
    }

    // Call service to save in MongoDB
    const result = await createCompanyService(companyData, req.user._id);

    return res.status(result.success ? 201 : 400).json(result);
  } catch (err) {
    console.error("CREATE COMPANY ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error while creating company",
    });
  }
};

// Get company by ID
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const result = await getCompanyByIdService(id);
    res.status(result.success ? 200 : 404).json(result);
  } catch (err) {
    console.error("GET COMPANY BY ID ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

// Update company
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const result = await updateCompanyService(id, req.user._id, req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("UPDATE COMPANY ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

// Delete company
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const result = await deleteCompanyService(id, req.user._id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("DELETE COMPANY ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

// Get companies created/managed by logged-in user
export const getMyCompanies = async (req, res) => {
  try {
    const { page, limit, sortBy, order } = req.query;

    const pagination = {
      page: page || 1,
      limit: limit || 10,
      sortBy: sortBy || "createdAt",
      order: order || "desc",
    };

    const result = await getMyCompaniesService(req.user._id, pagination);
    res.status(200).json(result);
  } catch (err) {
    console.error("GET MY COMPANIES ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

// Get all companies (public)
export const getAllCompanies = async (req, res) => {
  try {
    const { search, industry, location, isVerified, page, limit, sortBy, order } = req.query;

    const filters = {
      search,
      industry,
      location,
      isVerified,
    };

    const pagination = {
      page: page || 1,
      limit: limit || 12,
      sortBy: sortBy || "createdAt",
      order: order || "desc",
    };

    const result = await getAllCompaniesService(filters, pagination);
    res.status(200).json(result);
  } catch (err) {
    console.error("GET ALL COMPANIES ERROR:", err);
    res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};


export const getAllWithoutFilterCompanies = async (req, res) => {
  try {
    const result = await getAllWithoutFilterCompaniesService();

    return res.status(200).json(result);
  } catch (err) {
    console.error("GET ALL COMPANIES WITHOUT FILTER ERROR:", err);
    return res.status(500).json({
      success: false,
      message: MSG.ERROR.SERVER_ERROR,
    });
  }
};

export const getCompanySuggestions = async (req, res) => {
  try {
    // DEBUG: If this is undefined, your Auth Middleware is failing
    console.log("User ID from request:", req.user?._id); 

    const limit = parseInt(req.query.limit) || 10;
    const result = await getCompanySuggestionsService(req.user._id, limit);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
