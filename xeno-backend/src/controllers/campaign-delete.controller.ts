import { Request, Response } from "express";
import {
  CampaignDeleteService,
  CampaignNotFoundError,
  InvalidCampaignStatusError,
} from "../services/campaign-delete.service";

export class CampaignDeleteController {
  /**
   * Controller endpoint for DELETE /campaigns/:id
   */
  static async deleteCampaign(req: Request, res: Response): Promise<void> {
    try {
      const campaignIdStr = req.params.id as string;
      const id = parseInt(campaignIdStr, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid campaign ID." });
        return;
      }

      await CampaignDeleteService.deleteCampaign(id);

      res.status(200).json({ message: "Draft campaign deleted successfully." });
    } catch (error: any) {
      if (error instanceof CampaignNotFoundError) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof InvalidCampaignStatusError) {
        res.status(400).json({ error: error.message });
      } else {
        console.error("Unexpected error in deleteCampaign controller:", error);
        res.status(500).json({ error: "An unexpected error occurred on the server" });
      }
    }
  }
}
