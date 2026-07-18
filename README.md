# CronWatch - Backend Monitoring Server

CronWatch is a centralized, production-ready monitoring backend for tracking PM2 cron job executions and heartbeats across multiple EC2 instances. Monitoring agents on remote servers send execution states and periodic heartbeats to this service, which exposes real-time status and health metrics for a monitoring dashboard.

---

## Folder Structure

```
src/
├── main.ts                     # NestJS application bootstrapping (Validation Pipe & Swagger)
├── app.module.ts               # Core module importing feature domains and Mongoose
├── common/                     # Common filters, pipes, and interceptors
├── config/
│   └── configuration.ts        # Environment configurations (Port, MongoDB URI, App Name)
├── agents/                     # Server agent registration, heartbeats, and status monitoring
│   ├── dto/                    # Validation DTOs (RegisterAgentDto, HeartbeatDto)
│   ├── schemas/                # Mongoose Agent schema
│   ├── agents.controller.ts    # REST endpoints for agents
│   ├── agents.service.ts       # Registration logic & background offline server daemon
│   └── agents.module.ts
├── events/                     # PM2 cron execution event tracking
│   ├── dto/                    # Validation DTO (CreateEventDto, GetExecutionsFilterDto)
│   ├── schemas/                # Mongoose Execution schema
│   ├── events.controller.ts    # REST endpoints for events and execution history
│   ├── events.service.ts       # Event storage & auto-triggering alerts on failures
│   └── events.module.ts
├── dashboard/                  # Dashboard statistics and aggregation module
│   ├── dashboard.controller.ts # GET /dashboard endpoint
│   ├── dashboard.service.ts    # Aggregation pipeline logic for server and job health metrics
│   └── dashboard.module.ts
└── alerts/                     # Host went offline or cron execution failure alerts
    ├── dto/                    # Query filter DTO (GetAlertsFilterDto)
    ├── schemas/                # Mongoose Alert schema
    ├── alerts.controller.ts    # GET /alerts & PATCH /alerts/:id/acknowledge
    ├── alerts.service.ts       # Alert management
    └── alerts.module.ts
```

---

## Tech Stack

- **Framework**: NestJS (v11.x)
- **Language**: TypeScript
- **Database**: MongoDB & Mongoose
- **API Documentation**: Swagger OpenAPI 3.0
- **Validation**: `class-validator` & `class-transformer`
- **Containerization**: Docker & Docker Compose

---

## Installation

### Prerequisites
- Node.js (v20+ recommended)
- npm
- MongoDB (running locally if not running via Docker)

### Setup
1. Clone or navigate to the directory:
   ```bash
   cd CronWatch
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Copy the template:
   ```bash
   cp .env.example .env
   ```
   Modify `.env` as required (defaults: port `3000`, local mongodb `mongodb://localhost:27017/cronwatch`).

---

## Run Locally

### Start MongoDB
Make sure MongoDB is running on your machine, or start it via Docker:
```bash
docker run -d -p 27017:27017 --name local-mongo mongo:latest
```

### Run NestJS Dev Server
```bash
# Development mode with hot-reload
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The server will start at: `http://localhost:3000`

---

## Docker Execution

To build and run the entire stack (NestJS backend + MongoDB database) in containerized mode:

```bash
# Spin up services
docker-compose up -d --build
```

The database volume is persisted locally, and the backend is exposed on port `3000`.

To stop the containers:
```bash
docker-compose down
```

---

## API Documentation

Swagger API documentation is dynamically generated and available at:
`http://localhost:3000/api`

### Available Endpoints

#### **Agents Module (`/agents`)**
* **`POST /agents/register`**
  Registers a new agent or updates its hostname/IP if it already exists.
  * **Payload**:
    ```json
    {
      "serverId": "srv-001",
      "serverName": "API Gateway Server",
      "hostname": "ec2-instance-1",
      "ipAddress": "192.168.1.10",
      "environment": "production",
      "backend": "PM2"
    }
    ```
* **`POST /agents/heartbeat`**
  Updates the `lastHeartbeat` timestamp of the agent and resets its status to `ONLINE`.
  * **Payload**:
    ```json
    {
      "serverId": "srv-001"
    }
    ```
* **`GET /agents`**
  Returns all registered server agents.

#### **Events & Executions Module (`/events` & `/executions`)**
* **`POST /events`**
  Records a cron job execution start, completion, or failure. 
  * Automatically calculates `duration` if both `startedAt` and `completedAt` are supplied.
  * Automatically triggers a `CRITICAL` severity Alert if status is `FAILED`.
  * **Payload**:
    ```json
    {
      "serverId": "srv-001",
      "backend": "PM2",
      "jobName": "db-backup-cron",
      "status": "FAILED",
      "startedAt": "2026-07-18T12:00:00.000Z",
      "completedAt": "2026-07-18T12:01:30.000Z",
      "message": "Out of disk space"
    }
    ```
* **`GET /executions`**
  Returns all execution logs with pagination and filters.
  * **Query Params**: `serverId`, `jobName`, `status`, `limit` (default: 100), `skip` (default: 0)

#### **Alerts Module (`/alerts`)**
* **`GET /alerts`**
  Returns all alerts.
  * **Query Params**: `serverId`, `jobName`, `severity` (INFO, WARNING, CRITICAL), `acknowledged` (true/false), `limit`, `skip`
* **`PATCH /alerts/:id/acknowledge`**
  Acknowledges an active alert.

#### **Dashboard Module (`/dashboard`)**
* **`GET /dashboard`**
  Returns system-wide aggregated metrics and the 10 most recent execution runs.
  * **Response Format**:
    ```json
    {
      "totalServers": 3,
      "onlineServers": 2,
      "runningJobs": 1,
      "healthyJobs": 5,
      "failedJobs": 1,
      "latestExecutions": [...]
    }
    ```

---

## Verification & Manual Testing

### 1. Register an Agent
```bash
curl -X POST http://localhost:3000/agents/register \
  -H "Content-Type: application/json" \
  -d '{"serverId": "srv-001", "serverName": "Prod Web App", "hostname": "web-instance-01", "ipAddress": "54.210.12.14", "environment": "production", "backend": "PM2"}'
```

### 2. Send Heartbeat
```bash
curl -X POST http://localhost:3000/agents/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"serverId": "srv-001"}'
```

### 3. Record Successful Execution Event
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{"serverId": "srv-001", "backend": "PM2", "jobName": "report-generator", "status": "COMPLETED", "startedAt": "2026-07-18T12:00:00Z", "completedAt": "2026-07-18T12:00:15Z"}'
```

### 4. Record Failed Execution Event (Automatically Triggers Alert)
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{"serverId": "srv-001", "backend": "PM2", "jobName": "cache-warmup", "status": "FAILED", "startedAt": "2026-07-18T12:05:00Z", "completedAt": "2026-07-18T12:05:02Z", "message": "Redis connection timeout"}'
```

### 5. Fetch Dashboard Stats
```bash
curl http://localhost:3000/dashboard
```

### 6. Fetch Generated Alerts
```bash
curl http://localhost:3000/alerts
```
