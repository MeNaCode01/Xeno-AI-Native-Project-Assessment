import { Router } from "express";
import { AudienceController } from "../controllers/audience.controller";

const router = Router();

router.post("/manual", AudienceController.getManualAudience);
router.post("/ai", AudienceController.getAIAudience);

export default router;
