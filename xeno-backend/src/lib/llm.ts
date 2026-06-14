import { GoogleGenerativeAI } from "@google/generative-ai";

export interface LLMResponse {
  title: string;
  message: string;
  channel: "whatsapp" | "sms" | "email" | "rcs";
}

export class LLMHelper {
  /**
   * Generates campaign strategies using Gemini AI.
   * Falls back to a deterministic rules-based campaign strategist if the API call fails or the key is not set.
   */
  static async generateCampaign(
    goal: string,
    audienceFilters: any,
    audienceSummary: any
  ): Promise<LLMResponse> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Falling back to local marketing strategist rules.");
      return this.fallbackGenerate(goal);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const prompt = `
You are an experienced marketing strategist.
Create a campaign for our CRM system based on the following user goal and audience details.

Marketer's Goal: "${goal}"

Audience Filters:
${JSON.stringify(audienceFilters, null, 2)}

Audience Size & Stats:
${JSON.stringify(audienceSummary, null, 2)}

Your task is to generate:
1. A catchy campaign title (e.g., "We Miss You!", "Exclusive VIP Rewards").
2. A compelling marketing message. The message MUST include the placeholder "{{name}}" (with double curly braces) exactly, so that we can personalize it with the customer's name later.
3. The recommended communication channel. This must be EXACTLY one of: "whatsapp", "sms", "email", "rcs". Choose the best channel based on the objective (e.g., Email for longer messages/discounts, WhatsApp for media-rich and direct engagements, SMS for brief/urgent alerts, RCS for interactive messages).

You must respond with a JSON object in this format:
{
  "title": "string",
  "message": "string",
  "channel": "whatsapp" | "sms" | "email" | "rcs"
}
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text) {
        throw new Error("Empty response from Gemini AI");
      }

      const parsed = JSON.parse(text.trim());

      // Validate the channel value
      const validChannels = ["whatsapp", "sms", "email", "rcs"];
      if (!parsed.title || !parsed.message || !parsed.channel || !validChannels.includes(parsed.channel)) {
        throw new Error("Invalid output format or channel value returned from Gemini AI");
      }

      return {
        title: parsed.title,
        message: parsed.message,
        channel: parsed.channel as "whatsapp" | "sms" | "email" | "rcs",
      };
    } catch (error) {
      console.error("Gemini AI generation failed, falling back to local strategist. Error:", error);
      return this.fallbackGenerate(goal);
    }
  }

  /**
   * Local rules-based campaign strategist fallback
   */
  private static fallbackGenerate(goal: string): LLMResponse {
    const goalLower = goal.toLowerCase();

    if (
      goalLower.includes("inactive") ||
      goalLower.includes("back") ||
      goalLower.includes("miss") ||
      goalLower.includes("return") ||
      goalLower.includes("re-engage") ||
      goalLower.includes("reactivate")
    ) {
      return {
        title: "We Miss You!",
        channel: "email",
        message: "Hi {{name}},\n\nWe haven't seen you in a while! To welcome you back, we've added an exclusive 20% discount code to your account. Use code WELCOME20 at checkout before Sunday.",
      };
    }

    if (
      goalLower.includes("premium") ||
      goalLower.includes("vip") ||
      goalLower.includes("loyal") ||
      goalLower.includes("spend") ||
      goalLower.includes("high-value")
    ) {
      return {
        title: "Exclusive VIP Reward",
        channel: "whatsapp",
        message: "Hi {{name}},\n\nAs one of our most valued VIP members, we have unlocked a special reward for you. Enjoy a free premium gift with your next order! Use code VIPGIFT.",
      };
    }

    if (
      goalLower.includes("offer") ||
      goalLower.includes("discount") ||
      goalLower.includes("deal") ||
      goalLower.includes("sale") ||
      goalLower.includes("coupon")
    ) {
      return {
        title: "Special Offer Just For You",
        channel: "sms",
        message: "Hi {{name}},\n\nDon't miss out! Get 15% off everything today only with code FLASH15 at checkout. Shop now!",
      };
    }

    // Default fallback
    return {
      title: "Introducing New Arrivals!",
      channel: "email",
      message: "Hi {{name}},\n\nCheck out our latest collections curated just for you. Get free shipping on orders over $50. Use code FREESHIP at checkout.",
    };
  }

  /**
   * Generates database audience filters from a natural language prompt using Gemini AI.
   * Falls back to a local rule-based regex parser if the Gemini API key is missing or fails.
   */
  static async generateAudienceFilters(prompt: string): Promise<AudienceFilters> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Falling back to local prompt parser rules.");
      return this.fallbackParsePrompt(prompt);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const promptText = `
You are an expert CRM analyst.
Based on the following natural language description of a target customer segment, extract matching filter criteria for querying our database.

Marketer's Description: "${prompt}"

We support three optional filter fields:
1. "minSpend" (number): The minimum lifetime spend of the customer.
2. "minOrders" (number): The minimum count of orders the customer has placed.
3. "lastPurchaseDays" (number): The maximum number of days since the customer's last purchase.

Extract values only when mentioned or strongly implied. Respond with a JSON object in this format:
{
  "minSpend": number,
  "minOrders": number,
  "lastPurchaseDays": number
}
Only include fields that are specified in the prompt. Do not guess values for unspecified metrics.
`;

      const result = await model.generateContent(promptText);
      const text = result.response.text();
      if (!text) {
        throw new Error("Empty response from Gemini AI");
      }

      const parsed = JSON.parse(text.trim());
      const filters: AudienceFilters = {};
      if (parsed.minSpend !== undefined && typeof parsed.minSpend === "number" && !isNaN(parsed.minSpend)) {
        filters.minSpend = parsed.minSpend;
      }
      if (parsed.minOrders !== undefined && typeof parsed.minOrders === "number" && !isNaN(parsed.minOrders)) {
        filters.minOrders = parsed.minOrders;
      }
      if (parsed.lastPurchaseDays !== undefined && typeof parsed.lastPurchaseDays === "number" && !isNaN(parsed.lastPurchaseDays)) {
        filters.lastPurchaseDays = parsed.lastPurchaseDays;
      }

      return filters;
    } catch (error) {
      console.error("Gemini AI audience parsing failed, falling back to local rule-based parser. Error:", error);
      return this.fallbackParsePrompt(prompt);
    }
  }

  /**
   * Local rules-based prompt parser fallback using regular expressions
   */
  private static fallbackParsePrompt(prompt: string): AudienceFilters {
    const text = prompt.toLowerCase();
    const filters: AudienceFilters = {};

    // Match spend (e.g. spend more than 10000, Rs 5000, inr 12000, life spending of 15000)
    const spendMatch = text.match(/(?:spend|spent|spending|₹|rs|inr)\s*(?:greater\s+than|more\s+than|>|>=|at\s+least|above|over|of)?\s*(\d+)/i) || 
                       text.match(/(\d+)\s*(?:or\s+more)?\s*(?:spend|spent)/i);
    if (spendMatch) {
      filters.minSpend = parseInt(spendMatch[1], 10);
    } else if (text.includes("high value") || text.includes("spend a lot") || text.includes("vip")) {
      filters.minSpend = 10000;
    }

    // Match orders (e.g. at least 3 orders, 2 purchases, 5 orders)
    const ordersMatch = text.match(/(\d+)\s*(?:or\s+more)?\s*(?:order|purchase|transact)/i) ||
                        text.match(/(?:orders|purchases|transactions)\s*(?:greater\s+than|more\s+than|>|>=|at\s+least|above|over)?\s*(\d+)/i);
    if (ordersMatch) {
      filters.minOrders = parseInt(ordersMatch[1], 10);
    }

    // Match purchase recency (e.g. within 90 days, active last 120 days)
    const daysMatch = text.match(/(\d+)\s*day/i);
    if (daysMatch) {
      filters.lastPurchaseDays = parseInt(daysMatch[1], 10);
    }

    return filters;
  }
}

export interface AudienceFilters {
  minSpend?: number;
  minOrders?: number;
  lastPurchaseDays?: number;
}
