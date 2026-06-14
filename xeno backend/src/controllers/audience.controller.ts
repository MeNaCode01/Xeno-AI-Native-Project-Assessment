import { Request, Response } from "express";
import { AudienceService } from "../services/audience.service";
import { LLMHelper } from "../lib/llm";

export class AudienceController {
  /**
   * Controller for POST /audiences/manual
   */
  static async getManualAudience(req: Request, res: Response): Promise<void> {
    try {
      const { minSpend, minOrders, lastPurchaseDays } = req.body;

      const errors: string[] = [];

      // Validate minSpend
      if (minSpend !== undefined) {
        if (typeof minSpend !== "number" || isNaN(minSpend)) {
          errors.push("minSpend must be a number");
        } else if (minSpend < 0) {
          errors.push("minSpend must be greater than or equal to 0");
        }
      }

      // Validate minOrders
      if (minOrders !== undefined) {
        if (typeof minOrders !== "number" || isNaN(minOrders)) {
          errors.push("minOrders must be a number");
        } else if (minOrders < 0) {
          errors.push("minOrders must be greater than or equal to 0");
        }
      }

      // Validate lastPurchaseDays
      if (lastPurchaseDays !== undefined) {
        if (typeof lastPurchaseDays !== "number" || isNaN(lastPurchaseDays)) {
          errors.push("lastPurchaseDays must be a number");
        } else if (lastPurchaseDays < 0) {
          errors.push("lastPurchaseDays must be greater than or equal to 0");
        }
      }

      // If validation fails, return HTTP 400 with details
      if (errors.length > 0) {
        res.status(400).json({ error: errors.join(", ") });
        return;
      }

      // Call the service layer with filtered params
      const stats = await AudienceService.calculateManualAudience({
        minSpend,
        minOrders,
        lastPurchaseDays,
      });

      res.status(200).json(stats);
    } catch (error) {
      console.error("Unexpected error in getManualAudience controller:", error);
      res.status(500).json({ error: "An unexpected error occurred on the server" });
    }
  }

  /**
   * Controller for POST /audiences/ai
   */
  static async getAIAudience(req: Request, res: Response): Promise<void> {
    try {
      const { prompt } = req.body;

      if (prompt === undefined) {
        res.status(400).json({ error: "prompt is missing" });
        return;
      } else if (typeof prompt !== "string") {
        res.status(400).json({ error: "prompt must be a string" });
        return;
      } else if (prompt.trim() === "") {
        res.status(400).json({ error: "prompt is empty" });
        return;
      }

      // 1. Generate filter criteria from the prompt
      const filters = await LLMHelper.generateAudienceFilters(prompt.trim());

      // 2. Query the database to calculate statistics based on the filters
      const stats = await AudienceService.calculateManualAudience(filters);

      // 3. Return combined response payload
      res.status(200).json({
        ...stats,
        audienceFilters: filters,
      });
    } catch (error) {
      console.error("Unexpected error in getAIAudience controller:", error);
      res.status(500).json({ error: "An unexpected error occurred on the server" });
    }
  }
}
