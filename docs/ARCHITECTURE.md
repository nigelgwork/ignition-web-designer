# Architecture Documentation - Web-Based Ignition Perspective Designer

## Overview

The Web-Based Ignition Perspective Designer is a Gateway module that enables web-based editing of Perspective views. It provides a secure API for reading and writing project resources, browsing tags, and serving a React-based designer UI - all accessible through a web browser.

**Purpose**: Enable Perspective development from a web browser without requiring the native Designer client.
**Scope**: Perspective view editing only (Vision is out of scope).

## System Architecture

### High-Level Diagram
```
┌─────────────┐
│   Browser   │
│  (React UI) │
└──────┬──────┘
       │ HTTPS
       │ /webdesigner/*
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

### Components

#### Component 1: Gateway Module (Backend)
- **Purpose:** Provides secure API access to Ignition resources and serves the frontend SPA
- **Technology:** Java 17, Ignition SDK 8.3+, Gradle
- **Responsibilities:**
  - Authenticate and authorize all requests
  - Read/write project resources (view.json files)
  - Browse tag providers and tags
  - Introspect Perspective component registry
  - Serve static frontend files
  - Audit log all write operations
  - Implement optimistic concurrency control
- **Interfaces:**
  - HTTP REST API at `/webdesigner/api/v1/*`
  - Static file server at `/webdesigner/*`
  - GatewayContext API for accessing Ignition managers

#### Component 2: React SPA (Frontend)
- **Purpose:** Provide web-based designer UI for editing Perspective views
- **Technology:** React 18+, TypeScript, Vite, Zustand, react-dnd, react-rnd
- **Responsibilities:**
  - Render project and tag tree browsers
  - Simulate view canvas with drag-and-drop
  - Provide component palette
  - Render property editor with binding support
  - Manage in-memory view state
  - Serialize/deserialize view.json format
  - Handle save conflicts (409 responses)
  - Support dark mode theming
- **Interfaces:**
  - Communicates with backend via axios HTTP client
  - Renders in user's web browser

## Data Architecture

### Data Models

#### Internal View Model (Frontend)
```typescript
{
  id: string,              // View identifier
  width: number,           // Canvas width
  height: number,          // Canvas height
  children: Component[]    // Array of components
}

Component {
  id: string,              // Unique component ID
  type: string,            // e.g., "ia.display.label"
  props: {                 // Component properties
    [key: string]: any | BindingObject
  },
  layout: {                // Position and size
    x: number,
    y: number,
    w: number,
    h: number
  }
}

BindingObject {
  binding: {
    type: "tag" | "property" | "expression",
    path: string,          // e.g., "[default]PLC1/temp"
    mode: "read" | "write" | "bidirectional"
  }
}
```

#### ComponentDescriptor (Backend → Frontend)
```json
{
  "id": "label",
  "displayName": "Label",
  "category": "basic",
  "icon": "label",
  "props": {
    "text": {
      "type": "string",
      "default": "Label",
      "editor": "text"
    },
    "style.fontSize": {
      "type": "number",
      "default": 14,
      "editor": "number"
    }
  }
}
```

### Data Flow

1. **Load View Flow:**
   - User selects view in ProjectTree
   - Frontend calls `GET /api/v1/projects/{name}/view?path=...`
   - Backend validates auth, reads view.json from ProjectManager
   - Backend returns view.json + ETag header (file signature)
   - Frontend parses view.json into internal model
   - Frontend stores ETag for later save
   - Canvas renders components

2. **Edit Property Flow:**
   - User modifies property in PropertyEditor
   - Frontend updates internal model in Zustand store
   - Canvas re-renders affected component
   - Changes remain in-memory (not saved yet)

3. **Save View Flow:**
   - User clicks "Save" button
   - Frontend serializes internal model to view.json format
   - Frontend calls `POST /api/v1/projects/{name}/view?path=...`
     - Includes stored ETag in If-Match header
     - Sends serialized view.json in body
   - Backend validates auth, checks If-Match against current file
     - If match: saves file, updates project, logs audit event, returns 200
     - If mismatch: returns 409 Conflict
   - Frontend handles response:
     - 200: updates stored ETag, shows success
     - 409: shows conflict dialog, prompts user to reload

4. **Tag Binding Flow:**
   - User drags tag from TagTree
   - Drop target (property input) receives tag path
   - Frontend calls Zustand action: `setPropertyBinding(componentId, propPath, tagPath)`
   - Store updates internal model with BindingObject
   - PropertyEditor re-renders showing binding chip
   - User saves to persist binding

### Storage Strategy
- **Primary Storage:** Ignition Gateway filesystem (managed by ProjectManager)
- **Backup Strategy:** Backend creates timestamped backup before every save
  - Location: `perspective/views/_backups/{viewname}_{timestamp}.json`
- **Caching:** None at application level (relies on browser HTTP cache)
- **State Management:** Zustand store in frontend (ephemeral, in-memory)

## Technology Stack

### Core Technologies
| Layer | Technology | Justification |
|-------|------------|---------------|
| Backend | Java 17 | Required for Ignition 8.3+ SDK |
| Build System | Gradle | Official Ignition module build system |
| Frontend Framework | React 18 + TypeScript | Modern, type-safe, widely adopted |
| Build Tool (Frontend) | Vite | Fast dev server, optimized production builds |
| State Management | Zustand | Lightweight, simple, performant |
| Drag & Drop | react-dnd + react-rnd | Industry standard, flexible |
| HTTP Client | axios | Interceptor support, easy configuration |
| Tree Component | rc-tree | Performant, feature-rich |

### Dependencies

#### Production Dependencies (Backend):
- **Ignition SDK 8.3+** - Gateway module framework, ProjectManager, TagManager, AuthManager
- **Gson** - JSON serialization (likely already available in Ignition)

#### Production Dependencies (Frontend):
- **react** + **react-dom** - UI framework
- **zustand** - State management
- **react-dnd** + **react-dnd-html5-backend** - Palette/tag drag-and-drop
- **react-rnd** - Canvas component resize/drag
- **rc-tree** - Project/tag tree browser
- **axios** - HTTP client
- **@monaco-editor/react** - Script editor (post-MVP)

#### Development Dependencies:
- **TypeScript** - Type safety
- **Vite** - Frontend build tool
- **ESLint** + **Prettier** - Code quality
- **Jest** + **React Testing Library** - Frontend testing
- **JUnit** + **Mockito** - Backend testing
- **Cypress** - E2E testing

## Design Decisions

### ADR-001: Use jakarta.* Instead of javax.*
- **Status:** Accepted
- **Date:** 2025-11-02
- **Context:** Ignition 8.3+ migrated from Java EE (javax) to Jakarta EE (jakarta)
- **Decision:** All servlet-based code must use jakarta.servlet.* imports
- **Consequences:**
  - ✅ Compatible with Ignition 8.3+
  - ✅ Future-proof
  - ❌ Incompatible with pre-8.3 versions
- **Alternatives Considered:** Target 8.1/8.2 with javax - rejected due to older LTS

### ADR-002: Simplified View Model in Frontend
- **Status:** Accepted
- **Date:** 2025-11-02
- **Context:** Ignition view.json format is complex and nested
- **Decision:** Maintain a simplified, flattened internal model in Zustand, serialize on save
- **Consequences:**
  - ✅ Easier to work with in React components
  - ✅ Simpler state updates
  - ✅ Clear separation between API format and UI state
  - ❌ Requires serialization/deserialization logic
  - ❌ Potential for format drift if Ignition changes view.json
- **Alternatives Considered:** Use view.json directly - rejected due to complexity

### ADR-003: Optimistic Concurrency via If-Match/ETag
- **Status:** Accepted
- **Date:** 2025-11-02
- **Context:** Multiple users could edit the same view simultaneously
- **Decision:** Use HTTP If-Match header with file signature (SHA-256 or timestamp)
- **Consequences:**
  - ✅ Prevents silent overwrite of changes
  - ✅ Standard HTTP mechanism
  - ✅ Simple to implement and test
  - ❌ User must reload on conflict (no auto-merge)
- **Alternatives Considered:**
  - Operational Transform - too complex for MVP
  - Lock-based - poor UX, requires session management

### ADR-004: Simulation Canvas Instead of Real Perspective Runtime
- **Status:** Accepted
- **Date:** 2025-11-02
- **Context:** Could attempt to embed real Perspective session or build from scratch
- **Decision:** Build simplified simulation that renders basic properties only
- **Consequences:**
  - ✅ Simpler to implement and maintain
  - ✅ No Perspective session overhead
  - ✅ Faster rendering
  - ❌ Not 100% WYSIWYG
  - ❌ Some properties won't render accurately
  - ❌ Scripts cannot be executed/previewed
- **Alternatives Considered:**
  - Embed Perspective session in iframe - rejected (security, complexity)
  - Use Perspective client API - rejected (not designed for embedding)

## Security Architecture

### Authentication & Authorization
- **Method:** Ignition session-based authentication (cookie)
- **Implementation:**
  - All API requests validated via `gatewayContext.getAuthManager().getUserFromRequest(req)`
  - 401 Unauthorized if no session
  - 403 Forbidden if user lacks "Designer" role or "webdesigner.edit" permission
- **Token Lifetime:** Managed by Ignition Gateway (not controlled by module)
- **Refresh Strategy:** Managed by Ignition Gateway

### Data Protection
- **Encryption at Rest:** Relies on Ignition Gateway configuration (not module responsibility)
- **Encryption in Transit:** HTTPS (enforced at Gateway level)
- **Sensitive Data Handling:** No PII stored; view.json may contain tag paths (not sensitive)
- **Secrets Management:** No secrets stored by module

### Security Measures
1. **Input validation:** All URL parameters sanitized (projectName, resourcePath, tagPath)
2. **Request size limiting:** POST body limited to 1-2 MB
3. **Output encoding:** JSON responses are properly escaped
4. **Audit logging:** All write operations logged with user, IP, timestamp
5. **Dependency scanning:** Regular `./gradlew dependencyCheckAnalyze` and `npm audit`
6. **No eval/exec:** No dynamic code execution in frontend or backend
7. **CORS:** Same-origin policy enforced (module served from same Gateway)

### Security Checklist (Enforced)
- [ ] All API endpoints validate session
- [ ] All API endpoints check authorization
- [ ] All inputs validated and sanitized
- [ ] Request size limits enforced
- [ ] Audit logging on all writes
- [ ] Optimistic concurrency implemented
- [ ] No hardcoded credentials
- [ ] Dependencies kept up-to-date

## Performance Considerations

### Optimization Strategies
- **Caching Strategy:**
  - Static frontend assets served with HTTP cache headers
  - No backend caching (data always fresh from ProjectManager)
- **Database Optimization:** N/A (no database, uses Ignition's ProjectManager)
- **Asset Optimization:**
  - Vite production build: minification, tree-shaking, code splitting
  - CSS-in-JS or CSS modules for scoped styles
- **Lazy Loading:**
  - Tree nodes loaded on-demand (not all tags/views at once)
  - Component palette rendered lazily

### Performance Targets
| Metric | Target | Current |
|--------|--------|---------|
| SPA Initial Load | <3s | TBD |
| API Response Time (GET /view) | <500ms | TBD |
| API Response Time (POST /view) | <1s | TBD |
| Canvas Render Time (50 components) | <100ms | TBD |

## Scalability

### Horizontal Scaling
- **Load Balancing:** Supported if Gateway is load-balanced (stateless API)
- **Session Management:** Handled by Ignition Gateway (sticky sessions or shared session store)
- **File Concurrency:** Handled via optimistic concurrency (If-Match)

### Vertical Scaling
- **Resource Limits:** Depends on Gateway JVM heap
- **Upgrade Path:** Increase Gateway JVM heap size if needed

## Deployment Architecture

### Environments
1. **Development:** Local Ignition Gateway + local Vite dev server (proxy API calls)
2. **Testing:** Test Ignition Gateway with installed .modl
3. **Production:** Production Ignition Gateway with installed .modl

### Infrastructure
- **Hosting:** Installed as module in existing Ignition Gateway (on-premise or cloud)
- **Containerization:** Not applicable (runs inside Ignition Gateway JVM)
- **CI/CD:** GitHub Actions (or similar)
  - Build frontend → Build backend → Assemble .modl → Upload artifact
- **Monitoring:** Ignition Gateway logs + optional external monitoring

### Deployment Process
1. Code pushed to repository
2. CI pipeline runs: `cd frontend && npm ci && npm run build`
3. CI pipeline runs: `./gradlew clean build test`
4. CI pipeline runs: `./gradlew assembleModl`
5. Build artifact (.modl file) uploaded
6. Manual or automated install to Gateway
7. Gateway restart (if required)
8. Verify module loaded in Gateway status page
9. Test basic functionality (browse projects, load view)

## Disaster Recovery

### Backup Strategy
- **Frequency:** On every save (automatic timestamped backup)
- **Retention:** Manual cleanup (or implement scheduled cleanup)
- **Location:** Gateway filesystem: `perspective/views/_backups/`
- **Recovery Time Objective (RTO):** <5 minutes (manual file restore)
- **Recovery Point Objective (RPO):** Last successful save

### Failure Scenarios
1. **Corrupted view.json:** Restore from `_backups/` folder
2. **Module Crash:** Restart Gateway, module reloads
3. **Concurrent Edit Conflict:** User sees 409 error, reloads view, re-applies changes manually

## Monitoring & Observability

### Metrics Collected
- **Application Metrics:**
  - API request counts (per endpoint)
  - API response times
  - Error rates (4xx, 5xx)
- **Audit Metrics:**
  - Saves per user
  - Failed auth attempts
- **Business Metrics:**
  - Active users
  - Views edited per day

### Tools
- **Logging:** Ignition Gateway logs (wrapper.log, console output)
- **Metrics:** Manual log parsing or integration with Gateway metrics (if available)
- **Tracing:** Not implemented in MVP
- **Alerting:** Gateway alarm system (if applicable)

## Future Considerations

### Planned Improvements
1. **Undo/Redo Stack** - Client-side state history (Timeline: Phase 5)
2. **Real-time Collaboration** - WebSocket-based multi-user editing (Timeline: v2.0)
3. **Component Previews** - Better simulation fidelity (Timeline: v1.x)
4. **Script Editing with Monaco** - Syntax highlighting, autocomplete (Timeline: Phase 5)
5. **Custom Component Support** - Better handling of third-party components (Timeline: v1.x)

### Technical Debt
1. **No E2E tests yet** - Priority: High, Timeline: Before v1.0 release
2. **Limited canvas fidelity** - Priority: Medium, Timeline: Incremental improvements
3. **No auto-save** - Priority: Low, Timeline: v1.x

### Potential Risks
1. **Perspective view.json format changes** - Mitigation: Version compatibility checks, schema validation
2. **Large view files (>1MB)** - Mitigation: Implement pagination or lazy rendering if needed
3. **Browser compatibility** - Mitigation: Target modern browsers (Chrome, Firefox, Edge, Safari)

---

**Document Version:** 0.1.0
**Last Updated:** 2025-11-02
**Maintained By:** Project Team
**Review Schedule:** After each major feature addition
