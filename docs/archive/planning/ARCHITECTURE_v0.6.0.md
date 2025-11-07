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
- **Technology:** React 18+, TypeScript, Vite, Zustand, rc-tree
- **Responsibilities:**
  - Render project and tag tree browsers
  - Simulate view canvas with drag-and-drop
  - Provide component palette
  - Render property editor with inline editing support
  - Manage in-memory view state with undo/redo history
  - Serialize/deserialize view.json format
  - Handle save conflicts (409 responses)
  - Support dark mode theming
  - Keyboard shortcuts for common operations
- **Interfaces:**
  - Communicates with backend via axios HTTP client
  - Renders in user's web browser

##### Frontend Sub-Components

**ProjectTree Component** (`ProjectTree.tsx`)
- Loads and displays project hierarchy using rc-tree
- Expands projects to show Perspective views
- Handles view selection and triggers canvas loading
- Integrates with Zustand store for state management

**Canvas Component** (`Canvas.tsx`)
- Main editing surface for view components
- Recursive component rendering with visual hierarchy
- Click-to-select component interaction
- Drag-and-drop zone for components from palette
- Component deletion with confirmation dialogs
- Save button with modification indicator
- Undo/Redo buttons (↶/↷) with disabled states
- Keyboard shortcuts:
  - Ctrl+S / Cmd+S: Save view
  - Ctrl+Z / Cmd+Z: Undo
  - Ctrl+Y / Cmd+Y: Redo
  - Ctrl+Shift+Z: Redo (alternate)
- Loading states and error handling

**PropertyEditor Component** (`PropertyEditor.tsx`)
- Right sidebar for component property inspection and editing
- Displays selected component path and properties
- Click-to-edit inline editing workflow
- Type-aware property parsing:
  - JSON objects/arrays: Detects `{` or `[` and parses
  - Booleans: Converts "true"/"false" to boolean
  - Numbers: Converts numeric strings to numbers
  - Strings: Default fallback
- Save/Cancel actions with keyboard shortcuts (Enter/Escape)
- Multi-line textarea for complex values
- Real-time property updates to Zustand store

**ComponentPalette Component** (`ComponentPalette.tsx`)
- Left sidebar toolbox with draggable Perspective components
- Organized by category (Layout, Input, Display, etc.)
- Collapsible category sections
- HTML5 drag-and-drop API integration
- 11 common Perspective components:
  - Layout: Container, Coordinate Container, Column Container
  - Input: Text Field, Button, Dropdown, Checkbox
  - Display: Label, Image, Power Chart, Table
- Visual feedback on drag/hover

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

2. **Edit Property Flow (Phase 5):**
   - User clicks property value in PropertyEditor
   - PropertyEditor enters edit mode with textarea
   - User modifies value and presses Enter or clicks Save
   - PropertyEditor performs type-aware parsing:
     - Detects JSON syntax and parses objects/arrays
     - Converts "true"/"false" to boolean
     - Converts numeric strings to numbers
     - Falls back to string for other values
   - Zustand action `updateComponentProperty()` is called
   - Store creates deep clone of viewContent
   - Store navigates to component via path (e.g., "root.children[0].children[1]")
   - Store updates property in cloned viewContent
   - Store pushes new state to history stack (max 50 items)
   - Store sets `viewModified: true` and `canUndo: true`
   - Canvas re-renders affected component
   - PropertyEditor updates to show new value
   - Changes remain in-memory (not saved yet)

3. **Add Component Flow (Phase 5):**
   - User drags component from ComponentPalette
   - User drops on target component in Canvas
   - Canvas calls `handleDrop()` with parent path and component type
   - Zustand action `addComponent()` is called
   - Store creates deep clone of viewContent
   - Store navigates to parent component via path
   - Store creates new component object:
     - `type`: Component type (e.g., "ia.input.button")
     - `meta.name`: Generated name (e.g., "Component_1699123456789")
     - `props`: Empty object
   - Store pushes component to parent's children array
   - Store pushes new state to history stack
   - Store sets `viewModified: true` and `canUndo: true`
   - Canvas re-renders with new component

