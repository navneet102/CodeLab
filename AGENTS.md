# AGENTS.md — CodeSync Project Intelligence & Guidelines

Welcome to **CodeSync**. This document serves as the single source of truth for AI agents (and human developers) to immediately understand the repository architecture, data pipelines, conventions, environment setup, and development workflows without having to repeatedly parse the entire codebase.

---

## 1. Project Overview & Core Mission

**CodeSync** is a high-performance, real-time collaborative coding platform designed for pair programming, technical interviews, and remote teaching.

### Key Capabilities
- **Collaborative Code Editing**: Multi-cursor, low-latency, conflict-free text editing powered by **Monaco Editor**, **Yjs (CRDT)**, and a dedicated WebSocket server.
- **Isolated Code Execution**: Secure sandboxed execution of **Python**, **C++**, and **Java** inside ephemeral Docker containers managed by **BullMQ** workers.
- **Room Lifecycle & Live Communication**: Ephemeral and persistent coding rooms identified by 6-character alphanumeric invite codes, with real-time user presence, cursor tracking, and live chat via **Socket.IO**.
- **Assessment / Interview Mode**: Test case runner supporting input/output assertions, hidden test cases, and pass/fail metrics.

---

## 2. High-Level Architecture Diagram

```
[ Browser Client ]
  │
  ├──► [Port 5173] Vite + React 19 + Monaco Editor + Zustand
  │
  ├──► [Port 4444] ws:// Yjs WebSocket Server (y-protocols CRDT synchronization)
  │
  ├──► [Port 3001] http:// Express REST API (/api/rooms, /api/execution)
  │
  └──► [Port 3001] ws:// Socket.IO Server (rooms, live chat, presence, code trigger)
                               │
                       ┌───────┴───────┐
                       ▼               ▼
                 [ MongoDB 7 ]    [ Redis 7 ]
                 (Room, Exec)          │
                                       ▼
                             [ BullMQ Queue ] ("code-execution")
                                       │
                                       ▼
                       [ Execution Worker (Node.js) ]
                                       │
                                       ▼
                       [ Dockerode Sandbox Engine ]
                        - python:3.12-alpine
                        - gcc:13-bookworm
                        - eclipse-temurin:21-jdk-alpine
                        (Network: none | Mem: 256MB | CPU: 1 | Timeout: 15s)
                                       │
                                       ▼
                       Redis Pub/Sub: 'execution:result'
                                       │
                       Socket.IO Server emits 'code:result'
                                       │
                               [ Browser Client ]
```

---

## 3. Monorepo Structure & Workspaces

The root `package.json` configures an npm workspace with three main packages:

```
CodeSync/
├── .env.example              # Central environment variables blueprint
├── docker-compose.yml        # Orchestration for MongoDB & Redis
├── package.json              # Root scripts orchestrating client, server, and workers
├── AGENTS.md                 # AI agent knowledge base (this file)
│
├── client/                   # Frontend SPA (React 19 + Vite + Monaco)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/         # RoomChat component
│   │   │   ├── Editor/       # Monaco Editor wrapper & Yjs binding
│   │   │   ├── Layout/       # Navbar & shell components
│   │   │   ├── Room/         # RoomHeader, ProblemPanel, UserPresence, InviteModal
│   │   │   └── Terminal/     # OutputTerminal for execution logs & test results
│   │   ├── hooks/
│   │   │   ├── useSocket.js  # Socket.IO connection & event handlers
│   │   │   └── useYjs.js     # Yjs WebSocket provider & MonacoBinding
│   │   ├── pages/            # Home, CreateRoom, Room
│   │   ├── services/         # Axios api client & Socket.IO client singleton
│   │   ├── store/            # Zustand stores: roomStore.js, editorStore.js
│   │   ├── utils/            # Language configs, themes, constants
│   │   ├── index.css         # Global Vanilla CSS design system tokens
│   │   └── App.jsx           # React router routes (/, /room/create, /room/:inviteCode)
│   └── package.json
│
├── server/                   # Primary Backend (Express + Socket.IO + Yjs)
│   ├── server.js             # Bootstrap: DB connect, Redis, HTTP, Socket.IO, Yjs server
│   ├── src/
│   │   ├── app.js            # Express app, middleware (Helmet, CORS), route mounting
│   │   ├── config/           # db.js (Mongoose), redis.js (ioredis), env.js
│   │   ├── controllers/      # room.controller.js, execution.controller.js
│   │   ├── middleware/       # errorHandler.js
│   │   ├── models/           # Mongoose schemas: Room.js, Execution.js
│   │   ├── queues/           # executionQueue.js (BullMQ queue producer)
│   │   ├── routes/           # room.routes.js, execution.routes.js
│   │   ├── socket/           # index.js, roomHandlers.js, executionHandlers.js
│   │   └── yjs/              # yjsServer.js (standalone WS server), yjsUtils.js
│   └── package.json
│
├── workers/                  # Background Worker Service
│   ├── executionWorker.js    # BullMQ worker: Docker container lifecycle & execution
│   └── package.json
│
└── docker/
    └── runners/              # Optional custom Dockerfiles for runner base images
        ├── Dockerfile.cpp
        ├── Dockerfile.java
        └── Dockerfile.python
```

