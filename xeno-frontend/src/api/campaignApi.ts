import { request } from "./client";
import type { CampaignData } from "../types/api";

export interface GenerateCampaignRequest {
  goal: string;
  audienceFilters: any;
  audienceSummary: any;
}

export interface GenerateCampaignResponse {
  campaignId: number;
  title: string;
  message: string;
  channel: "whatsapp" | "sms" | "email" | "rcs";
  status: "draft" | "sent" | "completed";
}

export interface LaunchCampaignResponse {
  campaignId: number;
  campaignStatus: string;
  audienceSize: number;
  communicationsCreated: number;
  message: string;
}

export const campaignApi = {
  /**
   * Triggers the AI campaign generation and saves it as a draft
   */
  create: async (body: GenerateCampaignRequest): Promise<GenerateCampaignResponse> => {
    return request<GenerateCampaignResponse>("/campaigns", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /**
   * Launches a campaign by sending the messages
   */
  send: async (id: number): Promise<LaunchCampaignResponse> => {
    return request<LaunchCampaignResponse>(`/campaigns/${id}/send`, {
      method: "POST",
    });
  },

  /**
   * Fetches all campaigns
   */
  list: async (): Promise<CampaignData[]> => {
    return request<CampaignData[]>("/campaigns", {
      method: "GET",
    });
  },

  /**
   * Deletes a draft campaign by ID
   */
  delete: async (id: number): Promise<{ message: string }> => {
    return request<{ message: string }>(`/campaigns/${id}`, {
      method: "DELETE",
    });
  },
};
