# Version Management

## Current Version: 0.1.0

**Status**: Initial Development / Pre-Alpha

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

## Next Planned Versions

### v0.1.0 (Current - Initial Setup)
- [x] Project structure established
- [x] Workflow system integrated
- [x] Documentation framework created
- [ ] Gradle multi-project structure
- [ ] Basic GatewayHook implementation
- [ ] Placeholder frontend
- [ ] End-to-end build working

### v0.2.0 (Backend Read API)
- [ ] GET /api/v1/projects endpoint
- [ ] GET /api/v1/projects/{name}/views endpoint
- [ ] GET /api/v1/projects/{name}/view endpoint
- [ ] GET /api/v1/tags endpoint
- [ ] GET /api/v1/tags/{provider} endpoint
- [ ] Authentication/authorization on all endpoints
- [ ] Static file serving configured

### v0.3.0 (Frontend Skeleton)
- [ ] React + Vite project setup
- [ ] ProjectTree component
- [ ] TagTree component
- [ ] API client module (axios)
- [ ] Basic routing and layout
- [ ] Dark mode support

### v0.4.0 (Canvas Basics)
- [ ] Canvas component with react-rnd
- [ ] Component simulation rendering
- [ ] Component selection
- [ ] PropertyEditor (read-only)
- [ ] Zustand store setup
- [ ] View loading and parsing

### v0.5.0 (Save Loop)
- [ ] POST /api/v1/projects/{name}/view endpoint
- [ ] Optimistic concurrency (If-Match/ETag)
- [ ] Property editing in PropertyEditor
- [ ] Save button and flow
- [ ] Conflict handling (409 responses)
- [ ] Audit logging

### v0.6.0 (Bindings & Components)
- [ ] GET /api/v1/perspective/components endpoint
- [ ] Tag drag-and-drop to properties
- [ ] Dynamic PropertyEditor based on component metadata
- [ ] Binding visualization
- [ ] Component palette

### v0.7.0 (Polish & Testing)
- [ ] Undo/Redo functionality
- [ ] Unit tests (backend)
- [ ] Unit tests (frontend)
- [ ] E2E tests (Cypress)
- [ ] Error handling improvements
- [ ] UX polish

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

**Last Release Date:** N/A (in development)
**Release Cycle:** As features complete (irregular during initial development)
**Next Milestone:** v0.1.0 - Initial Setup Complete
**Target Date:** 2025-11-03
