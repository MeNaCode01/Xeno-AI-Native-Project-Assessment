import { useQuery, useMutation } from "@tanstack/react-query";
import { audienceApi } from "../../../api/audienceApi";
import type { ManualAudienceRequest, AIAudienceRequest, AIAudienceResponse } from "../../../api/audienceApi";
import type { AudienceStats } from "../../../types/api";

/**
 * Hook to query audience stats dynamically from manual criteria sliders
 */
export const useAudienceManual = (filters: ManualAudienceRequest, enabled: boolean = true) => {
  return useQuery<AudienceStats, Error>({
    queryKey: ["audience", "manual", filters],
    queryFn: () => audienceApi.getManualStats(filters),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

/**
 * Hook to request audience stats and filter parameters using natural language prompts
 */
export const useAudienceAI = () => {
  return useMutation<AIAudienceResponse, Error, AIAudienceRequest>({
    mutationFn: (body: AIAudienceRequest) => audienceApi.getAIStats(body),
  });
};
