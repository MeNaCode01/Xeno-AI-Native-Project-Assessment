import React from "react";
import { Link } from "react-router-dom";
import { Megaphone, Plus } from "lucide-react";

export const CampaignEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-950 shadow-xs max-w-xl mx-auto my-8 space-y-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 animate-pulse">
        <Megaphone className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">No campaigns created yet.</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
          Create custom segments of your customers and use generative AI to strategize high-impact marketing messages.
        </p>
      </div>
      <Link
        to="/audience"
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-all duration-150"
      >
        <Plus className="h-4 w-4" />
        Create Campaign
      </Link>
    </div>
  );
};
