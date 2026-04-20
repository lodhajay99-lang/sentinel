# 🛡️ Project Sentinel: Tactical Triage Network

**🚀 Live Deployment:** [View on Vercel](https://sentinel-dashboard-llw449xf0-lodhajay99-7328s-projects.vercel.app)

![Project Sentinel Dashboard](./public/dashboard_screenshot.png)

Project Sentinel is an advanced, real-time crisis intelligence and stadium security dashboard originally designed for deployment at large-scale venues like Wankhede Stadium. It aggregates crowd-sourced distress signals, parses unstructured NLP data, and instantly triages actionable intelligence for immediate tactical dispatch.

## 🔥 Key Features

- **Real-Time Intelligence Feed**: Ingests SMS/Emergency reports via an AI pipeline (powered by Ollama/Llama 3) to structure chaotic text into precise fields: Severity, Location, Intent, and Summary.
- **Dynamic Heat Map (Sector Map)**: The dashboard features an interactive, glowing vector map of the stadium that tracks conflict hot-zones. Critical situations animate and pulse with a severe red hue.
- **Group Scanning & Conflict Resolution**: Operators can scan a group ticket. The system parses and maps the entire family/group across different stands. If any incident originates from within that group, the Tactical Map instantly enters "Group Alert Mode", rendering high-visibility locators for all members for rapid response.
- **Live Stress-Test Simulator**: Comes with a built-in SMS simulator capable of firing synthetic crowd distress bursts, directly testing network load balancing and visual map reactivity.
- **Realtime Database Sync**: Every piece of data seamlessly synchronizes via Supabase Realtime subscriptions to all active dashboard command nodes.

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 19, Tailwind CSS v4, Framer Motion (for fluid micro-animations).
- **Backend Setup**: Node.js, Express, `ollama` (local open-source LLM inference engine), and `zod` for strict schema validation.
- **Database**: Supabase (PostgreSQL with built-in Realtime capabilities).

## 🚀 Getting Started

### 1. Database Setup
Ensure you have set up your Supabase project and securely added your `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_KEY` strings to `.env.local` inside `sentinel-dashboard` and `.env` inside `sentinel-backend`.

### 2. Backend Service (Intelligence Node)
Ensure Ollama is running locally (`ollama serve`). Then start the backend ingest node:
```bash
cd sentinel-backend
npm install
npx ts-node-dev src/index.ts
```
*(Runs securely on PORT 4000)*

### 3. Dashboard (Frontend UI)
```bash
cd sentinel-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to monitor the system.

## 🎯 Tactical Usage Flow
1. Ensure the **SYSTEM ONLINE** badge is glowing emerald in the header.
2. Click **GROUP TICKETING** to simulate a family check-in and activate tactical location tracking.
3. Fire a burst of synthetic reporting data using the lower-left **SMS SIMULATOR**, or use the "TEST GROUP ALERT" to invoke Group Alert Mode.
4. Watch the structural stadium map respond and hit **DISPATCH UNIT** straight from the live incident feed stream!
