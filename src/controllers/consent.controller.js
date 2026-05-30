// controllers/consentController.js
import Consent from "../models/consent.model.js";

export const saveConsent = async (req, res) => {
  try {
    const { anonId, analytics, marketing, status } = req.body;
    // Check if token exists in headers (Optional Auth)
    const userId = req.user ? req.user.id : null;

    let query;
    if (userId) {
      query = { userId }; // Link to account
    } else {
      query = { anonId }; // Link to browser session
    }

    const updatedConsent = await Consent.findOneAndUpdate(
      query,
      { userId, anonId, analytics, marketing, status },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: updatedConsent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getConsent = async (req, res) => {
  const userId = req.user.id;
  const consent = await Consent.findOne({ userId });
  res.json(consent);
};