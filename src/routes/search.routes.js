import express from "express";
import {
  globalSearch,
  searchUsers,
  searchPosts,
  searchJobs,
  searchCommunities,
} from "../controllers/search.controller.js";

const router = express.Router();

// All search routes can be public
router.get("/", globalSearch);
router.get("/users", searchUsers);
router.get("/posts", searchPosts);
router.get("/jobs", searchJobs);
router.get("/communities", searchCommunities);

export default router;









