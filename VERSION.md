# Version Management

## Current Version: 0.26.0

**Status**: Active Development / Comprehensive Logging

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
- [ ] build.gradle.kts (module version)
- [ ] frontend/package.json (frontend version)
- [ ] README.md (badge or mentioned version)
- [ ] CHANGELOG.md (new entry)

### Release Checklist
- [ ] All tests passing (backend and frontend)
- [ ] Security scan clean (./gradlew dependencyCheckAnalyze && npm audit)
- [ ] Documentation updated (README, ARCHITECTURE, API docs)
- [ ] CHANGELOG entry added
- [ ] Version bumped appropriately in all files
- [ ] Git tag created (e.g., v0.18.0)
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

### v0.6.0 - Undo/Redo & Components ✅
- [x] GET /api/v1/perspective/components endpoint
- [x] Component palette with 11 common components
- [x] Undo/Redo functionality with history management
- [x] Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
- [x] Visual undo/redo indicators (↶/↷ buttons)
- [x] Command pattern for state changes
- [x] Branching history (50-state buffer)
- [x] Complete backend API implementation

### v0.7.0 through v0.7.9 - Gateway Integration Testing ✅
- [x] Test endpoint for routing verification (/data/webdesigner/test)
- [x] Session authentication testing
- [x] Multiple iteration rounds on Gateway deployment
- [x] Bug fixes and deployment refinements
- [x] Module signing and certificate setup

### v0.8.0 - Enhanced Keyboard Shortcuts ✅
- [x] Copy/Cut/Paste (Ctrl+C/X/V)
- [x] Duplicate (Ctrl+D)
- [x] Delete (Delete key)
- [x] Save (Ctrl+S)
- [x] Keyboard shortcut help dialog

### v0.10.0 - Tag Binding & Browser ✅
- [x] Tag binding support in property editor
- [x] TagBrowser UI component with rc-tree
- [x] Property binding editor modal
- [x] Support for all 5 binding types (tag, property, expression, query, transform)
- [x] Transform pipeline support
- [x] Drag tags from browser to properties

### v0.11.0 - Monaco Script Editor ✅
- [x] Monaco editor integration
- [x] Python syntax highlighting
- [x] ScriptEditor modal component
- [x] Script editing placeholder UI

### v0.12.0 - Script & Query Browsers ✅
- [x] ScriptBrowser component
- [x] NamedQueryBrowser component
- [x] Mock data for development
- [x] Tree-based navigation for scripts and queries

### v0.13.0 through v0.17.0 - Progressive Enhancements ✅
- [x] Multi-select with Ctrl+Click
- [x] Resize handles (8 directions)
- [x] Grid overlay and snap-to-grid
- [x] Alignment tools (6 directions)
- [x] MenuBar with dropdown menus
- [x] Improved component selection UX
- [x] Canvas zoom and pan
- [x] Component layout improvements

### v0.18.0 - Redesigned Sidebar & Session Fix (Current) ✅
- [x] Vertical icon tab sidebar
- [x] Replaced horizontal tabs with icon-based navigation
- [x] Projects, Components, Tags, Scripts, Queries tabs
- [x] Session cookie fix (withCredentials: true)
- [x] Fixed "No projects found" issue
- [x] Fixed "Failed to load tag providers" issue
- [x] Improved tab label visibility
- [x] Centralized axios client configuration

## Next Planned Versions

### v0.19.0 - Real Tag Provider Integration (Next)
- [ ] Implement real Gateway TagManager API calls
- [ ] Browse actual tag providers
- [ ] Display real tag data types and values
- [ ] Test with live Ignition Gateway tags

### v0.20.0 - Real Script Management
- [ ] Integrate with Gateway ScriptManager
- [ ] Load actual project scripts
- [ ] Save script changes to Gateway
- [ ] Support for all script types

### v0.21.0 - Real Named Query Integration
- [ ] Load actual named queries from Gateway
- [ ] Display query parameters
- [ ] Query metadata and database info

### v1.0.0 (MVP Release)
- [ ] All MVP features complete
- [ ] Security audit passed
- [ ] Performance targets met
- [ ] Documentation complete
- [ ] Production-ready build
- [ ] Deployment guide created

### v1.1.0+ (Post-MVP)
- [ ] Advanced script editing features
- [ ] Custom component support improvements
- [ ] Performance optimizations
- [ ] Additional component simulations

### v2.0.0 (Future - Real-time Collaboration)
- [ ] WebSocket support
- [ ] Multi-user editing
- [ ] Change broadcasting
- [ ] Operational Transform or CRDTs

---

**Current Status:** v0.18.0 - Redesigned Sidebar & Session Fix
**Last Updated:** 2025-11-07
**Release Cycle:** As features complete (irregular during initial development)
**Next Milestone:** v0.19.0 - Real Tag Provider Integration
**Build Status:** ✅ Compiling (200KB .modl file)
**Frontend Status:** ✅ React SPA with full UI (webpack 316KB)
**Backend Status:** ✅ API framework complete, session authentication working
