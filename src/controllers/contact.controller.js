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


// export const submitRequirement = async (req, res) => {
//   try {
//     // Service ko call karke data save karwana
  
//     const result = await contactService.createRequirement(req.body);

//     res.status(201).json({ 
//       success: true, 
//       message: "Requirement saved successfully",
//       data: result 
//     });
//   } catch (error) {
//     // Error handling logic
//     res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// };


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
