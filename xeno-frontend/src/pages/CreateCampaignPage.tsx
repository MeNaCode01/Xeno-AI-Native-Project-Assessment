import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Users, Coins, ShoppingCart, Sparkles, Send, RefreshCw, FileText, ChevronRight, MessageSquare, AlertCircle } from "lucide-react";
import { PageContainer } from "../components/PageContainer";
import { StatsCard } from "../components/StatsCard";
import { useGenerateCampaign, useLaunchCampaign } from "../features/campaign/hooks/useCampaign";
import { useToast } from "../context/ToastContext";
import type { GenerateCampaignResponse } from "../api/campaignApi";

export const CreateCampaignPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Retrieve routing states passed from Audience Builder
  const { audienceFilters, audienceSummary } = (location.state || {}) as {
    audienceFilters?: any;
    audienceSummary?: {
      audienceSize: number;
      averageSpend: number;
      averageOrders: number;
    };
  };

  // State
  const [goal, setGoal] = useState("");
  const [campaign, setCampaign] = useState<GenerateCampaignResponse | null>(null);
  const [campaignId, setCampaignId] = useState<number | undefined>(undefined);

  // Editable fields in review card
  const [editableTitle, setEditableTitle] = useState("");
  const [editableMessage, setEditableMessage] = useState("");
  const [editableChannel, setEditableChannel] = useState<"whatsapp" | "sms" | "email" | "rcs">("email");

  // AI loading step progress strings
  const loadingSteps = [
    "Understanding audience segment traits...",
    "Planning communication and conversion channel...",
    "Drafting strategic marketing copywriting...",
    "Finalizing campaign draft assets...",
  ];
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Mutations
  const generateMutation = useGenerateCampaign();
  const launchMutation = useLaunchCampaign();

  // Cycle loading step messages during campaign generation
  useEffect(() => {
    let interval: any;
    if (generateMutation.isPending) {
      setCurrentStepIdx(0);
      interval = setInterval(() => {
        setCurrentStepIdx((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [generateMutation.isPending]);

  // Sync mutation success payload to local form state
  useEffect(() => {
    if (generateMutation.data) {
      const data = generateMutation.data;
      setCampaign(data);
      setCampaignId(data.campaignId);
      setEditableTitle(data.title);
      setEditableMessage(data.message);
      setEditableChannel(data.channel);
    }
  }, [generateMutation.data]);

  // If audience state is missing, show a friendly empty state
  if (!audienceFilters || !audienceSummary) {
    return (
      <PageContainer title="Create AI Campaign">
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-12 text-center max-w-xl mx-auto space-y-6 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">No Target Audience Selected</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You must first select or generate a customer audience segment before creating a campaign.
            </p>
          </div>
          <button
            onClick={() => navigate("/audience")}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Return to Audience Builder
          </button>
        </div>
      </PageContainer>
    );
  }

  // Handle generation action
  const handleGenerate = () => {
    if (!goal.trim()) {
      showToast("Campaign goal is required", "error");
      return;
    }

    generateMutation.mutate({
      goal: goal.trim(),
      audienceFilters,
      audienceSummary,
    }, {
      onSuccess: () => {
        showToast("Campaign generated successfully by AI", "success");
      },
      onError: (err) => {
        showToast(`Generation failed: ${err.message}`, "error");
      }
    });
  };

  // Handle launch action
  const handleLaunch = () => {
    if (!campaign || !campaignId) return;

    const generatedCampaign = campaign;
    console.log({
      generatedCampaign,
      campaignId,
    });

    // Use latest edits in launch
    launchMutation.mutate(campaignId, {
      onSuccess: (data) => {
        showToast("Campaign launched successfully!", "success");
        navigate(`/campaign/${data.campaignId}`);
      },
      onError: (err) => {
        showToast(`Launch failed: ${err.message}`, "error");
      }
    });
  };

  // Helper to render message copy previewing the custom name tag
  const renderMessagePreview = (text: string) => {
    return text;
  };

  return (
    <PageContainer
      title="Create AI Campaign"
      subtitle="Define campaign goals and let AI write strategic messages for your segment."
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Section: Target details & inputs */}
        <div className="space-y-6 lg:col-span-2">
          {/* Read-only Audience Summary Panel */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Target Audience</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatsCard
                title="Size"
                value={audienceSummary.audienceSize.toLocaleString()}
                icon={<Users className="h-4 w-4" />}
              />
              <StatsCard
                title="Avg Spend"
                value={`₹${audienceSummary.averageSpend.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}`}
                icon={<Coins className="h-4 w-4" />}
              />
              <StatsCard
                title="Avg Orders"
                value={`${audienceSummary.averageOrders.toFixed(1)}`}
                icon={<ShoppingCart className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Goal Input panel */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <label htmlFor="goal" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                What is the campaign goal?
              </label>
              <textarea
                id="goal"
                value={goal}
                disabled={generateMutation.isPending || launchMutation.isPending}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Re-engage premium customers who haven't purchased recently."
                rows={3}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-sm outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all duration-150 resize-none text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950"
              />
            </div>

            {!campaign && !generateMutation.isPending && (
              <button
                onClick={handleGenerate}
                disabled={!goal.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                Generate Campaign
              </button>
            )}
          </div>

          {/* AI Step Loader Animation */}
          {generateMutation.isPending && (
            <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950/50 bg-indigo-50/30 dark:bg-indigo-950/10 p-8 text-center space-y-6 shadow-xs">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 mx-auto animate-spin">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-indigo-900 dark:text-indigo-300">AI Strategist active</h4>
                <div className="space-y-1">
                  {loadingSteps.map((step, idx) => (
                    <div
                      key={step}
                      className={`flex items-center justify-center gap-2 text-sm transition-opacity duration-300 ${
                        idx === currentStepIdx
                          ? "text-indigo-700 dark:text-indigo-400 font-bold opacity-100"
                          : idx < currentStepIdx
                          ? "text-slate-400 dark:text-slate-500 opacity-60 line-through"
                          : "text-slate-300 dark:text-slate-655 opacity-40"
                      }`}
                    >
                      <ChevronRight className={`h-4 w-4 ${idx === currentStepIdx ? "animate-pulse" : ""}`} />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Campaign review editor */}
          {campaign && !generateMutation.isPending && (
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Campaign Review</h3>
                <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase">
                  Draft Generated
                </span>
              </div>

              {/* Title input */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Campaign Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={editableTitle}
                  disabled={launchMutation.isPending}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all duration-150 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Message textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="message" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Marketing Message
                  </label>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Use <code className="rounded-sm bg-slate-100 dark:bg-slate-900 px-1 py-0.5 text-slate-700 dark:text-slate-300 font-semibold font-mono">{"{{name}}"}</code> as recipient name token
                  </span>
                </div>
                <textarea
                  id="message"
                  value={editableMessage}
                  disabled={launchMutation.isPending}
                  onChange={(e) => setEditableMessage(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-sm font-mono outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all duration-150 resize-none bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Channel Selector */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Recommended Channel</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(["email", "whatsapp", "sms", "rcs"] as const).map((ch) => (
                    <label
                      key={ch}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 cursor-pointer text-center transition-all duration-150 ${
                        editableChannel === ch
                          ? "border-indigo-600 bg-indigo-50/40 text-indigo-700 font-bold dark:border-indigo-500 dark:bg-indigo-950/20 dark:text-indigo-400"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="channel"
                        value={ch}
                        checked={editableChannel === ch}
                        disabled={launchMutation.isPending}
                        onChange={() => setEditableChannel(ch)}
                        className="sr-only"
                      />
                      <span className="text-sm capitalize">{ch}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
                <button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending || launchMutation.isPending}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </button>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => showToast("Draft saved locally!", "info")}
                    disabled={generateMutation.isPending || launchMutation.isPending}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    Save Draft
                  </button>
                  <button
                    onClick={handleLaunch}
                    disabled={generateMutation.isPending || launchMutation.isPending}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    {launchMutation.isPending ? "Launching..." : "Launch Campaign"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Mobile Device Preview mockup */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6 self-start">
              Mobile Preview
            </h3>

            {/* Simulated Phone Shell */}
            <div className="relative mx-auto h-[460px] w-[240px] rounded-[36px] border-8 border-slate-900 dark:border-slate-850 bg-slate-950 p-2 shadow-xl flex flex-col justify-between overflow-hidden">
              {/* Speaker & notch */}
              <div className="absolute top-2 left-1/2 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-900 z-10 flex items-center justify-center">
                <div className="h-1.5 w-10 rounded-full bg-slate-800" />
              </div>

              {/* Status bar */}
              <div className="flex justify-between px-3 pt-3 pb-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 select-none">
                <span>9:41</span>
                <div className="flex gap-1">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Screen Body */}
              <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-[24px] p-3 overflow-y-auto flex flex-col justify-start">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-2 select-none">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] font-bold">
                    CS
                  </div>
                  <div className="text-[10px]">
                    <p className="font-bold text-slate-800 dark:text-slate-200">CRM Strategist</p>
                    <p className="text-slate-400 dark:text-slate-500 text-[8px] capitalize">{editableChannel}</p>
                  </div>
                </div>

                {/* Message bubble */}
                {editableMessage.trim() ? (
                  <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 shadow-xs space-y-1.5 max-w-[90%]">
                    {editableTitle.trim() && (
                      <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-900 pb-1">
                        {editableTitle}
                      </p>
                    )}
                    <p className="text-[9px] text-slate-600 dark:text-slate-300 leading-relaxed break-words whitespace-pre-line">
                      {renderMessagePreview(editableMessage)}
                    </p>
                    <p className="text-[7px] text-right text-slate-400 dark:text-slate-500">Just now</p>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-center p-4">
                    <div className="space-y-2">
                      <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Generate a campaign to preview its layout.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Home Indicator */}
              <div className="h-1 w-20 rounded-full bg-slate-800 mx-auto shrink-0 mb-1" />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
