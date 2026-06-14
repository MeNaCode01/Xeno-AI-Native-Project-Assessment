import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Calendar, Hash } from "lucide-react";
import { StatusBadge } from "../../../components/StatusBadge";

interface AnalyticsHeaderProps {
  title: string;
  status: string;
  id: number;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isFetching: boolean;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  title,
  status,
  id,
  lastUpdated,
  onRefresh,
  isFetching,
}) => {
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Never";

  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between shrink-0">
      <div className="space-y-2">
        <Link
          to="/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Campaigns
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{title}</h1>
          <StatusBadge status={status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <Hash className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
            Campaign ID: <span className="font-semibold text-slate-600 dark:text-slate-300">{id}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
            Last Updated: <span className="font-semibold text-slate-600 dark:text-slate-300">{formattedTime}</span>
          </span>
        </div>
      </div>

      <button
        onClick={onRefresh}
        disabled={isFetching}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-150 shadow-xs cursor-pointer"
      >
        <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        Refresh Data
      </button>
    </div>
  );
};