---

## 4. Technology Stack & Key Dependencies

| Component | Technology | Role & Notes |
| :--- | :--- | :--- |
| **Monorepo** | npm workspaces + `concurrently` | Orchestrates dev commands across packages |
| **Frontend Framework** | React 19 + Vite 8 | Fast ESM-based client |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) | JetBrains Mono / Cascadia font, multi-language syntax |
| **CRDT Engine** | `yjs`, `y-websocket`, `y-monaco` | Peer awareness (cursors/colors) & document syncing |
| **Client State** | Zustand (`zustand`) | Lightweight state stores (`roomStore`, `editorStore`) |
| **Realtime Transport** | `socket.io` & `socket.io-client` | Room joins/leaves, chat, execution queueing/results |
| **Backend API** | Node.js + Express 4 (CommonJS) | REST endpoints with Helmet & CORS |
| **Database** | MongoDB 7 (`mongoose` 8) | Stores room configurations, chat logs, and execution records |
| **Cache & Pub/Sub** | Redis 7 (`ioredis` 5) | BullMQ broker and execution result pub/sub |
| **Task Queue** | BullMQ (`bullmq` 5) | Job queue (`code-execution`) for asynchronous worker jobs |
| **Sandbox Execution** | Dockerode (`dockerode` 4) | Direct Docker API integration to spawn and kill runner containers |

---

## 5. Critical Invariants & System Flows

### A. Dual WebSocket Server Pattern
- **Socket.IO** runs on port `3001` (attached to the main HTTP server). It handles room management, active presence, user colors, chat, and execution dispatching.
- **Yjs Server** runs on port `4444` as an independent raw `ws` server (`server/src/yjs/yjsServer.js`). It specifically handles the `y-protocols/sync` and `y-protocols/awareness` binary protocol for Monaco document state.
- **Agent Rule**: Do not attempt to merge the Yjs raw WebSocket handler into the Socket.IO instance. They use distinct binary protocols.

### B. Sandboxed Code Execution Pipeline
1. **Trigger**: User clicks "Run Code" or "Run Tests".
2. **Socket Dispatch**: Client emits `code:run` or `code:run-tests` with language, code, stdin/test cases.
3. **Queueing**:
   - Server creates an `Execution` record with status `queued`.
   - Emits `code:status` to room members.
   - Pushes job to BullMQ queue `code-execution` via `enqueueExecution()`.
4. **Worker Processing**:
   - `workers/executionWorker.js` picks up the job.
   - Publishes `status: 'running'` to Redis channel `execution:result`.
   - Mounts code in a temporary directory (`os.tmpdir()/codesync-*`).
   - Spawns Docker container via Dockerode with:
     - `Memory: 256MB`
     - `NanoCpus: 1e9` (1 Core)
     - `NetworkMode: 'none'` (strictly offline)
     - `Timeout: 15000ms` (15s hard cutoff)
   - Compiles if required (`g++` for C++, `javac` for Java `Main.java`).
   - Runs executable and captures demuxed stdout/stderr.
   - Cleans up container (`container.remove({ force: true })`) and temp files.
