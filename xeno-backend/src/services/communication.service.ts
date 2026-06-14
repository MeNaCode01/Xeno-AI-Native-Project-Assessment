import { prisma } from "../db/prisma";

export class CommunicationNotFoundError extends Error {
  constructor(message: string = "Communication not found") {
    super(message);
    this.name = "CommunicationNotFoundError";
  }
}

export class InvalidStateTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStateTransitionError";
  }
}

// Define the valid paths of communication status transitions
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["delivered", "failed"],
  delivered: ["opened"],
  opened: ["clicked"],
  clicked: ["converted"],
  converted: [],
  failed: [],
};

export class CommunicationService {
  /**
   * Updates the status of an existing communication record.
   * Validates state transition paths and updates appropriate timestamps.
   * Supports idempotent requests.
   */
  static async updateStatus(
    communicationId: number,
    targetStatus: "pending" | "delivered" | "opened" | "clicked" | "converted" | "failed"
  ): Promise<"idempotent" | "updated"> {
    // 1. Fetch communication record
    const comm = await prisma.communication.findUnique({
      where: { id: communicationId },
    });

    if (!comm) {
      throw new CommunicationNotFoundError(`Communication with ID ${communicationId} not found`);
    }

    const currentStatus = comm.status;

    // 2. Idempotency Check
    if (currentStatus === targetStatus) {
      return "idempotent";
    }

    // 3. State Transition Validation
    const allowed = ALLOWED_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(targetStatus)) {
      throw new InvalidStateTransitionError(
        `Invalid state transition from '${currentStatus}' to '${targetStatus}'`
      );
    }

    // 4. Update status and target timestamps
    const updateData: any = {
      status: targetStatus,
    };

    const now = new Date();
    if (targetStatus === "delivered") {
      updateData.deliveredAt = now;
    } else if (targetStatus === "opened") {
      updateData.openedAt = now;
    } else if (targetStatus === "clicked") {
      updateData.clickedAt = now;
    } else if (targetStatus === "converted") {
      updateData.convertedAt = now;
    }
    // Note: for "failed", no timestamp field is modified per instructions.

    // 5. Persist update in DB
    await prisma.communication.update({
      where: { id: communicationId },
      data: updateData,
    });

    return "updated";
  }
}
