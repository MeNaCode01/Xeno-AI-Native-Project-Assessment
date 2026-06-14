import React from "react";
import { Play, Pause } from "lucide-react";

interface LiveIndicatorProps {
  isLive: boolean;
  onToggle: () => void;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ isLive, onToggle }) => {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-4 shadow-xs shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          {isLive ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-300 dark:bg-slate-700"></span>
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            {isLive ? "Live Autorefresh" : "Autorefresh Paused"}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {isLive ? "Polling server every 5 seconds" : "Updates are paused"}
          </p>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
          isLive
            ? "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
        }`}
      >
        {isLive ? (
          <>
            <Pause className="h-3.5 w-3.5" />
            Pause
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5" />
            Resume
          </>
        )}
      </button>
    </div>
  );
};
