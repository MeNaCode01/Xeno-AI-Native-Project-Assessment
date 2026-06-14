import { Router } from "express";
import { CampaignController } from "../controllers/campaign.controller";
import { CampaignLaunchController } from "../controllers/campaign-launch.controller";
import { CampaignAnalyticsController } from "../controllers/campaign-analytics.controller";
import { CampaignDeleteController } from "../controllers/campaign-delete.controller";

const router = Router();

router.post("/", CampaignController.createCampaign);
router.get("/", CampaignController.listCampaigns);
router.post("/:id/send", CampaignLaunchController.sendCampaign);
router.get("/:id/analytics", CampaignAnalyticsController.getAnalytics);
router.delete("/:id", CampaignDeleteController.deleteCampaign);

export default router;
