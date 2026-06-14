import React from "react";

interface StatsCardProps {
  title: string;
  value: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-slate-950 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        {icon && <div className="text-slate-400 dark:text-slate-500">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</span>
      </div>
      {description && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{description}</p>}
    </div>
  );
};
