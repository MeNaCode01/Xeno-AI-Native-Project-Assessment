import { request } from "./client";

export interface CampaignAnalyticsResponse {
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

export const analyticsApi = {
  /**
   * Fetches real-time aggregated analytics for a campaign
   */
  getCampaignAnalytics: async (id: number): Promise<CampaignAnalyticsResponse> => {
    return request<CampaignAnalyticsResponse>(`/campaigns/${id}/analytics`, {
      method: "GET",
    });
  },
};
