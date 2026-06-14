import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const backendApiUrl = process.env.BACKEND_API_URL || "http://localhost:3000";
const BACKEND_URL = `${backendApiUrl}/communications/status`;

// Helper to wait
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Status update helper
async function sendStatusUpdate(communicationId: number, status: string) {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ communicationId, status }),
    });

    if (res.ok) {
      console.log(`[Channel Service] Updated communication ID ${communicationId} -> ${status}`);
    } else {
      const err = (await res.json().catch(() => ({}))) as any;
      console.error(`[Channel Service] Failed updating ID ${communicationId} -> ${status}:`, err.error);
    }
  } catch (error: any) {
    console.error(`[Channel Service] Error connection to backend:`, error.message);
  }
}

/**
 * Endpoint POST /send
 */
app.post("/send", (req, res) => {
  const { campaignId, communicationId, customerId, message, channel } = req.body;

  if (!communicationId) {
    res.status(400).json({ error: "communicationId is required" });
    return;
  }

  console.log(
    `[Channel Service] Received dispatch for ID ${communicationId} (Campaign: ${campaignId}, Customer: ${customerId}) via ${channel}`
  );

  // Send successful response immediately
  res.status(200).json({ success: true, message: "Queued for sending" });

  // Simulate lifecycle transitions asynchronously
  (async () => {
    // 5% chance of initial delivery failure
    const willFail = Math.random() < 0.05;

    await delay(1000 + Math.random() * 1000); // Wait 1-2 seconds

    if (willFail) {
      await sendStatusUpdate(communicationId, "failed");
      return;
    }

    // Update to delivered
    await sendStatusUpdate(communicationId, "delivered");

    // 85% chance they open the message
    if (Math.random() > 0.15) {
      await delay(1000 + Math.random() * 2000);
      await sendStatusUpdate(communicationId, "opened");

      // 40% chance they click a link
      if (Math.random() > 0.6) {
        await delay(1000 + Math.random() * 2000);
        await sendStatusUpdate(communicationId, "clicked");

        // 25% chance they convert
        if (Math.random() > 0.75) {
          await delay(1000 + Math.random() * 2000);
          await sendStatusUpdate(communicationId, "converted");
        }
      }
    }
  })();
});

app.listen(PORT, () => {
  console.log(`📡 Simulated Channel Service running on port ${PORT}`);
});
