# CODEATHON AI - Smart Training Machine Management

CODEATHON AI is a data-driven framework designed for the efficient management of training machinery across multiple skill development centers. It leverages Generative AI to provide predictive maintenance, strategic resource allocation, and real-time operational support.

## 🚀 How it Works (Core Logic)

CODEATHON AI operates as a centralized "Intelligence Layer" over physical training centers. Here is the technical flow:

### 1. Data Aggregation & Simulation
The project uses a centralized `MockDB` (`src/lib/mock-data.ts`) to simulate real-time fleet telemetry. Every machine tracks:
- **Usage Hours:** Total operational time for certification tracking.
- **Sensor Logs:** Temperature and vibration data for health monitoring.
- **Health Scores:** Dynamic reliability calculations.

### 2. AI-Powered Decision Making (Genkit)
The "Brain" of the platform is built on **Google Genkit (Gemini 2.5 Flash)**. It handles:
- **Operational Support (AI Zaya):** Ingests fleet state to suggest available machines or provide step-by-step troubleshooting.
- **Predictive Maintenance:** Analyzes sensor anomalies to generate technical warnings and preventative measures.
- **Strategic Allocation:** Recommends moving equipment between centers (e.g., Chennai to Bangalore) based on demand levels.
- **Learning Assistant:** Summarizes technical manuals into easy-to-follow training guides.

### 3. User Interfaces
- **Admin Dashboard:** High-level efficiency metrics using **Recharts**.
- **Maintenance Command:** Focused on "At Risk" units with one-click AI diagnostics.
- **AI Zaya Chat:** A full-screen, voice-enabled assistant for real-time support.

## 🌐 Where to Use CODEATHON AI

- **Vocational & Technical Institutes:** Manage CNCs and 3D printers across multiple campuses.
- **Industrial Training Centers (ITCs):** Track student machine hours for government certifications.
- **Corporate Training Hubs:** Large-scale internal workforce training for manufacturing firms.
- **Government Skill Missions:** Scaling training infrastructure with centralized AI monitoring.
- **Smart FabLabs:** Managing shared community workshop tools efficiently.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **AI Engine:** Google Genkit (Gemini 2.5 Flash)
- **UI/UX:** Tailwind CSS, Shadcn UI, Lucide React
- **Voice:** Web Speech API
- **Visualization:** Recharts (Area, Bar, Pie charts)

---
Built with 💙 for smarter, AI-driven vocational training infrastructure.
