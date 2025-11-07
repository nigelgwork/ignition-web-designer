# Web-Based Ignition Perspective Designer - Requirements

**Original Specification:** docs/archive/original-spec/webPerspectiveDetails.md (236KB Microsoft Word document, archived 2025-11-07)
**Current Version:** 0.20.0 (Script Management Endpoints)
**Target Platform:** Ignition 8.3.0+

---

## Project Vision

Create a browser-based Ignition Perspective Designer that runs entirely in a web browser, enabling users to:
- Browse Ignition projects and views
- Edit view.json files with visual editing tools
- Drag components, bind tags, write scripts
- Save changes back to the Gateway
- Match the UX/UI of the native Perspective Designer

## Core Requirements

### 1. User Experience
**Must match native Perspective Designer interface:**
- Three-panel layout (left: resources | center: canvas | right: properties)
- Component palette with drag-and-drop
- Property editor with inline editing
- Tag browser with real-time data
- Script editor with syntax highlighting
- Named query browser

**Must support standard designer operations:**
- Component selection (single and multi-select)
- Copy/paste/duplicate
- Undo/redo with history
- Alignment tools
- Keyboard shortcuts
- Grid and snap-to-grid
- Z-order management

### 2. Functional Requirements

**View Management:**
- FR-1: Load view.json files from Gateway project directories
- FR-2: Parse and render Perspective view structure on canvas
- FR-3: Save modified views back to Gateway with optimistic concurrency (ETags)
- FR-4: Support all Perspective container types (Coordinate, Flex, Column, Tab, Breakpoint)

**Component Manipulation:**
- FR-5: Drag components from palette to canvas
- FR-6: Edit component properties inline with type-aware parsing
- FR-7: Support multi-select operations (Ctrl+Click)
- FR-8: Resize components with handles
- FR-9: Align components (6 directions: top, bottom, left, right, center, middle)
- FR-10: Delete components with confirmation

**Property Binding System (CRITICAL):**
- FR-11: Support all 5 binding types:
  - Tag binding (direct, indirect, expression)
  - Property binding (component-to-component)
  - Expression binding (formula language)
  - Expression structure binding (complex objects)
  - Query binding (named queries)
- FR-12: Support binding transforms (Map, Format, Script)
- FR-13: Visual binding indicators and editor UI

**Tag Integration:**
- FR-14: Browse tag providers via Gateway TagManager API
- FR-15: Navigate tag hierarchy
- FR-16: Drag tags to properties for binding
- FR-17: Display tag data types and current values (real-time)

**Script Management:**
- FR-18: Edit component event handlers (Python/Jython)
- FR-19: Load/save project scripts
- FR-20: Syntax highlighting and basic autocomplete
- FR-21: Support session event scripts

**Named Queries:**
- FR-22: Browse named queries from Gateway
- FR-23: Display query parameters and metadata
- FR-24: Support query bindings in properties

### 3. Technical Requirements

**Backend (Java Gateway Module):**
- TR-1: Java 17 with Ignition SDK 8.3+
- TR-2: RESTful API at `/data/webdesigner/*`
- TR-3: Session-based authentication (verify Designer role or custom permission)
- TR-4: Optimistic concurrency with If-Match/ETag headers
- TR-5: Audit logging for all write operations (username, resource, IP, timestamp)
- TR-6: Static file serving for React SPA
- TR-7: Module ID: `com.me.webdesigner`

**Frontend (React SPA):**
- TR-8: React 18+ with TypeScript 5+
- TR-9: Zustand state management
- TR-10: Monaco editor for script editing
- TR-11: rc-tree for hierarchical navigation
- TR-12: Dark theme (VS Code inspired)
- TR-13: Session cookie preservation (withCredentials: true)

**Performance:**
- TR-14: Support views with 100+ components without lag
- TR-15: Canvas rendering at 60 FPS
- TR-16: API response time < 500ms for typical operations
- TR-17: Module bundle size < 500KB (.modl file)

### 4. Security Requirements (NON-NEGOTIABLE)

**Authentication:**
- SR-1: All API endpoints MUST validate session via GatewayContext.getAuthManager()
- SR-2: Return 401 Unauthorized if no authenticated user
- SR-3: Verify Designer role or custom `webdesigner.edit` permission
- SR-4: Return 403 Forbidden if unauthorized

**Input Validation:**
- SR-5: Validate all URL parameters (project name, view path, resource IDs)
- SR-6: Sanitize user inputs to prevent XSS
- SR-7: Limit request body size (2MB max for view JSON)
- SR-8: Validate view JSON structure before saving

**Audit Logging:**
- SR-9: Log all write operations (create, update, delete)
- SR-10: Include username, resource path, client IP, timestamp, success/failure
- SR-11: Store audit logs in Gateway audit system

**Concurrency:**
- SR-12: POST /view MUST require If-Match header with file signature
- SR-13: Validate If-Match against current file state
- SR-14: Return 409 Conflict if mismatch (prevent overwrite)

### 5. API Endpoints (Current Implementation)

**Project & View Management:**
- `GET /api/v1/projects` - List all projects
- `GET /api/v1/projects/{name}/views` - List views in project
- `GET /api/v1/projects/{name}/view?path={viewPath}` - Load view JSON
- `PUT /api/v1/projects/{name}/view?path={viewPath}` - Save view JSON

**Tag Management:**
- `GET /api/v1/tags` - List tag providers
- `GET /api/v1/tags/{provider}` - Browse tags in provider
- `GET /api/v1/tags/{provider}?path={tagPath}` - Get specific tag

**Component Metadata:**
- `GET /api/v1/perspective/components` - List available component types

**Script Management (v0.20.0):**
- `GET /api/v1/scripts` - List project scripts
- `PUT /api/v1/scripts/{path}` - Save script

**Named Queries:**
- `GET /api/v1/queries` - List named queries
- `GET /api/v1/queries/{name}` - Get query definition

### 6. MVP Definition (Version 1.0.0)

**Must Have for MVP:**
1. Load and save views with real Gateway integration
2. Full property binding system (all 5 types + transforms)
3. Tag browser with real-time data
4. Script editor with save functionality
5. Component palette with common Perspective components
6. Standard editing operations (select, copy, paste, delete, undo, redo)
7. Property editor with type-aware editing
8. Security audit passed
9. Documentation complete

**Nice to Have (Post-MVP):**
- Advanced script debugging
- Custom component support improvements
- Real-time collaborative editing (v2.0)
- Performance optimizations for 1000+ component views
- Component search/filter
- View templates and snippets

## Success Criteria

The project is considered successful when:
1. Users can perform all common view editing tasks from a web browser
2. UX matches native Perspective Designer (familiar to existing users)
3. All security requirements met (authentication, authorization, audit logging)
4. Performance targets achieved (60 FPS canvas, <500ms API responses)
5. Module installs cleanly on Ignition Gateway 8.3+
6. Documentation enables new developers to contribute

---

**For Original Specification:** See `/home/user/ignition-web-designer/docs/archive/original-spec/webPerspectiveDetails.md` (Microsoft Word document)

**For Architecture Details:** See `/home/user/ignition-web-designer/docs/ARCHITECTURE.md`

**For Current Status:** See `/home/user/ignition-web-designer/VERSION.md`

**Last Updated:** 2025-11-07
