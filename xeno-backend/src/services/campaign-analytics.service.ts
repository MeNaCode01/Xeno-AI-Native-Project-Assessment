import { prisma } from "../db/prisma";
import { CampaignNotFoundError } from "./campaign-launch.service";

export interface CampaignAnalyticsResult {
  campaignId: number;
  campaignTitle: string;
  campaignStatus: string;
  totalRecipients: number;
  pending: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export class CampaignAnalyticsService {
  /**
   * Computes dynamic, real-time analytics for a campaign from the Communication records.
   */
  static async getAnalytics(campaignId: number): Promise<CampaignAnalyticsResult> {
    // 1. Fetch Campaign Info
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new CampaignNotFoundError(`Campaign with ID ${campaignId} not found`);
    }

    // 2. Perform GroupBy query on Communication table to retrieve status aggregates
    const groupings = await prisma.communication.groupBy({
      by: ["status"],
      where: { campaignId },
      _count: {
        id: true,
      },
    });

    // Initialize counts structure for raw database statuses
    const rawCounts: Record<string, number> = {
      pending: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      failed: 0,
    };

    // Map DB counts to the raw counts object
    for (const group of groupings) {
      const statusKey = group.status.toLowerCase();
      const count = group._count.id;
      if (statusKey in rawCounts) {
        rawCounts[statusKey] = count;
      }
    }

    // Compute cumulative funnel stages:
    // Any converted message was also clicked, opened, and delivered.
    // Any clicked message was also opened and delivered.
    // Any opened message was also delivered.
    const converted = rawCounts.converted;
    const clicked = rawCounts.clicked + converted;
    const opened = rawCounts.opened + clicked;
    const delivered = rawCounts.delivered + opened;
    const pending = rawCounts.pending;
    const failed = rawCounts.failed;
    
    // totalRecipients represents all communications created under this campaign
    const totalRecipients = pending + delivered + failed;

    // 3. Compute rates
    const calcRate = (num: number, den: number): number => {
      if (den === 0) return 0;
      return parseFloat(((num / den) * 100).toFixed(2));
    };

    const deliveryRate = calcRate(delivered, totalRecipients);
    const openRate = calcRate(opened, delivered);
    const clickRate = calcRate(clicked, opened);
    const conversionRate = calcRate(converted, clicked);

    return {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      campaignStatus: campaign.status,
      totalRecipients,
      pending,
      delivered,
      opened,
      clicked,
      converted,
      failed,
      deliveryRate,
      openRate,
      clickRate,
      conversionRate,
    };
  }
}
