import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

interface FunnelChartProps {
  totalRecipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  totalRecipients,
  delivered,
  opened,
  clicked,
  converted,
}) => {
  // Compute conversion funnel metrics
  const funnelData = [
    {
      name: "Total Audience",
      count: totalRecipients,
      pctOfTotal: 100,
      pctOfPrev: 100,
      color: "#4f46e5", // Indigo
    },
    {
      name: "Delivered",
      count: delivered,
      pctOfTotal: totalRecipients > 0 ? (delivered / totalRecipients) * 100 : 0,
      pctOfPrev: totalRecipients > 0 ? (delivered / totalRecipients) * 100 : 0,
      color: "#3b82f6", // Blue
    },
    {
      name: "Opened",
      count: opened,
      pctOfTotal: totalRecipients > 0 ? (opened / totalRecipients) * 100 : 0,
      pctOfPrev: delivered > 0 ? (opened / delivered) * 100 : 0,
      color: "#8b5cf6", // Purple
    },
    {
      name: "Clicked",
      count: clicked,
      pctOfTotal: totalRecipients > 0 ? (clicked / totalRecipients) * 100 : 0,
      pctOfPrev: opened > 0 ? (clicked / opened) * 100 : 0,
      color: "#ec4899", // Pink
    },
    {
      name: "Converted",
      count: converted,
      pctOfTotal: totalRecipients > 0 ? (converted / totalRecipients) * 100 : 0,
      pctOfPrev: clicked > 0 ? (converted / clicked) * 100 : 0,
      color: "#10b981", // Emerald
    },
  ];

  // Custom tooltips to meet detailed specifications
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-lg text-xs space-y-1.5">
          <p className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
            {data.name}
          </p>
          <div className="space-y-1 font-semibold text-slate-500 dark:text-slate-400">
            <p>
              Count: <span className="text-slate-900 dark:text-slate-100 font-bold">{data.count.toLocaleString()}</span>
            </p>
            <p>
              % of Total: <span className="text-slate-900 dark:text-slate-100 font-bold">{data.pctOfTotal.toFixed(1)}%</span>
            </p>
            <p>
              % of Previous: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{data.pctOfPrev.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-xs flex flex-col h-[380px]">
      <div className="mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Conversion Funnel
        </h3>
        <p className="text-xs text-slate-400">Conversion breakdown from target to customer action</p>
      </div>

      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={funnelData}
            layout="vertical"
            margin={{ top: 10, right: 60, left: 10, bottom: 10 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "currentColor", className: "text-slate-500 dark:text-slate-400", fontSize: 11, fontWeight: 700 }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(241, 245, 249, 0.4)" }} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList
                dataKey="pctOfTotal"
                position="right"
                formatter={(v: any) => `${Number(v).toFixed(0)}%`}
                style={{ fill: "currentColor", fontSize: 11, fontWeight: 700 }}
                className="text-slate-600 dark:text-slate-400"
                offset={10}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
