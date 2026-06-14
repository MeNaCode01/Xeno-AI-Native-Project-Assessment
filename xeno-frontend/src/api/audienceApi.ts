import { request } from "./client";
import type { AudienceStats, AudienceFilters } from "../types/api";

export interface ManualAudienceRequest {
  minSpend?: number;
  minOrders?: number;
  lastPurchaseDays?: number;
}

export interface AIAudienceRequest {
  prompt: string;
}

export interface AIAudienceResponse extends AudienceStats {
  audienceFilters: AudienceFilters;
}

export const audienceApi = {
  /**
   * Fetch audience stats using manual criteria
   */
  getManualStats: async (
    body: ManualAudienceRequest,
  ): Promise<AudienceStats> => {
    return request<AudienceStats>("/audiences/manual", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /**
   * Fetch audience stats using AI prompts
   */
  getAIStats: async (body: AIAudienceRequest): Promise<AIAudienceResponse> => {
    return request<AIAudienceResponse>("/audiences/ai", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
