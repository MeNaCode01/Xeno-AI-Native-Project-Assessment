import { Request, Response } from "express";
import {
  CampaignLaunchService,
  CampaignNotFoundError,
  CampaignAlreadySentError,
} from "../services/campaign-launch.service";

export class CampaignLaunchController {
  /**
   * Controller for POST /campaigns/:id/send
   */
  static async sendCampaign(req: Request, res: Response): Promise<void> {
    try {
      const campaignIdStr = req.params.id as string;
      const campaignId = parseInt(campaignIdStr, 10);

      // Validate that ID is a valid number
      if (isNaN(campaignId) || campaignId <= 0) {
        res.status(400).json({ error: "Invalid campaign ID. Must be a positive integer." });
        return;
      }

      // Execute launch in the service layer
      const result = await CampaignLaunchService.sendCampaign(campaignId);

      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof CampaignNotFoundError) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof CampaignAlreadySentError) {
        res.status(400).json({ error: error.message });
      } else {
        console.error("Unexpected error in sendCampaign controller:", error);
        res.status(500).json({ error: "An unexpected error occurred on the server" });
      }
    }
  }
}
