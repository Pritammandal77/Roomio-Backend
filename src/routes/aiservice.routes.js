import { Router } from "express";
import { getOrUpdateAiReview } from "../controllers/ai.controller.js"; // 1. Added .js extension
import { verifyJWT } from "../middlewares/auth.middleware.js";

const aiservicerouter = Router();

aiservicerouter.route("/ai-review/:listingId").get(verifyJWT, getOrUpdateAiReview);

export default aiservicerouter;