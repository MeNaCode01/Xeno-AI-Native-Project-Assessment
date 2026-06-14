import React from "react";
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

interface InsightCardProps {
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  totalRecipients: number;
  failed: number;
}

interface CampaignInsight {
  type: "success" | "warning" | "danger" | "info";
  message: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  deliveryRate,
  openRate,
  clickRate,
  totalRecipients,
  failed,
}) => {
  const getInsights = (): CampaignInsight[] => {
    const list: CampaignInsight[] = [];

    // 1. Delivery rate evaluation
    if (deliveryRate >= 90) {
      list.push({
        type: "success",
        message: `${deliveryRate.toFixed(1)}% delivery rate is excellent, indicating high recipient database quality and active channels.`,
      });
    } else if (deliveryRate >= 75) {
      list.push({
        type: "warning",
        message: `Delivery rate is moderate at ${deliveryRate.toFixed(1)}%. Check for bounces or invalid recipient credentials.`,
      });
    } else {
      list.push({
        type: "danger",
        message: `Critical: Delivery rate is low at ${deliveryRate.toFixed(1)}%. Verify connection statuses on recommended channels.`,
      });
    }

    // 2. Open rate evaluation
    if (openRate >= 45) {
      list.push({
        type: "success",
        message: `Outstanding open rate at ${openRate.toFixed(1)}%. The AI strategist copywriting title caught recipient attention effectively.`,
      });
    } else if (openRate >= 20) {
      list.push({
        type: "info",
        message: `Solid open rate at ${openRate.toFixed(1)}%. Subject headers performed within normal campaign benchmarks.`,
      });
    } else if (openRate > 0) {
      list.push({
        type: "warning",
        message: `Open rate is below expectations at ${openRate.toFixed(1)}%. Try adjusting titles on future campaign regenerations.`,
      });
    }

    // 3. Click-through rate evaluation
    if (clickRate >= 15) {
      list.push({
        type: "success",
        message: `${clickRate.toFixed(1)}% click rate is highly above average, showing high link or button click intent.`,
      });
    } else if (clickRate > 0 && clickRate < 5) {
      list.push({
        type: "warning",
        message: `Low click-through rate at ${clickRate.toFixed(1)}%. Ensure links are clear and calls-to-action are prominent.`,
      });
    }

    // 4. Failure rate evaluation
    const failureRate = totalRecipients > 0 ? (failed / totalRecipients) * 100 : 0;
    if (failureRate >= 10) {
      list.push({
        type: "danger",
        message: `High delivery failures detected (${failureRate.toFixed(1)}%). Consider pruning inactive numbers from this audience.`,
      });
    } else if (failureRate <= 2 && totalRecipients > 0) {
      list.push({
        type: "success",
        message: `Channel health is perfect: Only ${failureRate.toFixed(1)}% of recipient communications failed to deliver.`,
      });
    }

    // Fallback if no specific threshold insights were added
    if (list.length === 0) {
      list.push({
        type: "info",
        message: "No performance insights available yet. Live campaign communication telemetry is ongoing.",
      });
    }

    return list.slice(0, 3); // Return at most 3 key insights
  };

  const insights = getInsights();

  const config = {
    success: { bg: "bg-green-50 border-green-100/60 text-green-800 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-300", icon: CheckCircle2, iconClass: "text-green-600 dark:text-green-400" },
    warning: { bg: "bg-amber-50 border-amber-100/60 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300", icon: AlertTriangle, iconClass: "text-amber-600 dark:text-amber-400" },
    danger: { bg: "bg-red-50 border-red-100/60 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300", icon: AlertTriangle, iconClass: "text-red-600 dark:text-red-400" },
    info: { bg: "bg-blue-50 border-blue-100/60 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300", icon: Lightbulb, iconClass: "text-blue-600 dark:text-blue-400" },
  };

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-xs flex flex-col space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Campaign Insights
        </h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, idx) => {
          const cfg = config[insight.type];
          const Icon = cfg.icon;
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 rounded-xl border p-4 text-xs font-medium leading-relaxed ${cfg.bg}`}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${cfg.iconClass}`} />
              <div>{insight.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
