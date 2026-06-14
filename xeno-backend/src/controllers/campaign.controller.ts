import { Request, Response } from "express";
import { CampaignService } from "../services/campaign.service";

export class CampaignController {
  /**
   * Controller for POST /campaigns
   */
  static async createCampaign(req: Request, res: Response): Promise<void> {
    try {
      const { goal, audienceFilters, audienceSummary } = req.body;

      const errors: string[] = [];

      // Validate goal
      if (goal === undefined) {
        errors.push("goal is missing");
      } else if (typeof goal !== "string") {
        errors.push("goal must be a string");
      } else if (goal.trim() === "") {
        errors.push("goal is empty");
      }

      // Validate audienceFilters
      if (audienceFilters === undefined) {
        errors.push("audienceFilters is missing");
      } else if (typeof audienceFilters !== "object" || audienceFilters === null) {
        errors.push("audienceFilters must be an object");
      }

      // Validate audienceSummary
      if (audienceSummary === undefined) {
        errors.push("audienceSummary is missing");
      } else if (typeof audienceSummary !== "object" || audienceSummary === null) {
        errors.push("audienceSummary must be an object");
      }

      // Return HTTP 400 on validation failure
      if (errors.length > 0) {
        res.status(400).json({ error: errors.join(", ") });
        return;
      }

      // Call service layer to generate AI campaign and insert to DB
      const result = await CampaignService.createCampaign({
        goal: goal.trim(),
        audienceFilters,
        audienceSummary,
      });

      res.status(201).json(result);
    } catch (error) {
      console.error("Unexpected error in createCampaign controller:", error);
      res.status(500).json({ error: "An unexpected error occurred on the server" });
    }
  }

  /**
   * Controller for GET /campaigns
   */
  static async listCampaigns(req: Request, res: Response): Promise<void> {
    try {
      const campaigns = await CampaignService.listCampaigns();
      res.status(200).json(campaigns);
    } catch (error) {
      console.error("Unexpected error in listCampaigns controller:", error);
      res.status(500).json({ error: "An unexpected error occurred on the server" });
    }
  }
}
