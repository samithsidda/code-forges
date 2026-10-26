# CodeForges — Collaborative Online Coding Platform

CodeForges is a full-stack collaborative coding platform that enables developers to solve coding problems together in real time. Users can create or join coding rooms, collaborate through a shared code editor, execute code, and leverage AI-powered coding assistance.

Built using the MERN stack, CodeForges combines real-time communication, code execution, authentication, and AI integration to create an interactive environment for collaborative programming.

## ✨ Features

- **Collaborative Coding Rooms:** Create and join rooms for collaborative programming sessions.
- **Real-Time Code Synchronization:** Synchronize code changes between participants using Socket.IO.
- **Integrated Code Editor:** Use Monaco Editor for a programming-focused editing experience.
- **Code Execution:** Integrate Judge0 to submit and execute code.
- **AI-Powered Coding Assistance:** Use the Groq API for coding assistance, test case generation, and code review.
- **Authentication and Authorization:** Implement JWT-based authentication and Google/GitHub OAuth.
- **Room and Problem Management:** Manage coding rooms, problems, and solution submissions through backend APIs.
- **Full-Stack Architecture:** Connect a React frontend to a Node.js and Express backend with MongoDB.
- **Deployment:** Deployment workflow using Vercel, Render, and MongoDB Atlas.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-Time Communication | Socket.IO |
| Code Editor | Monaco Editor |
| Code Execution | Judge0 API |
| AI Integration | Groq API |
| Authentication | JWT, Google OAuth, GitHub OAuth |
| API Testing and Development | Postman |
| Deployment | Vercel, Render, MongoDB Atlas |

## 🏗️ Architecture

CodeForges follows a client-server architecture.

```text
                    ┌────────────────────────┐
                    │      React Frontend    │
                    │                        │
                    │  Coding Rooms          │
                    │  Monaco Editor         │
                    │  User Interface        │
                    └───────────┬────────────┘
                                │
                    ┌───────────┴────────────┐
                    │                        │
              HTTP / REST              Socket.IO
                    │                        │
                    ▼                        ▼
             ┌──────────────────────────────────┐
             │       Node.js + Express          │
             │                                  │
             │  Authentication                 │
             │  Room and Problem APIs           │
             │  Solution Management             │
             │  External API Integration        │
             └───────────┬───────────┬──────────┘
                         │           │
                 ┌───────▼─────┐ ┌───▼────────────┐
                 │   MongoDB   │ │ External APIs  │
                 │             │ │                │
                 │ Persistent  │ │ Judge0         │
                 │ Application │ │ Groq           │
                 │ Data        │ │ OAuth Providers│
                 └─────────────┘ └────────────────┘
```

*This is a conceptual architecture. The exact responsibilities and connections should match the implementation in the repository.*

### How It Works

1. A user accesses the React frontend and authenticates.
2. The user creates a coding room or joins an existing room.
3. The frontend communicates with the backend through REST APIs for application operations.
4. Socket.IO supports real-time communication between connected participants.
5. Room, problem, and solution data can be stored and retrieved through MongoDB.
6. Code submissions are sent to Judge0 for execution.
7. Coding assistance requests are processed through the Groq API.

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

Install the following:

- Node.js and npm
- MongoDB or a MongoDB Atlas account
- Git
- A Judge0 API configuration
- A Groq API key
- OAuth credentials if you intend to use Google or GitHub login

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>
```

Replace the placeholders with your actual GitHub repository URL and directory name.

### 2. Install Dependencies

Install dependencies separately for the frontend and backend, using the directories present in your repository.

```bash
# Backend
cd server
npm install

# Frontend — return to the project root first
cd ../client
npm install
```

If your repository uses different directory names, substitute the actual paths.

### 3. Configure Environment Variables

Create a `.env` file in the backend directory and configure the variables required by your implementation.

Example configuration template:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

GROQ_API_KEY=your_groq_api_key

JUDGE0_API_URL=your_judge0_api_url
JUDGE0_API_KEY=your_judge0_api_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

**Important:** These names are illustrative. Match them to the environment variable names used in your source code. Some integrations may require additional configuration.

Never commit real API keys, OAuth secrets, database credentials, or JWT secrets to GitHub.

Add `.env` to `.gitignore`:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
build/
```

Keep `.env.example` limited to placeholder values.

### 4. Start the Backend

From the backend directory, run the development command configured in `package.json`.

For example:

```bash
npm run dev
```

If your project uses a different script, use the appropriate command. The backend must connect successfully to the configured database and any required services.

### 5. Start the Frontend

Open another terminal and navigate to the frontend directory.

