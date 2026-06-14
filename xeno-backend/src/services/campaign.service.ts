import { prisma } from "../db/prisma";
import { LLMHelper } from "../lib/llm";

export interface CreateCampaignParams {
  goal: string;
  audienceFilters: any;
  audienceSummary: any;
}

export interface CampaignResult {
  campaignId: number;
  title: string;
  message: string;
  channel: "whatsapp" | "sms" | "email" | "rcs";
  status: "draft" | "sent" | "completed";
}

export class CampaignService {
  /**
   * Generates a new marketing campaign using the AI strategist helper,
   * then saves it to the database as a draft.
   */
  static async createCampaign(params: CreateCampaignParams): Promise<CampaignResult> {
    const { goal, audienceFilters, audienceSummary } = params;

    // Generate campaign content (title, message, channel recommendation) using LLM
    const aiResponse = await LLMHelper.generateCampaign(goal, audienceFilters, audienceSummary);

    // Persist the campaign in the database.
    // Do not save audienceSummary since it is not requested in the DB schema.
    const campaign = await prisma.campaign.create({
      data: {
        title: aiResponse.title,
        goal: goal,
        message: aiResponse.message,
        channel: aiResponse.channel, // matches Channel enum in schema
        audienceFilters: audienceFilters, // JSON database field
        status: "draft",
      },
    });

    return {
      campaignId: campaign.id,
      title: campaign.title,
      message: campaign.message,
      channel: campaign.channel as "whatsapp" | "sms" | "email" | "rcs",
      status: campaign.status as "draft" | "sent" | "completed",
    };
  }

  /**
   * Retrieves all campaigns ordered by creation date descending
   */
  static async listCampaigns() {
    return prisma.campaign.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
