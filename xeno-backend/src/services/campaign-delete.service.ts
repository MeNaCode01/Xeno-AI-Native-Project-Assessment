import { prisma } from "../db/prisma";

export class CampaignNotFoundError extends Error {
  constructor(message: string = "Campaign not found.") {
    super(message);
    this.name = "CampaignNotFoundError";
  }
}

export class InvalidCampaignStatusError extends Error {
  constructor(message: string = "Only draft campaigns can be deleted.") {
    super(message);
    this.name = "InvalidCampaignStatusError";
  }
}

export class CampaignDeleteService {
  /**
   * Safe deletion of a draft campaign and its child communication records.
   */
  static async deleteCampaign(campaignId: number): Promise<void> {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new CampaignNotFoundError("Campaign not found.");
    }

    if (campaign.status !== "draft") {
      throw new InvalidCampaignStatusError("Only draft campaigns can be deleted.");
    }

    // Safely delete Campaign and related child Communication records using a transaction
    await prisma.$transaction([
      prisma.communication.deleteMany({
        where: { campaignId: campaignId },
      }),
      prisma.campaign.delete({
        where: { id: campaignId },
      }),
    ]);
  }
}
