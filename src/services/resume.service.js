import Resume from "../models/resume.model.js";
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";

// Create resume
export const createResumeService = async (data, userId) => {
  try {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await Resume.updateMany({ user: userId }, { isDefault: false });
    }

    const resume = await Resume.create({
      ...data,
      user: userId,
    });

    const populatedResume = await Resume.findById(resume._id)
      .populate("user", "firstName lastName userName email")
      .lean();

    return {
      success: true,
      message: "Resume created successfully",
      data: populatedResume,
    };
  } catch (error) {
    console.error("CREATE RESUME ERROR:", error);
    return {
      success: false,
      message: "Failed to create resume",
      error: error.message,
    };
  }
};

// Get user's resumes
export const getResumesService = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const resumes = await Resume.find({ user: userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Resume.countDocuments({ user: userId });

    return {
      success: true,
      data: resumes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("GET RESUMES ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch resumes",
      error: error.message,
    };
  }
};

// Get resume by ID
export const getResumeByIdService = async (resumeId, userId = null) => {
  try {
    const query = { _id: resumeId };
    if (userId) {
      query.user = userId;
    }

    const resume = await Resume.findOne(query)
      .populate("user", "firstName lastName userName email")
      .lean();

    if (!resume) {
      return {
        success: false,
        message: "Resume not found",
      };
    }

    return {
      success: true,
      data: resume,
    };
  } catch (error) {
    console.error("GET RESUME BY ID ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch resume",
      error: error.message,
    };
  }
};

// Get resume by share token (public access)
export const getResumeByShareTokenService = async (shareToken) => {
  try {
    const resume = await Resume.findOne({
      shareToken,
      isPublic: true,
    })
      .populate("user", "firstName lastName userName email")
      .lean();

    if (!resume) {
      return {
        success: false,
        message: "Resume not found or not publicly shared",
      };
    }

    return {
      success: true,
      data: resume,
    };
  } catch (error) {
    console.error("GET RESUME BY SHARE TOKEN ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch resume",
      error: error.message,
    };
  }
};

// Update resume
export const updateResumeService = async (resumeId, data, userId) => {
  try {
    const resume = await Resume.findOne({ _id: resumeId, user: userId });

    if (!resume) {
      return {
        success: false,
        message: "Resume not found or unauthorized",
      };
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await Resume.updateMany({ user: userId, _id: { $ne: resumeId } }, { isDefault: false });
    }

    Object.assign(resume, data);
    await resume.save();

    const updatedResume = await Resume.findById(resumeId)
      .populate("user", "firstName lastName userName email")
      .lean();

    return {
      success: true,
      message: "Resume updated successfully",
      data: updatedResume,
    };
  } catch (error) {
    console.error("UPDATE RESUME ERROR:", error);
    return {
      success: false,
      message: "Failed to update resume",
      error: error.message,
    };
  }
};

// Delete resume
export const deleteResumeService = async (resumeId, userId) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: resumeId, user: userId });

    if (!resume) {
      return {
        success: false,
        message: "Resume not found or unauthorized",
      };
    }

    return {
      success: true,
      message: "Resume deleted successfully",
    };
  } catch (error) {
    console.error("DELETE RESUME ERROR:", error);
    return {
      success: false,
      message: "Failed to delete resume",
      error: error.message,
    };
  }
};

// Generate share token
export const generateShareTokenService = async (resumeId, userId) => {
  try {
    const resume = await Resume.findOne({ _id: resumeId, user: userId });

    if (!resume) {
      return {
        success: false,
        message: "Resume not found or unauthorized",
      };
    }

    // Generate unique token
    const crypto = await import("crypto");
    const shareToken = crypto.randomBytes(32).toString("hex");

    resume.shareToken = shareToken;
    resume.isPublic = true;
    await resume.save();

    return {
      success: true,
      message: "Share token generated successfully",
      data: { shareToken, shareUrl: `/api/resumes/share/${shareToken}` },
    };
  } catch (error) {
    console.error("GENERATE SHARE TOKEN ERROR:", error);
    return {
      success: false,
      message: "Failed to generate share token",
      error: error.message,
    };
  }
};

// Get available templates
export const getTemplatesService = async () => {
  try {
    const templates = [
      {
        id: "modern",
        name: "Modern",
        description: "Clean and contemporary design",
        preview: "/templates/modern-preview.jpg",
      },
      {
        id: "classic",
        name: "Classic",
        description: "Traditional and professional",
        preview: "/templates/classic-preview.jpg",
      },
      {
        id: "professional",
        name: "Professional",
        description: "Business-focused layout",
        preview: "/templates/professional-preview.jpg",
      },
      {
        id: "creative",
        name: "Creative",
        description: "Unique and artistic design",
        preview: "/templates/creative-preview.jpg",
      },
      {
        id: "executive",
        name: "Executive",
        description: "Executive-level format",
        preview: "/templates/executive-preview.jpg",
      },
    ];

    return {
      success: true,
      data: templates,
    };
  } catch (error) {
    console.error("GET TEMPLATES ERROR:", error);
    return {
      success: false,
      message: "Failed to fetch templates",
      error: error.message,
    };
  }
};

// Generate PDF (placeholder - would integrate with PDF library)
export const generatePdfService = async (resumeId, userId) => {
  try {
    const resume = await Resume.findOne({ _id: resumeId, user: userId });

    if (!resume) {
      return {
        success: false,
        message: "Resume not found or unauthorized",
      };
    }

    // TODO: Integrate with PDF generation library (jsPDF, puppeteer, etc.)
    // For now, return placeholder
    const pdfUrl = `/resumes/${resumeId}.pdf`;

    resume.pdfUrl = pdfUrl;
    await resume.save();

    return {
      success: true,
      message: "PDF generated successfully",
      data: { pdfUrl },
    };
  } catch (error) {
    console.error("GENERATE PDF ERROR:", error);
    return {
      success: false,
      message: "Failed to generate PDF",
      error: error.message,
    };
  }
};









