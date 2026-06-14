# AI-Native Marketing CRM & Campaign Management Platform

An AI-native CRM and campaign management platform built to help businesses build audience segments, generate customized marketing copies using Gemini, track dispatch communications, and view conversion analytics. 

---

## 🏗️ Architecture

The platform follows a decoupled client-server architecture:

```mermaid
graph TD
    A[React Frontend - Vite] <-->|HTTP / REST| B[Express Backend API]
    B <-->|Prisma ORM| C[(PostgreSQL Database)]
    B <-->|REST API| D[Google Gemini 2.5 Flash]
    B <-->|HTTP POST - dispatch| E[Simulated Channel Service]
    E -.->|HTTP POST - status callback| B
```

* **Frontend**: Single Page React Application built with Vite and Tailwind CSS. State management and server caching are handled via TanStack Query.
* **Backend**: Node.js & Express REST API utilizing Prisma ORM for type-safe database queries.
* **Database**: PostgreSQL (Prisma adapter) storing customers, orders, campaigns, and communication logs.
* **AI Engine**: Gemini 2.5 Flash API for natural language audience segmentation parsing and campaign copy generation.
* **Simulated Channel Service**: An independent webhook service simulating Whatsapp, SMS, Email, and RCS lifecycles (pending → delivered → opened → clicked → converted) with real-time callbacks.

---

## 🛠️ Tech Stack

### Frontend
* **Core**: React 19, TypeScript
* **Routing**: React Router Dom v7
* **Styling**: Tailwind CSS v4, Lucide Icons
* **Data Fetching**: TanStack React Query v5

### Backend
* **Runtime**: Node.js
* **Framework**: Express, TypeScript, tsx
* **ORM**: Prisma ORM v7
* **Database**: PostgreSQL (and local pg-pool)

### AI & Integrations
* **LLM**: Gemini 2.5 Flash (`@google/generative-ai`)

---

## 📂 Folder Structure

```text
xeno-project/
├── xeno-frontend/            # Frontend React SPA
│   ├── public/               # Static assets & favicon.svg
│   ├── src/
│   │   ├── api/              # Fetch client & API integration layers
│   │   ├── components/       # Shared UI components (ConfirmationDialog, Navbar, etc.)
│   │   ├── context/          # Context Providers (Theme, Toast, etc.)
│   │   ├── features/         # Feature-based components & hooks (campaigns, analytics)
│   │   ├── pages/            # Page-level route views (Dashboard, CreateCampaign, etc.)
│   │   ├── routes/           # React Router paths
│   │   └── types/            # API response TypeScript types
│   ├── tsconfig.json         # TypeScript configurations
│   ├── vercel.json           # Vercel rewrite configuration for clean routing
│   └── vite.config.ts        # Vite plugins & build variables
│
├── xeno-backend/             # Backend Express API
│   ├── prisma/
│   │   ├── schema.prisma     # Database models & relationships
│   │   └── seed.ts           # Customer & order mock database seed
│   ├── src/
│   │   ├── controllers/      # Route controllers (Campaign, Launch, Deletion)
│   │   ├── db/               # Prisma client initialization
│   │   ├── lib/              # AI Strategist & LLM Helpers
│   │   ├── routes/           # Express router endpoints
│   │   ├── services/         # Core business logic handlers
│   │   ├── app.ts            # Express server configuration & middleware
│   │   ├── server.ts         # Server listen initialization
│   │   └── channel-service.ts# Simulated standalone channel webhook service
│   ├── tsconfig.json         # TypeScript server configurations
│   └── package.json          # Dependency scripts & builds
│
└── .env.example              # Master environment configuration template
```

---

## ⚙️ Environment Variables

Prepare your environment by copy-pasting the values from `.env.example` into your workspace `.env` files.

### Backend Configurations (`xeno-backend/.env`)
```env
# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:port/dbname

# Gemini API Key (Gemini 2.5 Flash)
GEMINI_API_KEY=your-gemini-api-key-here

# Production URL of the independent Simulated Channel Service
CHANNEL_SERVICE_URL=http://localhost:4000

# Backend Server Port
PORT=3000

# Deployed Frontend Web App Domain (For strict CORS policy restrictions)
FRONTEND_URL=http://localhost:5173
```

