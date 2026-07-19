# 🌍 OpsGrid

**AI-Powered Field Operations Intelligence Platform**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Groq AI](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=google&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![Last Commit](https://img.shields.io/github/last-commit/username/opsgrid?style=for-the-badge)

OpsGrid is a centralized, event-driven platform that bridges the physical gap between administrative dispatchers and remote field workers. By combining live geographic telemetry with active task management and Generative AI, it provides total situational awareness and eliminates the manual overhead of workforce coordination.

> *Transforming traditional field workforce management into an intelligent, AI-driven operational platform.*

---

## 🎥 Demo

**🎬 Demo Video**
<!-- Insert YouTube Link -->

**🎞️ Demo GIF**
<!-- Insert GIF -->

---

## 📖 Project Overview

Managing a team of field workers—such as delivery drivers, maintenance technicians, or sales agents—is incredibly difficult when you lack visibility into their live locations. 

OpsGrid solves this by giving every worker a mobile app that silently streams their geographic coordinates back to headquarters. Dispatchers receive a real-time command center showing exactly where everyone is, allowing them to dynamically assign tasks based on proximity. At the end of the shift, instead of forcing managers to read raw metrics, an integrated AI agent analyzes all the data and writes a comprehensive executive summary of the day's operations.

---

## ❓ Why OpsGrid?

Traditional workforce management systems are highly reactive. They rely on workers remembering to text managers or click "check-in" buttons on clunky software. OpsGrid exists to make field management **proactive and passive**. It solves the problem of "blind dispatching" by proving exactly where workers are in real-time, verifying they actually arrived at a job site using virtual boundaries (geofences), and removing the tedious administrative burden of manually calculating distances and writing end-of-day reports.

---

## 🚨 Problem Statement

Organizations with distributed, mobile workforces face immense logistical friction. Dispatchers lack real-time geographic visibility, resulting in inefficient routing and an inability to verify physical attendance at job sites. Furthermore, administrators suffer from high cognitive load at the end of the shift, forced to manually compile fragmented data—completed tasks, travel distances, and attendance logs—into actionable operational reports.

---

## 💡 Solution

OpsGrid is a unified Progressive Web App (PWA) backed by a low-latency, event-driven Node.js architecture. It provides dispatchers with a real-time command center while giving field workers a lightweight, battery-optimized mobile interface. By integrating WebSockets for live telemetry and Large Language Models (LLMs) for automated reporting, the platform effectively synchronizes field execution with office administration.

---

## 🌟 What Makes OpsGrid Different?

Unlike standard CRUD-based employee management systems that just store task tickets, OpsGrid merges passive telemetry with active workflows. 

- 📍 **Live GPS & Real-Time Telemetry:** Workers' locations move smoothly on the map without refreshing the page.
- 🛡️ **Geofencing:** The system automatically mathematically detects when a worker crosses a physical boundary.
- 🧠 **AI & Operational Intelligence:** Instead of dumping raw data charts onto an admin, the system uses Generative AI to read the metrics and output human-readable insights.
- ⚡ **Event-Driven Architecture:** Actions happen instantly across clients via WebSockets, ensuring the dispatcher and the worker are always geographically synchronized.

---

## 📊 Project Statistics

| Metric | Value |
| :--- | :--- |
| **Modules** | 7 (Auth, Tasks, Tracking, Dashboard, Geofencing, AI, Users) |
| **Database Collections** | 11 Core Collections |
| **User Roles** | Admin, Worker |
| **AI Providers** | 2 (Groq, Gemini) |
| **REST APIs** | <!-- Insert API Count --> |
| **WebSocket Events** | <!-- Insert Event Count --> |

---

## ✨ Features Summary

| Feature | Status |
| :--- | :--- |
| **JWT Authentication** | ✅ |
| **Role-Based Access Control** | ✅ |
| **Live GPS Tracking** | ✅ |
| **Interactive Maps & Trails** | ✅ |
| **Geofence Management** | ✅ |
| **Task Assignment & Lifecycle** | ✅ |
| **Nearest Worker Detection** | ✅ |
| **Worker Attendance & Availability** | ✅ |
| **Leave Management** | ✅ |
| **AI Operations Summary** | ✅ |
| **AI Provider Failover** | ✅ |
| **Progressive Web App (PWA)** | ✅ |

---

## 🏗️ System Architecture

OpsGrid utilizes a modern Client-Server Architecture with a Domain-Driven Monolithic Backend. The application layer handles HTTP/REST requests for state changes while maintaining persistent WebSocket connections for high-frequency telemetry streaming.

<!-- Insert Architecture Diagram -->
<!-- Insert System Architecture -->
<!-- Insert Deployment Architecture -->

---

## 🛠 Technology Stack

| Layer | Technology | Purpose | Version |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | React, Vite | High-performance UI rendering and fast bundling. | 18.x |
| **Styling & Icons** | TailwindCSS, Lucide | Utility-first responsive design and modern iconography. | 3.x |
| **Mapping** | Leaflet, React-Leaflet | Interactive geographic visualization and geofence drawing. | - |
| **Backend Core** | Node.js, Express.js | Non-blocking API gateway and business logic execution. | 20.x |
| **Real-Time** | Socket.io | Low-latency, bidirectional event streaming for GPS telemetry. | 4.x |
| **Database** | MongoDB, Mongoose | NoSQL persistence optimized for flexible geospatial data arrays. | - |
| **AI Integration** | Groq SDK, GenAI SDK | Inference engines for generating operational health summaries. | - |

---

## 🔄 Complete Workflow

1. **Onboarding:** Admin provisions a worker account; the worker logs into the PWA.
2. **Telemetry Stream:** The worker's mobile device begins broadcasting background GPS coordinates via WebSockets.
3. **Intelligent Dispatch:** The Admin creates a task and uses map-based proximity calculations to assign it to the nearest worker.
4. **Execution:** As the worker travels, the backend calculates Haversine distance metrics and logs geofence boundary intersections.
5. **Completion:** The worker transitions the task status to "Completed" on their dashboard.
6. **AI Synthesis:** The Admin clicks to generate a daily summary; the system feeds the day's KPIs to the AI and renders a markdown intelligence report.

<!-- Insert Overall Workflow Diagram -->

---

## 📂 Folder Structure

```text
📦 smart-field-ops
 ┣ 📂 frontend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 app               # Axios instances & Global Store
 ┃ ┃ ┣ 📂 assets            # CSS, Images, and static assets
 ┃ ┃ ┣ 📂 common            # Reusable UI (Cards, Badges), Contexts, Hooks
 ┃ ┃ ┣ 📂 features          # Domain-specific components (Tasks, AI)
 ┃ ┃ ┗ 📂 pages             # Role-based route entries (Admin/Worker)
 ┃ ┗ 📜 package.json
 ┗ 📂 backend
   ┣ 📂 src
   ┃ ┣ 📂 config            # Environment & Database config
   ┃ ┣ 📂 core              # Middlewares (Auth/RBAC) & Utils (Distance Math)
   ┃ ┣ 📂 modules           # Domain-driven isolated APIs
   ┃ ┗ 📜 server.js         # App Bootstrap & Socket binding
   ┗ 📜 package.json
```

---

## 🗄 Database Design

The MongoDB schema is denormalized for performance while maintaining strict Object-Relational constraints where necessary.

- **`Users`**: Holds credentials, profile data, and RBAC roles.
- **`Tasks`**: Contains job metadata and holds a reference to the `Assignee` (User).
- **`WorkerLocations`**: Time-series arrays of GPS coordinates, structured to optimize read/writes per worker per day.
- **`Geofences`**: GeoJSON boundaries defining physical sites.
- **`GeofenceEvents`**: An append-only ledger tracking whenever a worker's GPS intersects a Geofence.
- **`LeaveRequests`**: Tracks time-off approvals, directly influencing daily dashboard availability metrics.

### Database ER Diagram
<!-- Insert ER Diagram Screenshot -->

---

## 🔌 API Overview

Core REST endpoints driving the application state:

| Method | Endpoint | Description | Authorization Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Exchanges user credentials for a valid JWT | ❌ None |
| `GET` | `/api/tasks` | Fetches tasks based on role visibility | 🔒 User / Admin |
| `PATCH` | `/api/tasks/:id/status` | Transitions task state (e.g., In-Progress) | 🔒 User / Admin |
| `GET` | `/api/tracking/trail/:id` | Retrieves historical polyline coordinates | 🔒 Admin |
| `GET` | `/api/dashboard/analytics` | Fetches aggregated statistical KPIs | 🔒 Admin |
| `GET` | `/api/ai/operations-summary` | Triggers LLM inference for executive insights | 🔒 Admin |

---

## 🤖 AI Integration

OpsGrid goes beyond basic data aggregation by employing LLMs to act as an automated operational analyst.

- **Prompt Generation:** The backend gathers raw KPIs (offline workers, total distance, completed tasks) and constructs a dynamic, deterministic prompt context.
- **Groq Primary Strategy:** The prompt is dispatched to the Groq API (Llama 3.3) for sub-second, natural-language inference.
- **Gemini Fallback Strategy:** If Groq encounters rate limits or network failures, the system catches the exception and automatically re-routes the prompt to the Google GenAI API.
- **Dashboard Rendering:** The resulting string is parsed safely and rendered securely as Markdown on the Admin Dashboard.

---

## 🔒 Security Features

- **JWT (JSON Web Tokens):** Ensures stateless, secure session management across the platform.
- **bcrypt Cryptography:** Industry-standard cryptographic hashing guarantees zero plain-text password storage.
- **Role-Based Access Control (RBAC):** Strict Express middlewares separate Admin capabilities from Worker boundaries.
- **Protected APIs:** Impossible to fetch or mutate data without a valid Bearer token.
- **Environment Isolation:** Credentials and API keys are strictly isolated from source code via `.env`.
- **Input Validation:** Backend guards against malformed geospatial data or missing required fields.
- **CORS Protection:** Cross-Origin Resource Sharing is locked down to prevent unauthorized domain access.

---

## ⚙️ Engineering Challenges Solved

- **Real-Time Socket Synchronization:** Engineered a robust WebSocket integration that broadcasts live coordinates to the admin dashboard instantly without crippling the event loop.
- **GPS Distance Consistency:** Implemented a unified mathematical utility applying the Haversine formula across all modules (KPI cards, charts, individual profiles) to ensure distance metrics perfectly align.
- **React StrictMode Duplicate Requests:** Guarded the AI operations API with `useRef` mechanisms to prevent redundant LLM generations and save API quota during component lifecycles.
- **AI Provider Failover:** Designed a robust Strategy Pattern inside the AI service to automatically swap from Groq to Gemini in the event of an API failure, ensuring zero downtime for administrative insights.
- **Continuous GPS Trail Rendering:** Decoupled visual map plotting logic from strict distance-threshold filters to ensure smooth, continuous polyline trails on the tracking dashboard.
- **Modular Architecture:** Structured the backend using Domain-Driven Design, completely isolating features (Tracking, Tasks, AI) to ensure maximum scalability and maintainability.

---

## 📈 Project Status

- [x] Authentication & RBAC
- [x] Live GPS Tracking via Sockets
- [x] Interactive Mapping & Trails
- [x] Geofence Event Generation
- [x] Task Dispatching & Lifecycle
- [x] Worker PWA Dashboard
- [x] KPI Analytics Aggregation
- [x] AI Intelligence Summaries
- [x] Groq/Gemini Failover Logic

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- npm
- MongoDB
- Git
- Groq API Key
- Gemini API Key

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/opsgrid.git
cd opsgrid
```

### 2. Install Backend
```bash
cd backend
npm install
```

### 3. Install Frontend
```bash
cd ../frontend
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory using this template:

| Variable | Description |
| :--- | :--- |
| `PORT` | Server port (e.g., `5000`) |
| `MONGO_URI` | MongoDB Connection String |
| `JWT_ACCESS_SECRET` | Cryptographic secret for signing access tokens |
| `GROQ_API_KEY` | API Key for the primary Groq AI engine |
| `GEMINI_API_KEY` | API Key for the fallback Gemini AI engine |

---

## ▶ Running the Project

Open two terminal windows.

**Run Backend (Terminal 1)**
```bash
cd backend
npm run dev
```

**Run Frontend (Terminal 2)**
```bash
cd frontend
npm run dev
```

### Local URLs
| Service | URL |
| :--- | :--- |
| **Frontend** | `http://localhost:5173` |
| **Backend REST API** | `http://localhost:5000` |
| **Socket Server** | `http://localhost:5000` |
| **Swagger Docs** | `<!-- Insert Swagger URL -->` |

---

## 📸 Screenshots

**Login**
<!-- Insert Screenshot -->

**Admin Dashboard**
<!-- Insert Screenshot -->

**Worker Dashboard**
<!-- Insert Screenshot -->

**Live Tracking**
<!-- Insert Screenshot -->

**Task Management**
<!-- Insert Screenshot -->

**Attendance**
<!-- Insert Screenshot -->

**Geofence Manager**
<!-- Insert Screenshot -->

**Leave Requests**
<!-- Insert Screenshot -->

**Notifications**
<!-- Insert Screenshot -->

**Worker Availability**
<!-- Insert Screenshot -->

**Task Submission**
<!-- Insert Screenshot -->

**Dashboard Analytics**
<!-- Insert Screenshot -->

**AI Operations Summary**
<!-- Insert Screenshot -->

**Responsive Mobile View**
<!-- Insert Screenshot -->

---

## 🚀 Deployment

| Service | Provider | Status |
| :--- | :--- | :--- |
| **Frontend** | <!-- Insert Provider --> | <!-- Insert Status --> |
| **Backend** | <!-- Insert Provider --> | <!-- Insert Status --> |
| **Database** | <!-- Insert Provider --> | <!-- Insert Status --> |
| **AI Provider** | Groq / Google | Active |

---

## 🔮 Future Scope

- **Push Notifications:** Deep integration with FCM for offline mobile alerts.
- **Offline Sync:** Service Workers caching task submissions while offline and replaying them when reconnected.
- **Mobile App:** Compiling the frontend to React Native to leverage persistent OS-level background location tracking.
- **Route Optimization:** Integrating TSP algorithms to provide the fastest travel path between multiple tasks.
- **Predictive Analytics:** Evolving the AI module to predict task completion times based on historical worker speed and traffic.

---

## 🏆 Credits

Built utilizing the following powerful technologies:
- React
- Express
- MongoDB
- Socket.IO
- Leaflet
- Groq
- Google Gemini
- TailwindCSS

---

## 🤝 Contributing

Contributions make the open-source community an incredible place to learn and create. Any contributions you make are **greatly appreciated**. 

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License.

---

## 👨💻 Author

<!-- Insert Author Name / GitHub Link / LinkedIn Link -->

---

## ⭐ Support

If you found this project interesting, learned something new, or used it as a reference for your own work, please consider giving it a ⭐ on GitHub! It helps the project grow and reach more developers.
