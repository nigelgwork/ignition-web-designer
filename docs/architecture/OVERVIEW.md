# Architecture Overview - Web-Based Ignition Perspective Designer

**Purpose:** Enable Perspective development from a web browser without requiring the native Designer client
**Scope:** Perspective view editing only (Vision is out of scope)
**Version:** 0.20.0

---

## System Overview

The Web-Based Ignition Perspective Designer is a Gateway module that enables web-based editing of Perspective views. It provides a secure REST API for reading and writing project resources, browsing tags, and serving a React-based designer UI - all accessible through a web browser.

## High-Level Architecture

```
┌─────────────┐
│   Browser   │
│  (React UI) │
└──────┬──────┘
       │ HTTPS
       │ /data/webdesigner/*
       ▼
┌────────────────────────────┐
│  Ignition Gateway          │
│  ┌──────────────────────┐  │
│  │ WebDesigner Module   │  │
│  │ ┌────────────────┐   │  │
│  │ │ Static Server  │   │  │  Serves React SPA
│  │ └────────────────┘   │  │
│  │ ┌────────────────┐   │  │
│  │ │  REST API      │   │  │  /api/v1/*
│  │ │  Handler       │   │  │
│  │ └────────┬───────┘   │  │
│  │          │           │  │
│  └──────────┼───────────┘  │
│             │              │
│  ┌──────────▼───────────┐  │
│  │  GatewayContext      │  │
│  │  ┌────────────────┐  │  │
│  │  │ ProjectManager │  │  │
│  │  │ TagManager     │  │  │
│  │  │ AuthManager    │  │  │
│  │  │ AuditManager   │  │  │
│  │  └────────────────┘  │  │
│  └──────────┬───────────┘  │
└─────────────┼──────────────┘
              │
         ┌────▼─────┐
         │  Project │
         │  Files   │
         └──────────┘
```

## System Components

### 1. Backend - Gateway Module
**Technology:** Java 17, Ignition SDK 8.3+
**Deployment:** .modl file installed in Ignition Gateway
**Module ID:** `com.me.webdesigner`

**Responsibilities:**
- Authenticate and authorize all requests
- Serve React SPA (static files)
- Provide REST API for resource access
- Interact with Ignition Gateway managers
- Audit log all write operations
- Implement optimistic concurrency control

**See:** [BACKEND.md](./BACKEND.md) for detailed documentation

### 2. Frontend - React SPA
**Technology:** React 18+, TypeScript, Zustand
**Build Tool:** Webpack 5
**Deployment:** Bundled with module, served at `/data/webdesigner/*`

**Responsibilities:**
- Render designer UI with three-panel layout
- Manage view state with undo/redo
- Provide component palette and property editor
- Handle drag-and-drop operations
- Communicate with backend API

**See:** [FRONTEND.md](./FRONTEND.md) for detailed documentation

## Core Architecture Patterns

### Design Pattern: MVC-Style Separation
- **Model**: ViewContent state in Zustand store
- **View**: React components (Canvas, PropertyEditor, etc.)
- **Controller**: Zustand actions + API client

### State Management: Zustand with History
- Centralized application state
- Command pattern for undo/redo
- History stack (max 50 states)
- Immutable updates via deep cloning

### Communication: REST API
- HTTP/HTTPS with JSON payloads
- Session-based authentication (cookies)
- Optimistic concurrency (ETags)
- Standard HTTP status codes

### Security: Defense in Depth
- Session authentication on every request
- Role-based authorization (Designer role)
- Input validation and sanitization
- Audit logging for all writes
- HTTPS encryption (Gateway level)

**See:** [SECURITY.md](../SECURITY.md) for security architecture

## Data Flow Overview

1. **Load View**: Browser → API → ProjectManager → view.json file
2. **Edit**: User interacts → Zustand state → Canvas renders
3. **Save**: Zustand → API → ProjectManager → view.json file
4. **Undo/Redo**: Zustand history navigation → Canvas re-renders

**See:** [DATA_FLOW.md](./DATA_FLOW.md) for detailed data flow documentation

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Backend | Java 17 + Ignition SDK | Gateway module implementation |
| Build (Backend) | Gradle 8.x | Module packaging (.modl) |
| Frontend | React 18 + TypeScript | Designer UI |
| Build (Frontend) | Webpack 5 | SPA bundling |
| State Management | Zustand 4.5 | Application state + history |
| HTTP Client | axios 1.6 | API communication |
| Tree Components | rc-tree 5.8 | Project/tag browsers |
| Script Editor | Monaco Editor | Python script editing |

## Key Design Decisions

### ADR-001: jakarta.* Instead of javax.*
- **Status**: Accepted
- **Reason**: Ignition 8.3+ requires Jakarta EE
- **Impact**: Compatible with Ignition 8.3+, not with pre-8.3

### ADR-002: Simplified Frontend View Model
- **Status**: Accepted
- **Reason**: Ignition view.json is complex and deeply nested
- **Impact**: Easier React integration, requires serialization layer

### ADR-003: Optimistic Concurrency via If-Match/ETag
- **Status**: Accepted
- **Reason**: Prevent concurrent edit conflicts
- **Impact**: Users see 409 on conflict, must reload and retry

### ADR-004: Simulation Canvas (Not Real Perspective)
- **Status**: Accepted
- **Reason**: Simpler to implement, no runtime overhead
- **Impact**: Not 100% WYSIWYG, faster rendering

## Deployment Model

**Package**: Single `.modl` file (Web-Designer-{version}.modl)

**Installation**:
1. Upload .modl to Gateway via Config > System > Modules
2. Gateway installs and starts module
3. Access UI at `https://gateway:8043/data/webdesigner/`

**Requirements**:
- Ignition Gateway 8.3.0+
- Java 17+ runtime
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Designer role or custom webdesigner.edit permission

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| SPA Initial Load | < 3s | First load with cold cache |
| API Response (GET view) | < 500ms | Typical view file |
| API Response (PUT view) | < 1s | With backup creation |
| Canvas Render (50 components) | < 100ms | Interactive frame rate |
| Undo/Redo | < 50ms | Near-instant feedback |

## Scalability Considerations

- **Stateless API**: Supports load balancing (session managed by Gateway)
- **File Concurrency**: Handled via optimistic locking (If-Match)
- **Resource Limits**: Depends on Gateway JVM heap
- **Component Limit**: Target support for 100+ components per view

## Related Documentation

- **[BACKEND.md](./BACKEND.md)** - Backend architecture details
- **[FRONTEND.md](./FRONTEND.md)** - Frontend architecture details
- **[DATA_FLOW.md](./DATA_FLOW.md)** - Data models and flow diagrams
- **[../SECURITY.md](../SECURITY.md)** - Security architecture
- **[../API.md](../API.md)** - REST API documentation
- **[../REQUIREMENTS.md](../REQUIREMENTS.md)** - Functional requirements
- **[../DEVELOPMENT.md](../DEVELOPMENT.md)** - Development guide

---

**Last Updated:** 2025-11-07
**Document Version:** 1.0
**Review Schedule:** After each major feature addition
