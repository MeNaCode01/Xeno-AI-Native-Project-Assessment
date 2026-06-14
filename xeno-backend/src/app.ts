import express from "express";
import cors from "cors";
import audienceRoutes from "./routes/audience.routes";
import campaignRoutes from "./routes/campaign.routes";
import communicationRoutes from "./routes/communication.routes";

const app = express();

// Strict production-ready CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/audiences", audienceRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/communications", communicationRoutes);

export default app;
