# SkillMach AI - Smart Training Machine Management

SkillMach AI is a data-driven framework designed for the efficient management of training machinery across multiple skill development centers. It leverages Generative AI to provide predictive maintenance, strategic resource allocation, and real-time operational support.

## 🚀 How it Works (Core Logic)

SkillMach AI operates as a centralized "Intelligence Layer" over physical training centers. Here is the technical flow:

### 1. Data Aggregation & Simulation
The project uses a centralized `MockDB` (`src/lib/mock-data.ts`) to simulate real-time fleet telemetry. Every machine tracks:
- **Usage Hours:** Total operational time.
- **Sensor Logs:** Temperature and vibration data.
- **Health Scores:** A dynamic calculation of machine reliability.

### 2. AI-Powered Decision Making (Genkit)
The "Brain" of the platform is built on **Google Genkit**. It handles four primary intelligent operations:
- **Operational Support (AI Zaya):** Ingests the current state of the fleet to suggest available machines or provide step-by-step troubleshooting.
- **Predictive Maintenance:** Analyzes sensor anomalies (e.g., high vibration) to generate technical warnings and preventative measures.
- **Strategic Allocation:** Recommends moving underutilized machinery to centers with higher demand (e.g., moving a CNC from Bangalore to Chennai).
- **Learning Assistant:** Summarizes complex technical manuals into easy-to-follow training guides for students.

### 3. User Interfaces
- **Admin Dashboard:** High-level view of fleet health and system-wide efficiency using **Recharts**.
- **Maintenance Command:** Focused on "At Risk" units with one-click AI diagnostics.
- **AI Zaya Chat:** A full-screen, voice-enabled assistant designed for mobile and desktop use.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **AI Engine:** Google Genkit (Gemini 2.5 Flash)
- **State Management:** Singleton Pattern (MockDB)
- **UI/UX:** Tailwind CSS, Shadcn UI, Lucide React
- **Voice:** Web Speech API (Recognition)
- **Visualization:** Recharts (Area, Bar, Pie charts)

## 📂 Project Structure

- `src/ai/flows`: The core logic for AI interactions and model prompts.
- `src/app/dashboard`: Feature-specific views (Analytics, Machines, AI Zaya, etc.).
- `src/lib/mock-data.ts`: The centralized data store simulating the fleet.
- `src/components/ui`: High-fidelity, reusable Shadcn components.

---
Built with 💙 for smarter, AI-driven vocational training infrastructure.
