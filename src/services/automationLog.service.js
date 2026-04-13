import AutomationLog  from "../models/automationLog.model.js";

export const saveAutomationLog = async (userId, message) => {
  await AutomationLog.create({
    userId,
    type: "inactive-profile-reminder",
    message
  });
};