# CronWatch - Project Decisions

Last Updated: 18 July 2026

---

# Project Goal

CronWatch is a lightweight centralized monitoring system for Node.js cron jobs running on multiple EC2 servers.

The objective of V1 is to provide live visibility into cron health with minimal infrastructure.

This is an MVP built for rapid delivery.

---

# Architecture

CronWatch consists of three independent applications.

- Server (NestJS)
- Agent (Node.js)
- Dashboard (React)

No monorepo tooling.

Each application can be deployed independently.

---

# Communication

Communication is Push only.

Agent ---> CronWatch Server

The server NEVER connects to backend servers.

The server NEVER SSHes into any machine.

---

# Monitoring Method

Monitoring is log based.

Agent reads PM2 logs.

Agent converts log messages into structured events.

Server never parses log files.

---

# Data Flow

PM2

↓

CronWatch Agent

↓

HTTPS REST API

↓

CronWatch Server

↓

MongoDB

↓

Dashboard

---

# Database

Collections

- agents
- executions
- alerts

No additional collections in V1 unless absolutely necessary.

---

# Authentication

Not included in V1.

Authentication will be implemented in V2.

No JWT.

No Users.

No Roles.

---

# Alerting

Supported

- Email

Future

- Slack
- Teams
- Telegram
- Discord
- Webhooks

---

# Dashboard

Pages

- Dashboard
- Servers
- Jobs
- Executions
- Alerts

No Settings page in V1.

---

# Agent Responsibilities

Agent must

- Register itself
- Send heartbeat
- Read PM2 logs
- Detect cron execution
- Detect failures
- Detect skipped jobs
- Send structured events

---

# Server Responsibilities

Server must

- Receive heartbeats
- Store executions
- Calculate dashboard statistics
- Store alerts
- Expose REST APIs

Server must NEVER

- SSH into EC2
- Read log files
- Connect to PM2

---

# Event Format

Every cron execution must be sent as structured JSON.

Example

{
  "serverId": "...",
  "backend": "...",
  "jobName": "...",
  "status": "SUCCESS",
  "startedAt": "...",
  "completedAt": "...",
  "duration": 2400,
  "message": ""
}

---

# Heartbeat

Agent heartbeat interval

30 seconds

If heartbeat is older than

90 seconds

Server considers the agent OFFLINE.

---

# Technologies

Server

- NestJS
- MongoDB
- Mongoose

Agent

- Node.js
- TypeScript

Dashboard

- React
- Vite

---

# Deployment

One Monitoring Server

One MongoDB

One Agent installed on every backend EC2.

---

# V1 Scope

Included

- Agent Registration
- Heartbeats
- Cron Events
- Dashboard APIs
- Email Alerts

Excluded

- Authentication
- RBAC
- Audit Logs
- Manual Trigger
- Retry Jobs
- Pause Jobs
- Live Logs
- PM2 Management
- Multi-tenancy

---

# Development Principles

Keep implementation simple.

Avoid overengineering.

Avoid unnecessary abstractions.

Prefer readability over cleverness.

Controllers remain thin.

Business logic belongs in services.

No CQRS.

No Repository Pattern.

No Event Sourcing.

No Microservices.

Everything runs as one NestJS application.

---

# Future Versions

V2

- Authentication
- RBAC
- Notification Settings
- Slack
- Teams

V3

- Remote Execution
- PM2 Restart
- Retry Failed Jobs
- Maintenance Mode