import "dotenv/config";

const BACKEND_URL = "http://localhost:3000";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runVerification() {
  console.log("🚀 Starting End-to-End Runtime Flow Verification...");

  try {
    // 1. Audience Builder Simulation
    console.log("\n1. 👥 Simulating Audience Builder...");
    const audienceParams = {
      minSpend: 6000,
      minOrders: 2,
      lastPurchaseDays: 120,
    };
    
    const audienceRes = await fetch(`${BACKEND_URL}/audiences/manual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(audienceParams),
    });

    if (!audienceRes.ok) {
      throw new Error(`Audience manual query failed: ${audienceRes.statusText}`);
    }

    const audienceData = await audienceRes.json();
    console.log("✅ Audience stats generated successfully:", audienceData);

    // 2. AI Campaign Generation Simulation
    console.log("\n2. 🧠 Simulating AI Campaign Strategist...");
    const campaignParams = {
      goal: "Bring back high value customers with special discount",
      audienceFilters: audienceParams,
      audienceSummary: audienceData,
    };

    const campaignRes = await fetch(`${BACKEND_URL}/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campaignParams),
    });

    if (!campaignRes.ok) {
      throw new Error(`AI Campaign generation failed: ${campaignRes.statusText}`);
    }

    const campaignData = (await campaignRes.json()) as any;
    console.log("✅ AI Draft campaign created:", {
      id: campaignData.campaignId,
      title: campaignData.title,
      channel: campaignData.channel,
      status: campaignData.status,
    });

    const campaignId = campaignData.campaignId;

    // 3. Launch Campaign Simulation
    console.log(`\n3. 🚀 Launching Campaign ID ${campaignId}...`);
    const launchRes = await fetch(`${BACKEND_URL}/campaigns/${campaignId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!launchRes.ok) {
      throw new Error(`Campaign launch failed: ${launchRes.statusText}`);
    }

    const launchData = await launchRes.json();
    console.log("✅ Campaign launched:", launchData);

    // 4. Wait for Simulated Channel Service to process & dispatch callbacks
    console.log("\n4. ⏳ Waiting for Simulated Channel Service callbacks (10 seconds)...");
    for (let i = 1; i <= 5; i++) {
      await delay(2000);
      console.log(`... waiting (${i * 2}s elapsed)`);
    }

    // 5. Campaign History Verification
    console.log("\n5. 📋 Checking Campaign History...");
    const historyRes = await fetch(`${BACKEND_URL}/campaigns`, {
      method: "GET",
    });

    if (!historyRes.ok) {
      throw new Error(`Failed to retrieve campaign list: ${historyRes.statusText}`);
    }

    const historyData = (await historyRes.json()) as any[];
    const launchedCampaign = historyData.find((c) => c.id === campaignId);

    if (!launchedCampaign) {
      throw new Error(`Launched campaign ${campaignId} not found in listing history`);
    }
    console.log("✅ Campaign found in history listing:", {
      id: launchedCampaign.id,
      title: launchedCampaign.title,
      status: launchedCampaign.status,
    });

    // 6. Campaign Analytics Funnel Verification
    console.log(`\n6. 📊 Verifying Live Campaign Analytics for ID ${campaignId}...`);
    const analyticsRes = await fetch(`${BACKEND_URL}/campaigns/${campaignId}/analytics`, {
      method: "GET",
    });

    if (!analyticsRes.ok) {
      throw new Error(`Failed to fetch analytics: ${analyticsRes.statusText}`);
    }

    const analyticsData = (await analyticsRes.json()) as any;
    console.log("✅ Campaign analytics report fetched:", analyticsData);

    console.log("\nFunnel Stages Summary:");
    console.log(`- Total Recipients: ${analyticsData.totalRecipients}`);
    console.log(`- Pending:          ${analyticsData.pending}`);
    console.log(`- Delivered:        ${analyticsData.delivered} (${analyticsData.deliveryRate}%)`);
    console.log(`- Opened:           ${analyticsData.opened} (${analyticsData.openRate}%)`);
    console.log(`- Clicked:          ${analyticsData.clicked} (${analyticsData.clickRate}%)`);
    console.log(`- Converted:        ${analyticsData.converted} (${analyticsData.conversionRate}%)`);
    console.log(`- Failed:           ${analyticsData.failed}`);

    // Verify Invariants: delivered >= opened >= clicked >= converted
    if (analyticsData.delivered < analyticsData.opened) {
      throw new Error("FAIL: Invariant violated - delivered < opened");
    }
    if (analyticsData.opened < analyticsData.clicked) {
      throw new Error("FAIL: Invariant violated - opened < clicked");
    }
    if (analyticsData.clicked < analyticsData.converted) {
      throw new Error("FAIL: Invariant violated - clicked < converted");
    }
    console.log("\n🎉 E2E FLOW VERIFICATION SUCCESSFUL! ALL SYSTEMS RUNNING OK!");

  } catch (error: any) {
    console.error("\n❌ VERIFICATION FAILED:", error.message);
    process.exit(1);
  }
}

runVerification();
