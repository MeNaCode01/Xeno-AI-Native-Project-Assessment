import React from "react";
import { Clock, CheckCircle2, Eye, MousePointerClick, Target, AlertCircle } from "lucide-react";

interface StatusBreakdownProps {
  total: number;
  pending: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  failed: number;
}

export const StatusBreakdown: React.FC<StatusBreakdownProps> = ({
  total,
  pending,
  delivered,
  opened,
  clicked,
  converted,
  failed,
}) => {
  const getPct = (val: number) => {
    if (total === 0) return "0.0%";
    return `${((val / total) * 100).toFixed(1)}%`;
  };

  const statusConfigs = [
    {
      label: "Pending",
      count: pending,
      pct: getPct(pending),
      icon: Clock,
      colorClass: "text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30",
    },
    {
      label: "Delivered Only",
      count: delivered - opened, // Represents records that stopped at delivered status
      pct: getPct(Math.max(0, delivered - opened)),
      icon: CheckCircle2,
      colorClass: "text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/30",
    },
    {
      label: "Opened Only",
      count: opened - clicked, // Stopped at opened status
      pct: getPct(Math.max(0, opened - clicked)),
      icon: Eye,
      colorClass: "text-purple-600 bg-purple-50 border-purple-100 dark:text-purple-400 dark:bg-purple-950/20 dark:border-purple-900/30",
    },
    {
      label: "Clicked Only",
      count: clicked - converted, // Stopped at clicked status
      pct: getPct(Math.max(0, clicked - converted)),
      icon: MousePointerClick,
      colorClass: "text-pink-600 bg-pink-50 border-pink-100 dark:text-pink-400 dark:bg-pink-950/20 dark:border-pink-900/30",
    },
    {
      label: "Converted",
      count: converted,
      pct: getPct(converted),
      icon: Target,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30",
    },
    {
      label: "Failed",
      count: failed,
      pct: getPct(failed),
      icon: AlertCircle,
      colorClass: "text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-950/20 dark:border-red-900/30",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-xs flex flex-col space-y-4">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Delivery Breakdown
        </h3>
        <p className="text-xs text-slate-400">Detailed count and reach stats by stage</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {statusConfigs.map((status) => {
          const Icon = status.icon;
          return (
            <div
              key={status.label}
              className={`flex flex-col justify-between rounded-xl border p-4 transition-all duration-150 hover:shadow-xs ${status.colorClass}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                  {status.label}
                </span>
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                  {status.count.toLocaleString()}
                </p>
                <p className="text-[10px] font-semibold opacity-70 mt-0.5">
                  {status.pct} of total
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
        <span>Total Recipients</span>
        <span className="text-slate-800 dark:text-slate-200 font-extrabold">{total.toLocaleString()}</span>
      </div>
    </div>
  );
};
