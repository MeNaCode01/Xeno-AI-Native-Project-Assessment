import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { PageContainer } from "../components/PageContainer";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { useCampaignAnalytics } from "../features/analytics/hooks/useCampaignAnalytics";
import { AnalyticsHeader } from "../features/analytics/components/AnalyticsHeader";
import { LiveIndicator } from "../features/analytics/components/LiveIndicator";
import { MetricsGrid } from "../features/analytics/components/MetricsGrid";
import { FunnelChart } from "../features/analytics/components/FunnelChart";
import { StatusBreakdown } from "../features/analytics/components/StatusBreakdown";
import { InsightCard } from "../features/analytics/components/InsightCard";

export const CampaignAnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const campaignId = Number(id);
  const isInvalidId = isNaN(campaignId) || campaignId <= 0;

  // Manage live polling autorefresh state
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // React Query: Fetch analytics data
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useCampaignAnalytics(campaignId, !isInvalidId && isLive ? 5000 : false);

  // Sync last updated timestamp on successful fetches
  useEffect(() => {
    if (data) {
      setLastUpdated(new Date());
    }
  }, [data]);

  // Loading skeletons matching final dashboard layout
  if (isLoading) {
    return (
      <PageContainer title="Campaign Performance" subtitle="Loading analytics reports...">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <LoadingSkeleton className="h-4 w-28" />
              <div className="flex gap-2">
                <LoadingSkeleton className="h-8 w-60" />
                <LoadingSkeleton className="h-8 w-16" />
              </div>
              <LoadingSkeleton className="h-4 w-40" />
            </div>
            <LoadingSkeleton className="h-10 w-32" />
          </div>

          {/* Polling Toggle Skeleton */}
          <LoadingSkeleton className="h-16 w-full" />

          {/* KPI Cards Row Skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 p-6 space-y-3">
                <div className="flex justify-between">
                  <LoadingSkeleton className="h-4 w-20" />
                  <LoadingSkeleton className="h-5 w-5 rounded-full" />
                </div>
                <LoadingSkeleton className="h-8 w-24" />
                <LoadingSkeleton className="h-3 w-32" />
              </div>
            ))}
          </div>

          {/* Funnel and Breakdown Columns Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LoadingSkeleton className="h-[380px] w-full" />
            <div className="space-y-6">
              <LoadingSkeleton className="h-[250px] w-full" />
              <LoadingSkeleton className="h-[120px] w-full" />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Handle errors or not-found status (Friendly Error Page)
  if (isInvalidId || error) {
    const errorMsg = error?.message || "Invalid Campaign ID specified";
    const isNotFound = errorMsg.toLowerCase().includes("not found") || errorMsg.includes("404");

    return (
      <PageContainer title="Campaign Analytics Error">
        <div className="rounded-2xl border border-red-100 dark:border-red-950/40 bg-red-50/30 dark:bg-red-950/20 p-12 text-center max-w-xl mx-auto space-y-6 shadow-xs my-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isNotFound ? "Campaign Not Found" : "Failed to load analytics"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {isNotFound
                ? "The campaign performance report you are looking for does not exist or hasn't been launched yet."
                : `We encountered an issue retrieving the campaign performance logs: ${errorMsg}`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => navigate("/campaigns")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Campaign History
            </button>
            {!isNotFound && (
              <button
                onClick={() => refetch()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Connection
              </button>
            )}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <PageContainer
      title="Campaign Performance"
      subtitle="Dynamic conversion rates and recipient communication updates"
    >
      <div className="space-y-6">
        {/* Analytics Header Section */}
        <AnalyticsHeader
          title={data.campaignTitle}
          status={data.campaignStatus}
          id={data.campaignId}
          lastUpdated={lastUpdated}
          onRefresh={refetch}
          isFetching={isFetching}
        />

        {/* Polling Live Toggle Indicator */}
        <LiveIndicator isLive={isLive} onToggle={() => setIsLive(!isLive)} />

        {/* KPI Rates Row */}
        <MetricsGrid
          deliveryRate={data.deliveryRate}
          openRate={data.openRate}
          clickRate={data.clickRate}
          conversionRate={data.conversionRate}
          deliveredCount={data.delivered}
          openedCount={data.opened}
          clickedCount={data.clicked}
          convertedCount={data.converted}
        />

        {/* Main Dashboard Visualizers (2 columns on desktop, stacked on mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel Graph visualizer */}
          <FunnelChart
            totalRecipients={data.totalRecipients}
            delivered={data.delivered}
            opened={data.opened}
            clicked={data.clicked}
            converted={data.converted}
          />

          {/* Raw counts breakdown list and deterministic insights */}
          <div className="space-y-6">
            <StatusBreakdown
              total={data.totalRecipients}
              pending={data.pending}
              delivered={data.delivered}
              opened={data.opened}
              clicked={data.clicked}
              converted={data.converted}
              failed={data.failed}
            />

            <InsightCard
              deliveryRate={data.deliveryRate}
              openRate={data.openRate}
              clickRate={data.clickRate}
              conversionRate={data.conversionRate}
              totalRecipients={data.totalRecipients}
              failed={data.failed}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
