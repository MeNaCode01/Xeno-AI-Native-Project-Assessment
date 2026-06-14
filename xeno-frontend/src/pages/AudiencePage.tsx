import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sliders, Sparkles, Users, Coins, ShoppingCart, ArrowRight, RotateCcw } from "lucide-react";
import { PageContainer } from "../components/PageContainer";
import { StatsCard } from "../components/StatsCard";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { useAudienceManual, useAudienceAI } from "../features/audience/hooks/useAudience";
import type { ManualAudienceRequest } from "../api/audienceApi";
import type { AudienceStats, AudienceFilters } from "../types/api";

export const AudiencePage: React.FC = () => {
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");

  // --- Manual Filters State ---
  const [minSpend, setMinSpend] = useState(5000);
  const [minOrders, setMinOrders] = useState(3);
  const [lastPurchaseDays, setLastPurchaseDays] = useState(90);

  // Active checkboxes for omitting filters
  const [filterConfig, setFilterConfig] = useState({
    minSpend: true,
    minOrders: true,
    lastPurchaseDays: true,
  });

  // Debounced filters state for manual query
  const [debouncedFilters, setDebouncedFilters] = useState<ManualAudienceRequest>({});

  // Trigger manual filters debounce on state change
  useEffect(() => {
    const queryObj: ManualAudienceRequest = {};
    if (filterConfig.minSpend) queryObj.minSpend = minSpend;
    if (filterConfig.minOrders) queryObj.minOrders = minOrders;
    if (filterConfig.lastPurchaseDays) queryObj.lastPurchaseDays = lastPurchaseDays;

    const timer = setTimeout(() => {
      setDebouncedFilters(queryObj);
    }, 500);

    return () => clearTimeout(timer);
  }, [minSpend, minOrders, lastPurchaseDays, filterConfig]);

  // --- React Query Hooks ---
  const isManualActive = activeTab === "manual";
  const {
    data: manualData,
    isLoading: isManualLoading,
    error: manualError,
    refetch: refetchManual,
  } = useAudienceManual(debouncedFilters, isManualActive);

  const aiMutation = useAudienceAI();
  const [aiPrompt, setAiPrompt] = useState("");

  // Handle AI Prompt submission
  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    aiMutation.mutate({ prompt: aiPrompt.trim() });
  };

  // --- Preview Metrics Resolution ---
  let showLoading = false;
  let showError: Error | null = null;
  let activeStats: AudienceStats | null = null;
  let activeFilters: AudienceFilters = {};
  let showEmptyState = false;

  if (activeTab === "manual") {
    showLoading = isManualLoading;
    showError = manualError;
    activeStats = manualData || null;
    activeFilters = debouncedFilters;
  } else {
    showLoading = aiMutation.isPending;
    showError = aiMutation.error;
    activeStats = aiMutation.data
      ? {
          audienceSize: aiMutation.data.audienceSize,
          averageSpend: aiMutation.data.averageSpend,
          averageOrders: aiMutation.data.averageOrders,
        }
      : null;
    activeFilters = aiMutation.data?.audienceFilters || {};
    showEmptyState = !aiMutation.data && !aiMutation.isPending;
  }

  // --- Proceed handler ---
  const handleProceed = () => {
    if (!activeStats || activeStats.audienceSize === 0) return;

    navigate("/campaign/new", {
      state: {
        audienceFilters: activeFilters,
        audienceSummary: activeStats,
      },
    });
  };

  return (
    <PageContainer
      title="Audience Builder"
      subtitle="Create a customer segment using manual filters or AI assistance."
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Section: Controls Panel */}
        <div className="space-y-6 lg:col-span-2">
          {/* Tabs header */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1">
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === "manual"
                  ? "bg-white text-indigo-700 shadow-xs dark:bg-slate-950 dark:text-indigo-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Sliders className="h-4 w-4" />
              Manual Filters
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === "ai"
                  ? "bg-white text-indigo-700 shadow-xs dark:bg-slate-950 dark:text-indigo-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              AI Assistant
            </button>
          </div>

          {/* Controls body */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
            {activeTab === "manual" ? (
              <div className="space-y-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Define Segment Constraints</h3>

                {/* Slider 1: Spend */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterConfig.minSpend}
                        onChange={(e) =>
                          setFilterConfig((prev) => ({ ...prev, minSpend: e.target.checked }))
                        }
                        className="rounded-sm border-slate-300 dark:border-slate-700 dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-950 h-4 w-4"
                      />
                      Minimum Spending (₹)
                    </label>
                    <span
                      className={`text-sm font-bold ${
                        filterConfig.minSpend ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-600 line-through"
                      }`}
                    >
                      ₹{minSpend.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={minSpend}
                    disabled={!filterConfig.minSpend}
                    onChange={(e) => setMinSpend(Number(e.target.value))}
                    className="w-full accent-indigo-600 disabled:opacity-40 cursor-pointer"
                  />
                </div>

                {/* Slider 2: Orders */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterConfig.minOrders}
                        onChange={(e) =>
                          setFilterConfig((prev) => ({ ...prev, minOrders: e.target.checked }))
                        }
                        className="rounded-sm border-slate-300 dark:border-slate-700 dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-950 h-4 w-4"
                      />
                      Minimum Orders Count
                    </label>
                    <span
                      className={`text-sm font-bold ${
                        filterConfig.minOrders ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-600 line-through"
                      }`}
                    >
                      {minOrders} orders
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={minOrders}
                    disabled={!filterConfig.minOrders}
                    onChange={(e) => setMinOrders(Number(e.target.value))}
                    className="w-full accent-indigo-600 disabled:opacity-40 cursor-pointer"
                  />
                </div>

                {/* Slider 3: Purchase Recency */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterConfig.lastPurchaseDays}
                        onChange={(e) =>
                          setFilterConfig((prev) => ({
                            ...prev,
                            lastPurchaseDays: e.target.checked,
                          }))
                        }
                        className="rounded-sm border-slate-300 dark:border-slate-700 dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-950 h-4 w-4"
                      />
                      Last Purchase Recency (Days)
                    </label>
                    <span
                      className={`text-sm font-bold ${
                        filterConfig.lastPurchaseDays
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400 dark:text-slate-600 line-through"
                      }`}
                    >
                      Within {lastPurchaseDays} days
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="365"
                    step="5"
                    value={lastPurchaseDays}
                    disabled={!filterConfig.lastPurchaseDays}
                    onChange={(e) => setLastPurchaseDays(Number(e.target.value))}
                    className="w-full accent-indigo-600 disabled:opacity-40 cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={handleAISubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="prompt" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Describe your audience
                  </label>
                  <textarea
                    id="prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Find customers who spent more than ₹10000 but haven't purchased in 90 days."
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-sm outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all duration-150 resize-none text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950"
                  />
                </div>
                <button
                  type="submit"
                  disabled={aiMutation.isPending || !aiPrompt.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-850 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  {aiMutation.isPending ? "Generating Segment..." : "Generate Audience"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Section: Audience Preview & Proceed */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm flex flex-col h-full justify-between min-h-[350px]">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Audience Preview</h3>

              {showError && (
                <div className="rounded-xl bg-red-50 dark:bg-red-955/20 p-4 border border-red-100 dark:border-red-900/30 text-sm text-red-700 dark:text-red-300 space-y-2">
                  <p className="font-semibold">Failed to fetch stats</p>
                  <p className="text-xs">{showError.message}</p>
                  {activeTab === "manual" && (
                    <button
                      onClick={() => refetchManual()}
                      className="flex items-center gap-1 text-xs font-bold text-red-900 dark:text-red-400 underline hover:no-underline cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" /> Retry
                    </button>
                  )}
                </div>
              )}

              {showEmptyState && (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                  Enter an AI description on the left and click generate to preview audience statistics.
                </div>
              )}

              {showLoading && (
                <div className="space-y-4">
                  <LoadingSkeleton className="h-24 w-full rounded-xl" />
                  <LoadingSkeleton className="h-24 w-full rounded-xl" />
                  <LoadingSkeleton className="h-24 w-full rounded-xl" />
                </div>
              )}

              {!showLoading && !showError && activeStats && (
                <div className="space-y-4">
                  <StatsCard
                    title="Audience Size"
                    value={activeStats.audienceSize.toLocaleString()}
                    description="Matching customer profiles"
                    icon={<Users className="h-5 w-5" />}
                  />
                  <StatsCard
                    title="Average Spend"
                    value={`₹${activeStats.averageSpend.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                    description="Lifetime spending average"
                    icon={<Coins className="h-5 w-5" />}
                  />
                  <StatsCard
                    title="Average Order Count"
                    value={`${activeStats.averageOrders.toLocaleString(undefined, {
                      maximumFractionDigits: 1,
                    })} orders`}
                    description="Orders count average per customer"
                    icon={<ShoppingCart className="h-5 w-5" />}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleProceed}
                disabled={!activeStats || activeStats.audienceSize === 0 || showLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-850 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
              >
                Proceed to Campaign
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
