import { prisma } from "../db/prisma";
import { AudienceService, AudienceCriteria } from "./audience.service";

export class CampaignNotFoundError extends Error {
  constructor(message: string = "Campaign not found") {
    super(message);
    this.name = "CampaignNotFoundError";
  }
}

export class CampaignAlreadySentError extends Error {
  constructor(message: string = "Campaign has already been sent") {
    super(message);
    this.name = "CampaignAlreadySentError";
  }
}

export interface LaunchCampaignResult {
  campaignId: number;
  campaignStatus: string;
  audienceSize: number;
  communicationsCreated: number;
  message: string;
}

export class CampaignLaunchService {
  /**
   * Launches a campaign by ID.
   * Steps:
   * 1. Fetches the campaign.
   * 2. Checks if campaign exists and status is not already "sent".
   * 3. Queries matching customers using the refactored AudienceService.
   * 4. Bulk inserts Communication records with status "pending".
   * 5. Updates Campaign.status to "sent".
   * 6. Fires background dispatches to the simulated channel service.
   * 7. Returns summary statistics.
   */
  static async sendCampaign(campaignId: number): Promise<LaunchCampaignResult> {
    // 1. Fetch the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new CampaignNotFoundError(`Campaign with ID ${campaignId} not found`);
    }

    // 2. Validate status
    if (campaign.status === "sent") {
      throw new CampaignAlreadySentError(`Campaign with ID ${campaignId} has already been sent`);
    }

    // 3. Query all matching customers (reusing shared audience filter logic)
    const criteria = (campaign.audienceFilters as any) as AudienceCriteria;
    const customerIds = await AudienceService.getMatchingCustomerIds(criteria);

    // 4. Create pending Communication records in bulk
    let communications: Array<{ id: number; customerId: number }> = [];

    if (customerIds.length > 0) {
      communications = await prisma.communication.createManyAndReturn({
        data: customerIds.map((id) => ({
          campaignId: campaign.id,
          customerId: id,
          status: "pending",
          sentAt: new Date(),
        })),
        select: {
          id: true,
          customerId: true,
        },
      });
    }

    // 5. Update campaign status to sent
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: "sent",
      },
    });

    // 6. Invoke channel service in the background (fire-and-forget)
    this.dispatchToChannelService(campaign, communications);

    // 7. Return launch summary
    return {
      campaignId: campaign.id,
      campaignStatus: "sent",
      audienceSize: customerIds.length,
      communicationsCreated: communications.length,
      message: "Campaign launched successfully.",
    };
  }

  /**
   * Dispatches calls to the simulated channel service at http://localhost:4000/send in the background.
   */
  private static async dispatchToChannelService(
    campaign: any,
    communications: Array<{ id: number; customerId: number }>
  ) {
    try {
      const channelServiceUrl = process.env.CHANNEL_SERVICE_URL || "http://localhost:4000";
      const customerIds = communications.map((c) => c.customerId);
      const customers = await prisma.customer.findMany({
        where: { id: { in: customerIds } },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
        },
      });

      const customerMap = new Map(customers.map((c) => [c.id, c]));

      // Execute asynchronously (non-blocking)
      await Promise.all(
        communications.map(async (comm) => {
          try {
            const customer = customerMap.get(comm.customerId);

            // Gracefully fall back to generic values or empty string if fields are not present
            const nameVal = customer?.name?.trim() || "Customer";
            const emailVal = customer?.email || "";
            const phoneVal = customer?.phone || "";
            const cityVal = customer?.city || "";

            let personalizedMessage = campaign.message;
            // Replace {{name}} and other customer-related placeholders
            personalizedMessage = personalizedMessage.split("{{name}}").join(nameVal);
            personalizedMessage = personalizedMessage.split("{{email}}").join(emailVal);
            personalizedMessage = personalizedMessage.split("{{phone}}").join(phoneVal);
            personalizedMessage = personalizedMessage.split("{{city}}").join(cityVal);

            await fetch(`${channelServiceUrl}/send`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                campaignId: campaign.id,
                communicationId: comm.id,
                customerId: comm.customerId,
                message: personalizedMessage,
                channel: campaign.channel,
              }),
            });
          } catch (error: any) {
            // Log network or connection failures, but do not interrupt the parent thread
            console.error(
              `Failed to send communication ID ${comm.id} to channel service:`,
              error.message
            );
          }
        })
      );
    } catch (dbError: any) {
      console.error("Failed to retrieve customers for personalization dispatch:", dbError.message);
    }
  }
}
