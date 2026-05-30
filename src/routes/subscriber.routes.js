
import express from "express";
import { getSubscriberAnalytics, subscribe, sendCampaign } from "../controllers/subscriber.controller.js";
import { protect } from "../middlewares/adminAuth.middleware.js";
const router = express.Router();

router.post("/subscribe", subscribe);

// router.get("/admin/subscribers/analytics", protect("superadmin"), getSubscriberAnalytics);
router.get("/admin/subscribers/analytics", getSubscriberAnalytics);
router.post("/admin/send-campaign", sendCampaign);


export default router;




