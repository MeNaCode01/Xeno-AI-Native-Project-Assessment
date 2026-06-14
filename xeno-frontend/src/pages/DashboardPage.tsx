import React from "react";
import { PageContainer } from "../components/PageContainer";

export const DashboardPage: React.FC = () => {
  return (
    <PageContainer
      title="Dashboard Overview"
      subtitle="CRM analytics and recent marketing activity"
    >
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-12 text-center shadow-xs">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Dashboard Overview</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Analytics dashboard charts and metrics coming soon.</p>
      </div>
    </PageContainer>
  );
};
