import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, FilterX } from "lucide-react";
import { PageContainer } from "../components/PageContainer";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { useCampaignList, useLaunchCampaign, useDeleteCampaign } from "../features/campaign/hooks/useCampaign";
import { CampaignCard } from "../features/campaign/components/CampaignCard";
import { CampaignFilters } from "../features/campaign/components/CampaignFilters";
import { CampaignSearch } from "../features/campaign/components/CampaignSearch";
import { CampaignEmptyState } from "../features/campaign/components/CampaignEmptyState";
import { useToast } from "../context/ToastContext";
import { ConfirmationDialog } from "../components/ConfirmationDialog";

export const CampaignsListPage: React.FC = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search input state (debounced client-side inside CampaignSearch)
  const [searchQuery, setSearchQuery] = useState("");

  // React Query: Fetch campaigns
  const { data: campaigns, isLoading, error } = useCampaignList();

  // React Query: Launch mutation
  const launchMutation = useLaunchCampaign();

  // React Query: Delete mutation
  const deleteMutation = useDeleteCampaign();

  // State to track campaign deletion modal
  const [deleteCampaignId, setDeleteCampaignId] = useState<number | null>(null);

  // Get active filter criteria from URL search params
  const statusFilter = searchParams.get("status") || "all";
  const channelFilter = searchParams.get("channel") || "all";
  const sortOrder = searchParams.get("sort") || "newest";

  // Navigation handlers for filters updates
  const handleStatusChange = (newStatus: string) => {
    setSearchParams((prev) => {
      if (newStatus === "all") prev.delete("status");
      else prev.set("status", newStatus);
      return prev;
    });
  };

  const handleChannelChange = (newChannel: string) => {
    setSearchParams((prev) => {
      if (newChannel === "all") prev.delete("channel");
      else prev.set("channel", newChannel);
      return prev;
    });
  };

  const handleSortChange = (newSort: string) => {
    setSearchParams((prev) => {
      if (newSort === "newest") prev.delete("sort");
      else prev.set("sort", newSort);
      return prev;
    });
  };

  // Clear filters utility
  const handleClearFilters = () => {
    setSearchParams({});
    setSearchQuery("");
  };

  // Launch handler
  const handleLaunchCampaign = (id: number) => {
    launchMutation.mutate(id, {
      onSuccess: () => {
        showToast("Campaign launched successfully!", "success");
      },
      onError: (err) => {
        showToast(`Launch failed: ${err.message}`, "error");
      },
    });
  };

  // Delete handler
  const handleConfirmDelete = () => {
    if (deleteCampaignId === null) return;

    deleteMutation.mutate(deleteCampaignId, {
      onSuccess: () => {
        showToast("Draft campaign deleted successfully.", "success");
        setDeleteCampaignId(null);
      },
      onError: (err) => {
        showToast(err.message || "Failed to delete campaign.", "error");
      },
    });
  };

  // Process campaign filtering and sorting client-side
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];

    let result = [...campaigns];

    // Filter by text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.goal.toLowerCase().includes(q) ||
          (c.message && c.message.toLowerCase().includes(q))
      );
    }

    // Filter by campaign status
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Filter by campaign communication channel
    if (channelFilter !== "all") {
      result = result.filter((c) => c.channel.toLowerCase() === channelFilter.toLowerCase());
    }

    // Sort list
    result.sort((a, b) => {
      if (sortOrder === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortOrder === "alphabetical") {
        return a.title.localeCompare(b.title);
      } else {
        // default "newest"
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [campaigns, searchQuery, statusFilter, channelFilter, sortOrder]);

  // Handle various states: loading, error, empty database, filtered empty list
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-xs space-y-4"
            >
              <div className="flex justify-between items-center">
                <LoadingSkeleton className="h-5 w-16" />
                <LoadingSkeleton className="h-5 w-20" />
              </div>
              <div className="space-y-2 flex-1">
                <LoadingSkeleton className="h-6 w-3/4" />
                <LoadingSkeleton className="h-4 w-full" />
                <LoadingSkeleton className="h-4 w-5/6" />
              </div>
              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 space-y-2">
                <LoadingSkeleton className="h-4 w-1/2" />
                <LoadingSkeleton className="h-4 w-2/3" />
              </div>
              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex gap-2">
                <LoadingSkeleton className="h-10 flex-1" />
                <LoadingSkeleton className="h-10 flex-1" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-100 dark:border-red-950/40 bg-red-50/50 dark:bg-red-950/20 p-6 text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-300">Failed to load campaigns</h3>
            <p className="text-sm text-red-600 dark:text-red-400">
              There was an issue fetching your campaigns: {error.message || "Unknown error"}
            </p>
          </div>
        </div>
      );
    }

    // If database is completely empty
    if (!campaigns || campaigns.length === 0) {
      return <CampaignEmptyState />;
    }

    // If active filters returned an empty list
    if (filteredCampaigns.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-12 border border-slate-100 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-950 shadow-xs max-w-md mx-auto my-8 space-y-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
            <FilterX className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">No matching campaigns</h4>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Try adjusting your search terms or filters to locate the campaigns.
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      );
    }

    // Render campaign grid
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCampaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onLaunch={handleLaunchCampaign}
            isLaunching={launchMutation.isPending && launchMutation.variables === campaign.id}
            onDelete={(id) => setDeleteCampaignId(id)}
          />
        ))}
      </div>
    );
  };

  return (
    <PageContainer
      title="Campaign History"
      subtitle="Browse and manage your marketing campaigns."
    >
      <div className="space-y-6">
        {/* Controls: Search and Filters */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <CampaignSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
          <CampaignFilters
            status={statusFilter}
            channel={channelFilter}
            sort={sortOrder}
            onStatusChange={handleStatusChange}
            onChannelChange={handleChannelChange}
            onSortChange={handleSortChange}
          />
        </div>

        {/* Campaign List Grid */}
        <div className="min-h-[300px]">{renderContent()}</div>
      </div>

      <ConfirmationDialog
        isOpen={deleteCampaignId !== null}
        title="Delete Draft Campaign?"
        description="This action cannot be undone.&#10;The draft campaign will be permanently removed."
        confirmLabel="Delete Campaign"
        cancelLabel="Cancel"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCampaignId(null)}
      />
    </PageContainer>
  );
};
