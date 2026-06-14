import { Request, Response } from "express";
import {
  CommunicationService,
  CommunicationNotFoundError,
  InvalidStateTransitionError,
} from "../services/communication.service";

export class CommunicationController {
  /**
   * Controller for POST /communications/status
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { communicationId, status } = req.body;

      const errors: string[] = [];

      // Validate communicationId
      if (communicationId === undefined) {
        errors.push("communicationId is missing");
      } else if (typeof communicationId !== "number" || !Number.isInteger(communicationId) || communicationId <= 0) {
        errors.push("communicationId must be a positive integer");
      }

      // Validate status
      const validStatuses = ["delivered", "opened", "clicked", "converted", "failed"];
      if (status === undefined) {
        errors.push("status is missing");
      } else if (typeof status !== "string" || !validStatuses.includes(status)) {
        errors.push(`status must be one of: ${validStatuses.join(", ")}`);
      }

      // Return HTTP 400 on validation failure
      if (errors.length > 0) {
        res.status(400).json({ error: errors.join(", ") });
        return;
      }

      // Call service layer to check/update communication status
      const result = await CommunicationService.updateStatus(communicationId, status as any);

      if (result === "idempotent") {
        res.status(200).json({
          message: "Communication already in requested state.",
        });
        return;
      }

      res.status(200).json({
        communicationId,
        status,
        message: "Communication updated successfully.",
      });
    } catch (error: any) {
      if (error instanceof CommunicationNotFoundError) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof InvalidStateTransitionError) {
        res.status(400).json({ error: error.message });
      } else {
        console.error("Unexpected error in updateStatus controller:", error);
        res.status(500).json({ error: "An unexpected error occurred on the server" });
      }
    }
  }
}