5. **Result Dispatch**:
   - Worker publishes result to Redis channel `execution:result`.
   - Server `subscriber` receives message, updates `Execution` record in MongoDB, and broadcasts `code:result` to the room via Socket.IO.
   - Client updates `roomStore` and renders output in `OutputTerminal`.

### C. Room Lifecycle & Identification
- Rooms use a **6-character alphanumeric invite code** generated by `Room.generateInviteCode()` omitting ambiguous characters (0, O, 1, I, L).
- Rooms can be joined either by MongoDB `_id` or `inviteCode`.
- Users are assigned deterministic or cycled cursor colors from `CURSOR_COLORS`.

---

## 6. Development Setup & Commands

### Prerequisites
- Node.js >= 18.x
- Docker & Docker Compose (required for Redis, MongoDB, and code runners)

### Environment Variables
Ensure a `.env` file exists at the root (copied from `.env.example`):
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/codesync
REDIS_URL=redis://localhost:6379
YJS_PORT=4444
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-secret-key-change-in-production
```

### Essential Commands
All commands can be run from the workspace root:

| Command | Action |
| :--- | :--- |
| `docker-compose up -d` | Start MongoDB (port 27017) and Redis (port 6379) |
| `npm run install:all` | Install all dependencies across all workspaces |
| `npm run dev` | Launch client, server, and worker concurrently |
| `npm run dev:server` | Run backend server with nodemon |
| `npm run dev:client` | Run Vite development server for client |
| `npm run dev:worker` | Run execution worker with nodemon |
| `cd client && npm run lint` | Run `oxlint` on frontend codebase |
| `cd client && npm run build` | Build Vite frontend production bundle |

---

## 7. Code Conventions & Standards for Agents

### Client Guidelines
- **Styling**: Use **Vanilla CSS** with existing CSS variables (`index.css`). **Do NOT introduce TailwindCSS** unless explicitly requested by the user.
- **Component Placement**: Place reusable components in `client/src/components/<Domain>/` with matching `<Component>.css`.
- **State Management**: Use Zustand (`client/src/store/roomStore.js` and `editorStore.js`). Keep React local state minimal (e.g. form inputs, transient toggles).
- **DOM & Accessibility**: Maintain descriptive IDs and testable hooks (e.g., `id="code-editor"`, `id="run-code-btn"`).

### Server Guidelines
- **Format**: Server and worker code uses **CommonJS** (`require` / `module.exports`). Client uses **ES Modules** (`import` / `export`).
- **Database Operations**: Always handle Mongoose queries asynchronously with appropriate try-catch blocks or Express error middleware.
- **Socket Handlers**: Keep `server/src/socket/index.js` clean by delegating domain logic to `roomHandlers.js` and `executionHandlers.js`.

### Execution Worker Guidelines
- **Security Invariant**: Never disable `NetworkMode: 'none'`, memory limits, or timeout limits in Docker container options. Runner containers must remain completely sandboxed.
- **Resource Cleanup**: Always use `try ... finally` blocks to ensure temporary directories are deleted and containers are removed even on timeout or error.

---

## 8. Common Pitfalls & Gotchas to Avoid

1. **Window / Global Monaco Ref**: In `client/src/components/Editor/CodeEditor.jsx`, the current code is exposed via `window.__codesync_getCode`. Make sure changes to Monaco integration preserve this getter or provide a stable store/ref alternative.
2. **Docker on Windows**: When running the execution worker locally on Windows, Docker Desktop must be running, and Dockerode must be able to connect to the local Docker pipe (`//./pipe/docker_engine`).
3. **Container Pull Delays**: The first time a language runs, Dockerode pulls the base image (`python:3.12-alpine`, `gcc:13-bookworm`, or `eclipse-temurin:21-jdk-alpine`). Ensure Docker has internet access to pull images or pre-pull them with `docker pull`.
4. **Java Class Name Constraint**: Java requires the class name to be `Main` and the file to be `Main.java`. This is enforced in `LANGUAGE_CONFIG.java.fixedFilename = 'Main.java'`.
