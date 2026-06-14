import React from "react";

interface CampaignFiltersProps {
  status: string;
  channel: string;
  sort: string;
  onStatusChange: (status: string) => void;
  onChannelChange: (channel: string) => void;
  onSortChange: (sort: string) => void;
}

export const CampaignFilters: React.FC<CampaignFiltersProps> = ({
  status,
  channel,
  sort,
  onStatusChange,
  onChannelChange,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Status Filter */}
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5 text-sm bg-white dark:bg-slate-950 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all duration-150 text-slate-700 dark:text-slate-200"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Channel Filter */}
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Channel</label>
        <select
          value={channel}
          onChange={(e) => onChannelChange(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5 text-sm bg-white dark:bg-slate-950 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all duration-150 text-slate-700 dark:text-slate-200"
        >
          <option value="all">All Channels</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="rcs">RCS</option>
        </select>
      </div>

      {/* Sort Filter */}
      <div className="flex flex-col gap-1.5 min-w-[160px] sm:ml-auto">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort By</label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5 text-sm bg-white dark:bg-slate-950 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all duration-150 text-slate-700 dark:text-slate-200"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>
    </div>
  );
};