### Channel Service Configurations (optional env overrides)
```env
PORT=4000
BACKEND_API_URL=http://localhost:3000
```

### Frontend Configurations (`xeno-frontend/.env`)
```env
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Setup & Local Running Instructions

### Prerequisites
* **Node.js**: v18 or later
* **PostgreSQL**: Running instance or database URL

### Database Initial Setup
1. In the `xeno-backend/` directory, create a `.env` file containing your `DATABASE_URL`.
2. Generate the Prisma client and push the schema to your database:
   ```bash
   npx prisma db push
   ```
3. Seed the database with mock customers and purchase history:
   ```bash
   npm run seed
   ```

### Start Services Locally

1. **Start the simulated channel service**:
   ```bash
   cd xeno-backend
   npm run channel
   ```
   *Runs on port `4000` by default.*

2. **Start the backend server**:
   ```bash
   cd xeno-backend
   npm run dev
   ```
   *Runs on port `3000` by default.*

3. **Start the frontend application**:
   ```bash
   cd xeno-frontend
   npm run dev
   ```
   *Runs on port `5173` by default.*

---

## 🌐 Production Deployment Instructions

### Frontend (Vercel)
1. Import the `xeno-frontend` subdirectory on Vercel.
2. In **Project Settings**, configure:
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. Add the **Environment Variable**:
   * `VITE_API_URL` (Points to the deployed Railway Backend API)

### Backend API (Railway)
1. Create a service in Railway from your GitHub repository pointing to the `xeno-backend` subdirectory.
2. Set the variables:
   * `DATABASE_URL` (Link your Railway PostgreSQL service)
   * `GEMINI_API_KEY`
   * `CHANNEL_SERVICE_URL` (Link your deployed Simulated Channel Service)
   * `FRONTEND_URL` (Set to the deployed Vercel frontend URL for CORS)
   * `PORT` (Railway will provide this automatically)
3. Build & start configurations:
   * The backend `package.json` includes `npm run build` which triggers `prisma generate && tsc`.
   * The start script executes `node dist/src/server.js`.

### Simulated Channel Service (Railway)
1. Add a second service in Railway pointing to the `xeno-backend` subdirectory.
2. Set the custom **Start Command**:
   * `node dist/src/channel-service.js`
3. Set the variables:
   * `BACKEND_API_URL` (Points to the main deployed Backend API service URL)

---

## 🔌 API Endpoints

### Backend API
* **Audience Operations**
  * `POST /audiences/manual` - Validates criteria and queries metrics.
  * `POST /audiences/ai` - Parses natural language prompts into structured filters via LLM.
* **Campaign Operations**
  * `POST /campaigns` - Creates a new draft campaign using Gemini-generated copy.
  * `GET /campaigns` - Lists all campaigns.
  * `POST /campaigns/:id/send` - Launches a campaign.
  * `GET /campaigns/:id/analytics` - Fetches live delivery, open, click, and conversion funnel analytics.
  * `DELETE /campaigns/:id` - Deletes a draft campaign and its dependencies.
* **Communication Operations**
  * `POST /communications/status` - Webhook callback endpoint for status transitions from the channel service.

### Simulated Channel Webhook
* `POST /send` - Receives messages and executes callbacks representing delivery, opens, clicks, and conversions in background threads.

---

## 🧠 AI Integration

Natural language processing and copy creation are powered by **Gemini 2.5 Flash**:
1. **Audience Extraction**: Natural language inputs are compiled into database filter limits (`minSpend`, `minOrders`, `lastPurchaseDays`) using structured system prompts.
2. **Campaign Generation**: Drafts a matching message copy, subject title, and recommends communication channels based on the target customer profile and campaign goals.

---

## 🔮 Future Improvements

1. **Enhanced Personalization**: Support additional customer tags like `{{city}}`, `{{phone}}`, and custom fields.
2. **WebSockets Integration**: Replace polling in dashboard statistics with live web socket event streams.
3. **Advanced Analytics**: Add campaign conversion timelines and multi-channel attribution charts.
