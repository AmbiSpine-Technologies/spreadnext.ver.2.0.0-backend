import Subscriber from '../models/subscriber.model.js'
import nodemailer from "nodemailer";

export const sendNewsletter = async (to, content) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Spreadnext" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🚀 Spreadnext Updates",
      html: content,
    });

    console.log("Mail sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("MAIL ERROR:", err);
    throw err;
  }
};

export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await Subscriber.findOne({ email });

    if (user) {
      if (user.status === "subscribed") {
        return res.json({ success: true, message: "Already subscribed" });
      }

      // resubscribe
      user.status = "subscribed";
      user.unsubscribedAt = null;
      await user.save();
 // ✅ AUTO WELCOME EMAIL
    await sendNewsletter(
      email,
      `<h2>Welcome to Spreadnext 🚀</h2>
       <p>Thanks for subscribing to AmbiSpine updates.</p>`
    );

      return res.json({ success: true, message: "Resubscribed" });
    }

    user = await Subscriber.create({ email });

    res.json({ success: true, message: "Subscribed successfully" });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};


function getDateRange(filter) {
  const now = new Date();

  switch (filter) {
    case "1d":
      return new Date(now.setHours(now.getHours() - 24));

    case "7d":
      return new Date(now.setDate(now.getDate() - 7));

    case "30d":
      return new Date(now.setDate(now.getDate() - 30));

    case "3m":
      return new Date(now.setMonth(now.getMonth() - 3));

    case "6m":
      return new Date(now.setMonth(now.getMonth() - 6));

    case "1y":
      return new Date(now.setFullYear(now.getFullYear() - 1));

    default:
      return new Date(now.setDate(now.getDate() - 7));
  }
}
// admin only
export const sendCampaign = async (req, res) => {
  try {
    const { content } = req.body;

    const users = await Subscriber.find({ status: "subscribed" });

    for (let user of users) {
      await sendNewsletter(user.email, content);

      await Subscriber.findByIdAndUpdate(user._id, {
        $inc: { emailsSent: 1 },
        lastEmailSentAt: new Date(),
      });
    }

    console.log("Campaign sent to:", users.length);

    res.json({ success: true, message: "Campaign sent" });

  } catch (err) {
    console.error("SEND CAMPAIGN ERROR:", err); // 👈 IMPORTANT
    res.status(500).json({ success: false, error: err.message });
  }
};


// controllers/admin/subscriber.controller.js

export const getSubscriberAnalytics = async (req, res) => {
  try {
    const { filter = "7d" } = req.query;

    const startDate = getDateRange(filter);

    // ✅ Total subscribers (filtered)
    const total = await Subscriber.countDocuments({
      status: "subscribed",
      createdAt: { $gte: startDate },
    });

    // ✅ Growth
    const growth = await Subscriber.aggregate([
      {
        $match: {
          status: "subscribed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        total,
        growth,
        filter,
      },
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};



