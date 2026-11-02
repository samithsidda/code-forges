<div align="center">

# ⚡ CodeForges

**Real-Time Collaborative Coding, Live P2P Video/Audio Calling, Online Code Execution & AI Assistant**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Video_&_Audio-333333?logo=webrtc&logoColor=white)](https://webrtc.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Groq AI](https://img.shields.io/badge/Groq-AI_Assistant-F55036?logo=groq&logoColor=white)](https://groq.com/)
[![Judge0](https://img.shields.io/badge/Judge0-Code_Execution-0052CC)](https://judge0.com/)

</div>

---

## 📖 Overview

**CodeForges** is a collaborative developer platform and online pair-programming environment. Designed for technical interviews, algorithm practice, and collaborative problem-solving, CodeForges allows developers to code together in real-time inside a Monaco-powered IDE, communicate with built-in low-latency WebRTC video and audio, execute code remotely across multiple languages, and leverage a shared AI coding assistant powered by Groq.

---

## ✨ Features

- 🔄 **Real-Time Synchronized Code Editor**
  - Powered by Monaco Editor (the editor that drives VS Code) with syntax highlighting, custom font scaling, and theme switching.
  - Sub-millisecond code synchronization across all room participants via Socket.IO.
  - Multi-language support: **Java**, **Python**, **C++**, and **JavaScript** with pre-configured boilerplates.

- 📹 **Integrated WebRTC Video & Audio Calling**
  - Peer-to-peer (P2P) mesh WebRTC video and voice chat right in the workspace.
  - Toggle camera and microphone on/off with live status updates broadcast to peers.
  - Collapsible/expandable video call pane designed not to distract from code.

- 🤖 **Groq-Powered AI Coding Assistant**
  - Context-aware AI assistant integrated directly into each coding room.
  - One-click quick actions: **Test Cases Generation**, **Edge Cases Analysis**, **Conceptual Hints**, and **Code Reviews** (complexity & bug identification).
  - Synchronized AI chat history: prompts and AI responses are shared across room members in real time.

- ⚙️ **Cloud Code Execution (Judge0)**
  - Remote code compilation and execution backed by the Judge0 API.
  - Interactive standard input (stdin) and output (stdout / stderr / compile errors).
  - Runtime metrics including execution time and memory consumption.
  - Shared console updates broadcast instantly across the room.

- 👥 **Room Management & Automatic Cleanup**
  - Create custom rooms with unique 6-character alphanumeric room codes.
  - Distinct member and owner roles with member lists and real-time presence tracking.
  - Problem assignment and solution submissions per room.
  - Automatic background cleanup routine expiring inactive rooms after 30 minutes of inactivity.

- 🔐 **Robust Authentication**
  - Standard email & password registration and login with bcrypt password hashing and JWT sessions.
  - **Google OAuth 2.0** and **GitHub OAuth** authentication flows with secure state validation.
  - Protected client routes and authenticated API middleware.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19, Vite 8
- **Routing**: React Router 7
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **Styling**: Tailwind CSS 4 & Custom CSS modules
- **Networking & Real-Time**: Socket.IO Client, Axios, Native WebRTC (`RTCPeerConnection`)

### Backend
- **Runtime**: Node.js, Express 5
- **Real-Time Engine**: Socket.IO (WebSockets & Signaling)
- **Database**: MongoDB via Mongoose ORM
- **Authentication**: JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `google-auth-library`
- **Compiler**: Judge0 CE API via RapidAPI
- **AI Engine**: Groq SDK (`openai/gpt-oss-20b`)

---

## 📁 Repository Structure

```text
CodeForges/
├── server/                          # Backend Express & Socket.IO server
│   ├── config/                      # Database connection (db.js)
│   ├── controllers/                 # Business logic controllers
│   │   ├── aiController.js          # Groq AI prompt engineering & chat
│   │   ├── authController.js        # Auth, Google OAuth & GitHub OAuth
│   │   ├── compilerController.js    # Judge0 code execution runner
│   │   ├── loginController.js       # Local login handler
│   │   ├── problemController.js     # Problem management
│   │   ├── roomController.js        # Room lifecycle & memberships
│   │   ├── solutionController.js    # Problem submissions
│   │   └── userController.js        # User profiles
│   ├── middleware/                  # JWT auth validation middleware
│   ├── models/                      # Mongoose models (User, Room, Problem, etc.)
│   ├── routes/                      # Express REST API routes
│   ├── app.js                       # Express app, HTTP & Socket.IO server setup
│   └── package.json
│
├── frontend/                        # Frontend workspace
│   └── client/                      # React + Vite application
│       ├── public/                  # Static assets
│       ├── src/
│       │   ├── api/                 # Axios API client setup
│       │   ├── components/          # Reusable UI components
│       │   │   ├── AIAssistant.jsx  # AI side panel with quick prompts
│       │   │   ├── CodeEditor.jsx   # Monaco code editor interface
│       │   │   ├── Console.jsx      # Execution output & stdin console
│       │   │   ├── LeftPanel.jsx    # Collapsible sidebar controls
│       │   │   ├── ProblemPanel.jsx # Problem statement view
│       │   │   ├── VideoCall.jsx    # WebRTC multi-party video call
│       │   │   └── ...
│       │   ├── pages/               # Route views (Home, Dashboard, Room, etc.)
│       │   ├── socket/              # Socket.IO client instance
│       │   ├── styles/              # Component stylesheets
│       │   ├── utils/               # Supported language configurations
│       │   ├── App.jsx              # React routes definition
│       │   └── main.jsx             # React entrypoint
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas URI)

External API Keys needed:
- **Groq API Key** (from [Groq Console](https://console.groq.com/))
- **RapidAPI Key** for Judge0 CE (from [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce))
- *(Optional)* Google OAuth Client ID & Secret
- *(Optional)* GitHub OAuth Client ID & Secret

---

### Installation & Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/samithsidda/code-forges.git
cd code-forges
```

#### 2. Configure Backend (`server/`)

1. Navigate to the `server` directory and install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file in `server/` with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/codeforges?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:5173
   BACKEND_URL=http://localhost:5000

   # Judge0 Compiler API (RapidAPI)
   RAPIDAPI_KEY=your_rapidapi_judge0_key

   # Groq AI
   GROQ_API_KEY=your_groq_api_key

   # OAuth Credentials (Optional for local testing)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

3. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server runs by default at `http://localhost:5000`.*

---

#### 3. Configure Frontend (`frontend/client/`)

1. Open a new terminal window, navigate to `frontend/client`, and install dependencies:
   ```bash
   cd frontend/client
   npm install
   ```

2. Create a `.env` file in `frontend/client/`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will be running at `http://localhost:5173`.*

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user with email & password |
| `POST` | `/api/auth/login` | Log in existing user with email & password |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/auth/google` | Initiate Google OAuth redirect |
| `GET` | `/api/auth/google/callback` | Google OAuth callback handler |
| `GET` | `/api/auth/github` | Initiate GitHub OAuth redirect |
| `GET` | `/api/auth/github/callback` | GitHub OAuth callback handler |

### Rooms (`/api/rooms`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/rooms` | Create a new coding room |
| `POST` | `/api/rooms/join` | Join room via 6-letter room code |
| `GET` | `/api/rooms` | Get rooms created by or joined by current user |
| `GET` | `/api/rooms/:roomCode` | Retrieve room details and member list |
| `POST` | `/api/rooms/:id/heartbeat` | Update room activity timestamp |
| `POST` | `/api/rooms/:id/leave` | Leave a room |
| `DELETE` | `/api/rooms/:id` | Delete room (owner only) |
| `PUT` | `/api/rooms/:id/problem` | Assign a coding challenge to room |

### Code Execution (`/api/compiler`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/compiler/run` | Execute code with Judge0 CE (supports Java, Python, C++, JS) |

### AI Assistant (`/api/ai`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/chat` | Send code context and question to Groq assistant |

### Solutions (`/api/solutions`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/solutions` | Submit code solution for an assigned problem |
| `GET` | `/api/solutions/:roomId` | Get current user's submitted solution in room |

---

## 🔌 Socket.IO Events

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `join-room` | Client ➔ Server | `{ roomCode, userId }` | Join the coding collaboration channel |
| `member-joined` | Server ➔ Client | `{ userId }` / `{ member }` | Broadcast when a collaborator joins |
| `code-change` | Client ➔ Server | `{ roomCode, code }` | Emit updated editor contents |
| `code-update` | Server ➔ Client | `code` | Receive latest code updates from peers |
| `console-update` | Client ⇄ Server | `{ roomCode, output, error }` | Sync compiler execution outputs |
| `ai-user-message` | Client ⇄ Server | `{ roomCode, message }` | Sync user questions to the AI assistant |
| `ai-response` | Client ⇄ Server | `{ roomCode, message }` | Sync AI replies across room participants |
| `join-video-room` | Client ➔ Server | `{ roomCode, name }` | Join WebRTC video signaling room |
| `webrtc-offer` | Client ⇄ Server | `{ targetSocketId, offer }` | WebRTC SDP offer exchange |
| `webrtc-answer` | Client ⇄ Server | `{ targetSocketId, answer }` | WebRTC SDP answer exchange |
| `webrtc-ice-candidate` | Client ⇄ Server | `{ targetSocketId, candidate }` | WebRTC ICE candidate signaling |
| `camera-toggle` / `mic-toggle` | Client ⇄ Server | `{ roomCode, cameraOn / micOn }` | Broadcast media track mute states |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

