import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Mail, MessageSquare, PhoneCall, Sparkles, Eye, Play, Edit2, Trash2 } from "lucide-react";
import type { CampaignData } from "../../../types/api";
import { StatusBadge } from "../../../components/StatusBadge";

interface CampaignCardProps {
  campaign: CampaignData;
  onLaunch: (id: number) => void;
  isLaunching: boolean;
  onDelete?: (id: number) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onLaunch,
  isLaunching,
  onDelete,
}) => {
  const navigate = useNavigate();

  const channelConfig = {
    email: { label: "Email", icon: Mail, bg: "bg-blue-50/70 text-blue-700 border-blue-100/50 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50" },
    sms: { label: "SMS", icon: MessageSquare, bg: "bg-amber-50/70 text-amber-700 border-amber-100/50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50" },
    whatsapp: { label: "WhatsApp", icon: PhoneCall, bg: "bg-emerald-50/70 text-emerald-700 border-emerald-100/50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50" },
    rcs: { label: "RCS", icon: Sparkles, bg: "bg-indigo-50/70 text-indigo-700 border-indigo-100/50 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50" },
  };

  const channel = campaign.channel.toLowerCase() as keyof typeof channelConfig;
  const config = channelConfig[channel] || {
    label: campaign.channel,
    icon: MessageSquare,
    bg: "bg-slate-50 text-slate-700 border-slate-100",
  };
  const ChannelIcon = config.icon;

  const formattedDate = new Date(campaign.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formatAudienceFilters = (filters: any) => {
    if (!filters || Object.keys(filters).length === 0) return null;
    const parts: string[] = [];
    if (filters.minSpend !== undefined) parts.push(`Spend ≥ ₹${filters.minSpend.toLocaleString()}`);
    if (filters.minOrders !== undefined) parts.push(`Orders ≥ ${filters.minOrders}`);
    if (filters.lastPurchaseDays !== undefined) parts.push(`Active ≤ ${filters.lastPurchaseDays}d`);
    return parts.length > 0 ? parts.join(" • ") : null;
  };

  const audienceSummary = formatAudienceFilters(campaign.audienceFilters);

  const handleEditDraft = () => {
    navigate("/campaign/new", {
      state: {
        audienceFilters: campaign.audienceFilters,
        audienceSummary: {
          audienceSize: 1200, // mock/placeholder since DB doesn't persist stats
          averageSpend: 15000,
          averageOrders: 4.5,
        },
      },
    });
  };

  const isDraft = campaign.status === "draft";

  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-xs hover:shadow-md hover:border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 transition-all duration-200 group">
      {/* Badges row */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <StatusBadge status={campaign.status} />
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${config.bg}`}
        >
          <ChannelIcon className="h-3.5 w-3.5" />
          {config.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2 mb-6">
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
          {campaign.title}
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {campaign.goal}
        </p>
      </div>

      {/* Meta info */}
      <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4 mb-6 text-xs text-slate-400 dark:text-slate-500 shrink-0">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          <span>Created on {formattedDate}</span>
        </div>
        {audienceSummary && (
          <div className="rounded-xl bg-slate-50 p-2 text-slate-600 border border-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800">
            <span className="font-semibold text-slate-400 dark:text-slate-500 block mb-0.5 uppercase tracking-wider text-[9px]">
              Audience Segment
            </span>
            <span className="font-medium text-[11px] text-slate-700 dark:text-slate-300">{audienceSummary}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 shrink-0">
        {isDraft ? (
          <>
            <button
              onClick={handleEditDraft}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Draft
            </button>
            <button
              onClick={() => onLaunch(campaign.id)}
              disabled={isLaunching}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              {isLaunching ? "Launching..." : "Launch"}
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(campaign.id)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-950/40 dark:bg-slate-950 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </>
        ) : (
          <Link
            to={`/campaign/${campaign.id}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 py-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            View Analytics
          </Link>
        )}
      </div>
    </div>
  );
};
