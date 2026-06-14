import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { AudiencePage } from "../pages/AudiencePage";
import { CreateCampaignPage } from "../pages/CreateCampaignPage";
import { CampaignsListPage } from "../pages/CampaignsListPage";
import { CampaignAnalyticsPage } from "../pages/CampaignAnalyticsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "audience",
        element: <AudiencePage />,
      },
      {
        path: "campaign/new",
        element: <CreateCampaignPage />,
      },
      {
        path: "campaigns",
        element: <CampaignsListPage />,
      },
      {
        path: "campaign/:id",
        element: <CampaignAnalyticsPage />,
      },
    ],
  },
]);
