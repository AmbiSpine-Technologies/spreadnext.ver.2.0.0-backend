import { findInactiveUsersService } from "../services/auth.service.js";
import { generateReminderMessage } from "../constants/messages.js";
import { saveAutomationLog } from "../services/automationLog.service.js";

export const runInactiveUserAutomation = async (req, res) => {
  try {
    const users = await findInactiveUsersService();

    const results = [];

    for (const user of users) {
      const message = generateReminderMessage(user);

      await saveAutomationLog(user.userId, message);

      results.push({
        userId: user.userId,
        mobileNo: user.mobileNo,
        message
      });
    }

    res.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};