4. **Delete Component Flow (Phase 5):**
   - User clicks delete button (✕) on component in Canvas
   - Browser shows confirmation dialog
   - If confirmed, Canvas calls Zustand action `deleteComponent(path)`
   - Store creates deep clone of viewContent
   - Store navigates to parent component
   - Store removes component from parent's children array
   - Store pushes new state to history stack
   - Store clears selected component
   - Store sets `viewModified: true` and `canUndo: true`
   - Canvas re-renders without deleted component

5. **Undo Flow (Phase 6):**
   - User presses Ctrl+Z or clicks Undo button (↶)
   - Canvas calls Zustand action `undo()`
   - Store checks `historyIndex > 0`
   - Store decrements historyIndex
   - Store retrieves previous ViewContent from history array
   - Store updates viewContent with previous state
   - Store updates flags:
     - `canUndo`: true if historyIndex > 0
     - `canRedo`: true (future states available)
     - `viewModified`: true if historyIndex ≠ 0
   - Canvas re-renders with previous state
   - PropertyEditor updates to show previous component state

6. **Redo Flow (Phase 6):**
   - User presses Ctrl+Y or clicks Redo button (↷)
   - Canvas calls Zustand action `redo()`
   - Store checks `historyIndex < history.length - 1`
   - Store increments historyIndex
   - Store retrieves next ViewContent from history array
   - Store updates viewContent with next state
   - Store updates flags:
     - `canUndo`: true (past states available)
     - `canRedo`: true if historyIndex < history.length - 1
     - `viewModified`: true if historyIndex ≠ 0
   - Canvas re-renders with next state
   - PropertyEditor updates to show next component state

7. **Save View Flow (Phase 5 Enhanced):**
   - User clicks "Save" button or presses Ctrl+S
   - Canvas checks `viewModified` flag
   - Frontend calls Zustand action `saveView()`
   - Store serializes viewContent to view.json format
   - Store calls `PUT /api/v1/projects/{name}/view?path=...`
     - Sends `{ content: viewContent.content }` in body
   - Backend validates auth, reads request body
   - Backend calls ProjectManager to save view (TODO: implementation pending)
   - Backend returns success or error
   - Frontend handles response:
     - Success: Sets `viewModified: false`, `savingView: false`, shows alert
     - Error: Shows error alert, logs to console
   - History stack is preserved (undo/redo still available after save)

8. **Tag Binding Flow:**
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

### History Management System (Phase 6)

The frontend implements a command pattern for undo/redo functionality:

**Data Structure:**
```typescript
interface DesignerState {
  viewContent: ViewContent | null      // Current view state
  history: ViewContent[]               // Array of past states (max 50)
  historyIndex: number                 // Current position in history (-1 = no history)
  canUndo: boolean                     // True if historyIndex > 0
  canRedo: boolean                     // True if historyIndex < history.length - 1
  viewModified: boolean                // True if historyIndex ≠ 0
}
```

**History Operations:**

1. **Initialize History (on view load):**
   - `history = [viewContent]`
   - `historyIndex = 0`
   - `canUndo = false`, `canRedo = false`

2. **Push to History (after mutation):**
   - Discard all future states: `history = history.slice(0, historyIndex + 1)`
   - Append new state: `history.push(newContent)`
   - Limit to 50 items: `history = history.slice(-50)`
   - Update index: `historyIndex = history.length - 1`
   - Set flags: `canUndo = true`, `canRedo = false`

3. **Undo:**
   - Decrement index: `historyIndex--`
   - Load state: `viewContent = history[historyIndex]`
   - Update flags: `canUndo = historyIndex > 0`, `canRedo = true`

4. **Redo:**
   - Increment index: `historyIndex++`
   - Load state: `viewContent = history[historyIndex]`
   - Update flags: `canUndo = true`, `canRedo = historyIndex < history.length - 1`

**Key Implementation Details:**
- Deep clone viewContent before each mutation (via `JSON.parse(JSON.stringify())`)
- Branching history: New edits discard future states
- Memory limit: Maximum 50 states retained
- History persists across save operations
- All mutations (`updateComponentProperty`, `deleteComponent`, `addComponent`) push to history

