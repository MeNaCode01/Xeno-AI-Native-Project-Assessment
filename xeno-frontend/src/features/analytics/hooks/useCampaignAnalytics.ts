import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../../../api/analyticsApi";
import type { CampaignAnalyticsResponse } from "../../../api/analyticsApi";

/**
 * Hook to retrieve campaign live performance analytics
 * @param id Campaign ID
 * @param refetchInterval Polling interval in ms, or false to disable
 */
export const useCampaignAnalytics = (id: number, refetchInterval: number | false) => {
  return useQuery<CampaignAnalyticsResponse, Error>({
    queryKey: ["campaign", id, "analytics"],
    queryFn: () => analyticsApi.getCampaignAnalytics(id),
    refetchInterval,
    refetchOnWindowFocus: true, // Automatically poll/refetch when window gains focus
  });
};
