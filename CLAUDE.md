# Web-Based Ignition Perspective Designer - Claude Context

## Project Overview
This project is building a web-based Ignition Perspective Designer that runs entirely in a browser. It consists of:
- **Backend**: Java Gateway Module (.modl) running in Ignition 8.3+
- **Frontend**: React + TypeScript SPA for the designer interface

## Quick Reference

### Project Identity
- **Module ID**: com.me.webdesigner
- **Target Ignition Version**: 8.3.0+
- **Date Created**: 2025-11-02

### Core Objective
Build an Ignition Gateway module that serves a web-based SPA functioning as a lightweight designer for Perspective views. Users can browse projects, edit view.json files, drag components, bind tags, and save changes back to the Gateway - all from a web browser.

## Key Technical Decisions

### Backend (Java)
- **Java Version**: Java 17 (required for Ignition 8.3+)
- **Build System**: Gradle with `io.ia.sdk.modl` plugin
- **Critical Migration**: Using `jakarta.*` namespace instead of `javax.*` (Jakarta EE migration in 8.3+)
- **Key SDK Classes**:
  - `AbstractGatewayModuleHook` - Main module hook
  - `GatewayContext` - Access to Ignition managers
  - `ProjectManager` - Read/write project resources
  - `TagManager` - Browse tags
  - `AuthManager` - User authentication

### Frontend (React + TypeScript)
- **Framework**: React + TypeScript + Vite
- **State Management**: Zustand (lightweight, simple)
- **Drag & Drop**:
  - `react-dnd` - Palette to canvas, tag to property binding
  - `react-rnd` - On-canvas dragging and resizing
- **UI Components**:
  - `rc-tree` - Project and tag browsing
  - `@monaco-editor/react` - Script editing (post-MVP)
- **HTTP Client**: axios with interceptors for auth
- **Styling**: CSS Custom Properties for dark mode theming

## Architecture

### API Endpoints (Base: /webdesigner/api/v1)
All endpoints require authenticated Ignition session and proper permissions.

**Projects & Views**:
- `GET /projects` - List all projects
- `GET /projects/{name}/views` - Get view tree
- `GET /projects/{name}/view?path=...` - Get view.json content
- `POST /projects/{name}/view?path=...` - Save view.json (with optimistic concurrency via If-Match header)

**Tags**:
- `GET /tags` - List tag providers
- `GET /tags/{provider}?path=...` - Browse tag tree

**Components**:
- `GET /perspective/components` - Get component catalog (introspected from Perspective module)

### Internal Data Model
The frontend maintains a simplified view model in Zustand:
```typescript
{
  id: "MainView",
  width: 1200,
  height: 800,
  children: [
    {
      id: "label1",
      type: "ia.display.label",
      props: {
        text: "Hello" // or binding object
      },
      layout: { x: 10, y: 10, w: 200, h: 40 }
    }
  ]
}
```

**Binding Object Structure**:
```typescript
{
  binding: {
    type: "tag",
    path: "[default]PLC1/temp",
    mode: "read"
  }
}
```

## Security Checklist (CRITICAL)
- [ ] All endpoints validate session via `gatewayContext.getAuthManager()`
- [ ] All endpoints check "Designer" role or custom permission
- [ ] Request body size limits (1-2 MB for POST /view)
- [ ] Input validation & sanitization on all parameters
- [ ] Audit logging for all write operations
- [ ] CSRF protection on state-changing requests

## Optimistic Concurrency Control (MUST-HAVE)
Prevents users from overwriting each other's work:
1. GET /view returns ETag header (SHA-256 hash of file content)
2. Frontend stores ETag with view data
3. POST /view includes If-Match header with stored ETag
4. Backend validates If-Match against current file hash
5. 409 Conflict if hashes don't match → user must reload

## MVP Scope
**Phase 1 (Backend Read)**:
- Gradle scaffold, GatewayHook, GET /projects endpoint, static file serving

**Phase 2 (Frontend Skeleton)**:
- React app, ProjectTree, TagTree (read-only browsing)

**Phase 3 (Canvas Basics)**:
- GET /view, Canvas renderer, dark mode, component selection, PropertyEditor (read-only), react-rnd dragging

**Phase 4 (Save Loop)**:
- In-memory property editing, POST /view with optimistic concurrency, Save button

**Phase 5 (Binding & Polish)**:
- react-dnd tag-to-property binding, GET /components, dynamic PropertyEditor, Undo/Redo

## Known Limitations
- **Not a full Perspective runtime**: This is a simulation, not an exact replica
- **No script evaluation**: Scripts stored as strings, edited in Monaco
- **Custom components**: Must handle gracefully with fallback to generic editor
- **Large views**: May need virtualization (post-MVP concern)

## Build Process
```bash
# Multi-project Gradle build
cd frontend && npm ci && npm run build
./gradlew build  # Depends on frontend build, copies dist to gateway resources
./gradlew assembleModl  # Creates .modl file
```

## File Structure
```
/modules/ignition-web-designer/
├── settings.gradle.kts
├── build.gradle.kts (root)
├── gateway/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── java/com/me/webdesigner/
│       │   ├── GatewayHook.java
│       │   └── WebDesignerApiHandler.java
│       └── resources/web/  (frontend dist copied here)
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── api/client.ts
        ├── components/ (Canvas, Palette, PropertyEditor, Trees)
        ├── state/designerStore.ts
        └── utils/viewSerializer.ts
```

## Current Status
- [x] Project brief reviewed
- [ ] Repository initialized
- [ ] Gradle project structure created
- [ ] Backend implementation started
- [ ] Frontend implementation started

## Next Steps
1. Create Gradle multi-project structure
2. Implement GatewayHook with basic routing
3. Create placeholder frontend
4. Establish end-to-end "green" build loop

## References
The complete project specification is in `webPerspectiveDetails.md` (original Word document).
