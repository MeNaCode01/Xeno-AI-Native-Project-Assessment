import { Request, Response } from "express";
import { CampaignAnalyticsService } from "../services/campaign-analytics.service";
import { CampaignNotFoundError } from "../services/campaign-launch.service";

export class CampaignAnalyticsController {
  /**
   * Controller for GET /campaigns/:id/analytics
   */
  static async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const campaignIdStr = req.params.id as string;
      const campaignId = parseInt(campaignIdStr, 10);

      // Validate ID is a positive integer
      if (isNaN(campaignId) || campaignId <= 0) {
        res.status(400).json({ error: "Invalid campaign ID. Must be a positive integer." });
        return;
      }

      // Compute analytics
      const result = await CampaignAnalyticsService.getAnalytics(campaignId);

      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof CampaignNotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        console.error("Unexpected error in getAnalytics controller:", error);
        res.status(500).json({ error: "An unexpected error occurred on the server" });
      }
    }
  }
}