```bash
cd client
npm run dev
```

Open the local URL printed by Vite or your configured frontend development server.

If the backend and frontend use different ports, configure the frontend API base URL and CORS settings accordingly.

## 🔌 Core Backend Capabilities

The backend supports application operations related to rooms, problems, and solutions.

| Capability | Purpose |
|---|---|
| Authentication | Register or authenticate users and verify protected requests |
| Room management | Create and retrieve coding rooms |
| Room participation | Allow users to join coding sessions |
| Problem management | Create or assign coding problems |
| Solution submission | Submit solutions for processing |
| Code execution | Integrate with Judge0 |
| AI assistance | Integrate coding-related requests with Groq |
| Real-time events | Exchange collaborative updates through Socket.IO |

The exact route paths, request payloads, response formats, and access permissions depend on the implemented backend routes.

## ⚡ Real-Time Collaboration

Socket.IO provides event-based communication between the client and server.

A typical collaborative coding workflow involves:

1. Connecting a participant to the real-time server.
2. Associating the participant with the appropriate coding room.
3. Sending code-change events from the editor.
4. Broadcasting updates to the relevant participants.
5. Handling disconnections and room membership changes.

For a production-ready collaborative editor, additional considerations include preventing update loops, managing simultaneous edits, handling reconnects, and maintaining consistent editor state.

## 🤖 AI-Powered Coding Assistance

CodeForges integrates the Groq API to support AI-powered development assistance.

Potential workflows include:

- Explaining code and programming concepts.
- Generating test cases for submitted code.
- Reviewing code for potential issues.
- Helping users understand errors and improve their solutions.

The backend should validate incoming requests, handle model/API errors, and keep API credentials private. AI-generated suggestions should be reviewed rather than treated as guaranteed-correct output.

## ▶️ Code Execution with Judge0

Judge0 provides the code execution service.

A typical execution flow is:

1. The user writes code in Monaco Editor.
2. The frontend submits the code and selected language to the backend.
3. The backend forwards the submission to Judge0.
4. Judge0 processes the execution request.
5. The backend retrieves or receives the execution result, depending on the configured integration.
6. The result is returned to the frontend for display.

Execution handling should account for compilation errors, runtime errors, time limits, failed submissions, and external service outages. Untrusted code should be executed through a properly isolated execution service.

## 🔐 Security Considerations

Important security practices for CodeForges include:

- Hashing passwords before storing them.
- Verifying JWTs on protected endpoints.
- Checking room membership and permissions before allowing restricted operations.
- Validating and sanitizing request inputs.
- Keeping API keys and OAuth secrets on the backend.
- Applying suitable CORS policies and rate limits.
- Handling external API errors without exposing secrets.
- Preventing unauthorized access to rooms and solution data.

Authentication establishes who the user is; authorization determines what that user is permitted to do.

## 🧪 Testing and Debugging

Useful tools and practices for testing CodeForges include:

- **Postman:** Verify REST endpoints, request validation, and response codes.
- **Unit tests:** Test isolated functions and business logic.
- **Integration tests:** Test interactions between Express routes, middleware, and data layers.
- **Real-time testing:** Verify that room participants receive the expected Socket.IO events.
- **External API testing:** Check success responses, invalid requests, timeouts, and service failures.

Automated tests can be added using Jest and Supertest where configured in the project.

## 📁 Project Structure

The following is a conceptual structure. Adapt it to the actual repository layout.

```text
CodeForges/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── ...
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🔮 Potential Future Improvements

- Add robust collaborative editing conflict resolution.
- Improve reconnect and session recovery behavior.
- Expand automated unit and integration test coverage.
- Introduce stronger room-level roles and permissions.
- Add execution history and solution tracking.
- Improve observability, error logging, and performance monitoring.
- Strengthen CI/CD checks and deployment reliability.

These are potential enhancements, not claims about currently implemented features.

## 🎯 Learning Outcomes

CodeForges brings together several practical full-stack engineering concepts:

- Building RESTful APIs with Node.js and Express.
- Designing and querying MongoDB data models.
- Implementing authentication and protected routes.
- Developing real-time features with Socket.IO.
- Integrating a code editor and external execution service.
- Connecting an LLM API to application workflows.
- Debugging and coordinating multiple services in a full-stack application.

## 👨‍💻 Author

**Samith Sidda**

- GitHub: [samithsidda](https://github.com/samithsidda)
- LinkedIn: [samith-sidda](https://linkedin.com/in/samith-sidda-5679a0356)

---

If you find this project interesting, feel free to explore the code and share feedback.
