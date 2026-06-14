import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignApi } from "../../../api/campaignApi";
import type { GenerateCampaignRequest, LaunchCampaignResponse, GenerateCampaignResponse } from "../../../api/campaignApi";
import type { CampaignData } from "../../../types/api";

/**
 * Hook to retrieve all campaigns list
 */
export const useCampaignList = () => {
  return useQuery<CampaignData[], Error>({
    queryKey: ["campaigns"],
    queryFn: () => campaignApi.list(),
    refetchOnMount: "always", // Ensure it refetches when returning to the page
  });
};

/**
 * Mutation hook to generate a new AI campaign
 */
export const useGenerateCampaign = () => {
  return useMutation<GenerateCampaignResponse, Error, GenerateCampaignRequest>({
    mutationFn: (body: GenerateCampaignRequest) => campaignApi.create(body),
  });
};

/**
 * Mutation hook to launch a campaign and broadcast messages to the target audience
 */
export const useLaunchCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation<LaunchCampaignResponse, Error, number>({
    mutationFn: (id: number) => campaignApi.send(id),
    onSuccess: (data) => {
      // Invalidate caches to trigger updates across the UI
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", data.campaignId] });
      queryClient.invalidateQueries({ queryKey: ["campaign", data.campaignId, "analytics"] });
    },
  });
};

/**
 * Mutation hook to delete a draft campaign
 */
export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id: number) => campaignApi.delete(id),
    onSuccess: () => {
      // Invalidate campaigns list cache
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};
