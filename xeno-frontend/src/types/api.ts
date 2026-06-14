export interface AudienceStats {
  audienceSize: number;
  averageSpend: number;
  averageOrders: number;
}

export interface AudienceFilters {
  minSpend?: number;
  minOrders?: number;
  lastPurchaseDays?: number;
}

export interface CampaignData {
  id: number;
  title: string;
  goal: string;
  message: string;
  channel: "whatsapp" | "sms" | "email" | "rcs";
  status: "draft" | "sent" | "completed";
  audienceFilters: AudienceFilters;
  createdAt: string;
}
