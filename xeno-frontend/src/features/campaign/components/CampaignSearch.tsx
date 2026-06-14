import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface CampaignSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const CampaignSearch: React.FC<CampaignSearchProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync internal state with prop when search value is changed from outside (e.g. reset filters)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce change callback by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, 350);

    return () => clearTimeout(handler);
  }, [localValue, onChange]);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Search campaigns by title or goal..."
        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 pl-11 pr-10 py-3 text-sm outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 transition-all duration-150 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950"
      />
      {localValue && (
        <button
          onClick={() => setLocalValue("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-hidden cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