## Technology Stack

### Core Technologies
| Layer | Technology | Justification |
|-------|------------|---------------|
| Backend | Java 17 | Required for Ignition 8.3+ SDK |
| Build System | Gradle | Official Ignition module build system |
| Frontend Framework | React 18 + TypeScript | Modern, type-safe, widely adopted |
| Build Tool (Frontend) | Vite | Fast dev server, optimized production builds |
| State Management | Zustand | Lightweight, simple, performant |
| Drag & Drop | HTML5 Drag-and-Drop API | Native browser support, no extra dependencies |
| HTTP Client | axios | Interceptor support, easy configuration |
| Tree Component | rc-tree | Performant, feature-rich |

### Dependencies

#### Production Dependencies (Backend):
- **Ignition SDK 8.3+** - Gateway module framework, ProjectManager, TagManager, AuthManager
- **Gson** - JSON serialization (likely already available in Ignition)
- **Jakarta Servlet API** - HTTP request/response handling (jakarta.servlet.*)

#### Production Dependencies (Frontend - Phase 6):
- **react** (^18.2.0) + **react-dom** (^18.2.0) - UI framework
- **zustand** (^4.5.0) - State management with history support
- **rc-tree** (^5.8.0) - Project/tag tree browser
- **axios** (^1.6.0) - HTTP client for API calls

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

### Completed Features
1. ✅ **Undo/Redo Stack** - Client-side state history (Completed: Phase 6 / v0.6.0)
   - Command pattern implementation with history array
   - Maximum 50 states retained
   - Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
   - Visual indicators (↶/↷ buttons with disabled states)
2. ✅ **Property Editing** - Inline editing with type-aware parsing (Completed: Phase 5 / v0.5.0)
3. ✅ **Component Manipulation** - Add/delete components with drag-and-drop (Completed: Phase 5 / v0.5.0)
4. ✅ **View Saving** - Save modified views to backend (Completed: Phase 5 / v0.5.0)

### Planned Improvements
1. **Tag Binding Support** - Drag tags from tree to properties (Timeline: Phase 7)
2. **Real-time Collaboration** - WebSocket-based multi-user editing (Timeline: v2.0)
3. **Component Previews** - Better simulation fidelity (Timeline: v1.x)
4. **Script Editing with Monaco** - Syntax highlighting, autocomplete (Timeline: Phase 8)
5. **Custom Component Support** - Better handling of third-party components (Timeline: v1.x)
6. **Component Registry Introspection** - Dynamic component palette from Gateway (Timeline: v1.x)
7. **Optimistic Concurrency (ETag)** - Implement If-Match headers for conflict detection (Timeline: Phase 7)

### Technical Debt
1. **Backend API Placeholders** - ProjectManager integration not yet implemented
   - Priority: High
   - Timeline: Requires Gateway deployment and testing
   - Affects: GET /projects, GET /views, GET /view, PUT /view
2. **No E2E tests yet** - Priority: High, Timeline: Before v1.0 release
3. **Limited canvas fidelity** - Priority: Medium, Timeline: Incremental improvements
4. **No auto-save** - Priority: Low, Timeline: v1.x
5. **History memory optimization** - Current deep cloning may be inefficient for very large views
   - Priority: Low
   - Timeline: Optimize if performance issues arise

### Potential Risks
1. **Perspective view.json format changes** - Mitigation: Version compatibility checks, schema validation
2. **Large view files (>1MB)** - Mitigation: Implement pagination or lazy rendering if needed
3. **Browser compatibility** - Mitigation: Target modern browsers (Chrome, Firefox, Edge, Safari)

---

**Document Version:** 0.6.0
**Last Updated:** 2025-11-02
**Maintained By:** Project Team
**Review Schedule:** After each major feature addition

**Recent Updates:**
- v0.18.0 (2025-11-07): Updated to reflect session authentication fix, sidebar redesign
- v0.6.0 (2025-11-02): Added Phase 6 undo/redo documentation, history management system
- v0.5.0 (2025-11-02): Added Phase 5 property editing, component manipulation, save workflow
- v0.1.0 (2025-11-02): Initial architecture documentation
