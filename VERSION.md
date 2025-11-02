# Version Management

## Current Version: 0.6.0

**Status**: Active Development / Phase 6 Complete

## Version History
See CHANGELOG.md for detailed history

## Versioning Strategy

### Increment Rules
- **PATCH (x.x.X)**: Bug fixes, documentation, minor updates
- **MINOR (x.X.x)**: New features, significant improvements
- **MAJOR (X.x.x)**: Breaking changes, architectural shifts

### Pre-1.0 Development
During initial development (0.x.x versions):
- Breaking changes may occur in MINOR versions
- PATCH versions for bug fixes and incremental progress
- Version 1.0.0 will signify MVP completion and production readiness

### Version Locations
Update version in these files when bumping:
- [ ] VERSION.md (this file)
- [ ] gateway/build.gradle.kts (module version)
- [ ] frontend/package.json (frontend version)
- [ ] README.md (badge or mentioned version)
- [ ] CHANGELOG.md (new entry)

### Release Checklist
- [ ] All tests passing (backend and frontend)
- [ ] Security scan clean (./gradlew dependencyCheckAnalyze && npm audit)
- [ ] Documentation updated (README, ARCHITECTURE, API docs)
- [ ] CHANGELOG entry added
- [ ] Version bumped appropriately in all files
- [ ] Git tag created (e.g., v0.1.0)
- [ ] Build artifacts created (./gradlew assembleModl)
- [ ] .modl file tested on clean Gateway

## Completed Versions

### v0.1.0 - Initial Setup ✅
- [x] Project structure established
- [x] Workflow system integrated
- [x] Documentation framework created
- [x] Gradle multi-project structure
- [x] Basic GatewayHook implementation
- [x] Placeholder frontend
- [x] End-to-end build working

### v0.2.0 - Backend Read API ✅
- [x] GET /api/v1/projects endpoint
- [x] GET /api/v1/projects/{name}/views endpoint
- [x] GET /api/v1/projects/{name}/view endpoint
- [x] GET /api/v1/tags endpoint
- [x] GET /api/v1/tags/{provider} endpoint
- [x] Authentication/authorization structure on all endpoints
- [x] Static file serving configured

### v0.3.0 - Frontend Skeleton ✅
- [x] React + TypeScript + Vite project setup
- [x] ProjectTree component with rc-tree
- [x] Canvas component with layout
- [x] API client module (axios)
- [x] Basic routing and layout
- [x] Professional dark mode (VS Code inspired)
- [x] Zustand state management

### v0.4.0 - Canvas & PropertyEditor ✅
- [x] Three-panel designer layout
- [x] Canvas component with view rendering
- [x] Component tree rendering
- [x] Component selection workflow
- [x] PropertyEditor component (read-only initially)
- [x] Zustand store with component selection
- [x] View loading and parsing
- [x] ComponentPalette with common Perspective components

### v0.5.0 - Editing & Save Loop ✅
- [x] PUT /api/v1/projects/{name}/view endpoint
- [x] Optimistic concurrency (If-Match/ETag headers)
- [x] Property editing in PropertyEditor (click-to-edit)
- [x] Type-aware property parsing (JSON, boolean, number, string)
- [x] Save button with modification indicator
- [x] Component deletion with confirmation
- [x] Drag-and-drop from ComponentPalette to Canvas
- [x] Audit logging framework

### v0.6.0 - Undo/Redo & Components (Current) ✅
- [x] GET /api/v1/perspective/components endpoint
- [x] Component palette with 11 common components
- [x] Undo/Redo functionality with history management
- [x] Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
- [x] Visual undo/redo indicators (↶/↷ buttons)
- [x] Command pattern for state changes
- [x] Branching history (50-state buffer)
- [x] Complete backend API implementation (with placeholders for Gateway testing)

## Next Planned Versions

### v0.7.0 - Gateway Integration & Testing (Next)
- [ ] Test module on live Ignition 8.3+ Gateway
- [ ] Implement actual ProjectManager API calls
- [ ] Implement actual view resource reading/writing
- [ ] Implement real authentication via Gateway session
- [ ] Implement real audit logging via Gateway AuditManager
- [ ] Tag browsing with real TagManager API
- [ ] Unit tests (backend)
- [ ] Unit tests (frontend)
- [ ] Error handling improvements

### v1.0.0 (MVP Release)
- [ ] All MVP features complete
- [ ] Security audit passed
- [ ] Performance targets met
- [ ] Documentation complete
- [ ] Production-ready build
- [ ] Deployment guide created

### v1.1.0+ (Post-MVP)
- [ ] Script editing with Monaco
- [ ] Custom component support improvements
- [ ] Performance optimizations
- [ ] Additional component simulations

### v2.0.0 (Future - Real-time Collaboration)
- [ ] WebSocket support
- [ ] Multi-user editing
- [ ] Change broadcasting
- [ ] Operational Transform or CRDTs

---

**Current Status:** v0.6.0 - Ready for Gateway Testing
**Last Updated:** 2025-11-03
**Release Cycle:** As features complete (irregular during initial development)
**Next Milestone:** v0.7.0 - Gateway Integration & Live Testing
**Build Status:** ✅ Compiling (384KB .modl file)
**Frontend Status:** ✅ React SPA with full UI (v0.6.0)
**Backend Status:** ✅ API framework complete, needs Gateway testing
