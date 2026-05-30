import * as contactService from "../services/contact.service.js";

export const handleContactForm = async (req, res) => {
  try {
    // req.file humein multerUpload.single("attachment") se milega
    const ticket = await contactService.createContactTicket(req.body, req.file);

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const submitEarlyAccess = async (req, res) => {
  try {
    const user = await contactService.Eearlyuserregister(req.body);
    return res.status(201).json({ 
      success: true, 
      message: "Welcome to the waitlist!", 
      data: user 
    });
  } catch (error) {
    // Agar email exist karta hai, toh 400 status bhej rahe hain
    return res.status(400).json({ 
      success: false, 
      message: error.message // "This email is already registered..."
    });
  }
};

export const submitRequirement = async (req, res) => {
  try {
    // 1. IP Tracking (Proxy compatible for AWS/Vercel)
      const userIp = (req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress)
               .replace('::ffff:', '') // Remove IPv4-mapped IPv6 prefix
               .replace('::1', '127.0.0.1'); // Convert local IPv6 to IPv4
    // 2. Cloud Header Detection
    const country = 
      req.headers['x-vercel-ip-country'] || 
      req.headers['cloudfront-viewer-country'] || 
      req.headers['cf-ipcountry'] || 
      "IN"; 

    // 3. Merging Frontend Smart Fields with Backend Data
    const enrichedData = {
      ...req.body, // Contains sourceUrl, pageTitle, campaignSource from frontend
      country,
      userIp: userIp === '::1' ? '127.0.0.1' : userIp,
      serverTimestamp: new Date() 
    };

    const result = await contactService.createRequirement(enrichedData);

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAdminDashboardStats = async (req, res) => {
  try {
    const { timeline = "7d" } = req.query;
    const metrics = await contactService.fetchDashboardMetrics(timeline);
    
    return res.status(200).json({ success: true, ...metrics });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminContactTickets = async (req, res) => {
  try {
    const { page, limit, query } = req.query;
    const records = await contactService.fetchPaginatedContacts({ page, limit, query });
    
    return res.status(200).json({ success: true, ...records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedRecord = await contactService.updateContactStatusById(id, status);
    
    return res.status(200).json({ success: true, data: updatedRecord });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const getAdminEarlyAccessUsers = async (req, res) => {
  try {
    const { page, limit, query } = req.query;
    const records = await contactService.fetchPaginatedEarlyAccess({ page, limit, query });
    
    return res.status(200).json({ success: true, ...records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminRequirements = async (req, res) => {
  try {
    const { page, limit, query } = req.query;
    const records = await contactService.fetchPaginatedRequirements({ page, limit, query });
    
    return res.status(200).json({ success: true, ...records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};