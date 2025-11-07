# Changelog

All notable changes to the Web-Based Ignition Perspective Designer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- N/A

### Changed
- N/A

### Fixed
- N/A

### Security
- N/A

## [0.20.0] - 2025-11-07

### Added
- Script management API endpoints
- GET /api/v1/projects/{name}/scripts - List all project scripts
- GET /api/v1/projects/{name}/script?path=... - Get specific script content
- PUT /api/v1/projects/{name}/script?path=... - Save script content
- Script endpoint framework with authentication and validation
- Request body size limits (2MB) for script uploads
- Input validation for script paths and project names

### Changed
- Added SCRIPTS_PATTERN and SCRIPT_PATTERN for route matching
- Extended API route logging to include script endpoints
- Backend ready for script resource integration

### Technical Details
- Three script handlers: handleGetScripts, handleGetScript, handlePutScript
- All endpoints require Designer role for write operations
- Framework supports Project Scripts, Gateway Scripts, and Transform Scripts
- JSON request/response format with content field
- Comprehensive error handling (400, 401, 403, 413, 500)

### Notes
Script management endpoints are implemented with full validation and error handling. File I/O integration with project resources is pending - currently returns structured responses indicating endpoint readiness. Framework is in place for future implementation when project resource structure is better understood.

## [0.19.0] - 2025-11-07

### Added
- **MAJOR**: Real view loading from Gateway project files
- **MAJOR**: Real view saving with file persistence
- **MAJOR**: Tag browsing with TagManager API integration
- File system integration for reading/writing view.json files
- Tag provider enumeration and tag tree navigation
- Optimistic concurrency control with ETag validation
- File-based view persistence to Gateway data directory

### Changed
- `handleGetView` now reads actual view.json files from disk
- `handlePutView` now writes changes to project files
- `handleBrowseTags` now uses TagManager.getTagConfigsAsync()
- Backend now accesses Gateway data directory for views
- Tag browsing returns real tag hierarchy with metadata

### Fixed
- View loading no longer returns placeholder content
- View saving now persists changes to Gateway projects
- Tag browsing returns actual tag structure from providers
- Conflict detection prevents concurrent edit overwrites

### Technical Details
- View file path: `{dataDir}/projects/{project}/com.inductiveautomation.perspective/views/{path}/view.json`
- Tag browsing uses `TagProvider.getTagConfigsAsync()` with 30s timeout
- Full ETag validation for optimistic concurrency
- Proper error handling for missing views and providers

### Notes
**CRITICAL UPDATE**: Module now provides REAL functionality for loading and saving Perspective views and browsing Gateway tags. This is a major step towards feature parity with the native Perspective Designer.

## [0.18.0] - 2025-11-07

### Added
- Vertical icon tab sidebar replacing horizontal tabs
- Icon-based navigation for Projects, Components, Tags, Scripts, Queries
- Centralized axios client configuration (`api/axios.ts`)
- `withCredentials: true` in all API requests for session cookie support
- Request/response interceptors for API debugging
- Improved tab label visibility (11px font, 600 weight)

### Fixed
- **CRITICAL**: Session cookies now sent with API requests (fixes "No projects found")
- **CRITICAL**: Tag providers now load correctly (fixes "Failed to load tag providers")
- Full Screen button 404 error resolved with session preservation
- Tab labels in sidebar now more visible and readable

### Changed
- All components now use centralized `apiClient` instead of raw axios
- Sidebar redesigned from horizontal tabs to vertical icon tabs
- ProjectTree.tsx, TagBrowser.tsx, Canvas.tsx, ScriptBrowser.tsx, NamedQueryBrowser.tsx updated with new axios client

### Security
- Session authentication now properly enforced on all frontend API calls
- withCredentials ensures session cookies sent with CORS requests

### Notes
Critical authentication fix. Module now properly authenticates with Gateway and loads projects/tags. Sidebar redesign improves UX with vertical icon navigation.

## [0.13.0 through 0.17.0] - 2025-11-04 to 2025-11-06

### Added (v0.13.0)
- Multi-select components with Ctrl+Click
- Component selection state tracking

### Added (v0.14.0)
- Resize handles for components (8 directions)
- Component resizing with drag handles
- Visual resize feedback

### Added (v0.15.0)
- Grid overlay (20px grid)
- Snap-to-grid functionality
- Grid toggle in View menu

### Added (v0.16.0)
- Component alignment tools (6 directions)
- Align Left/Center/Right
- Align Top/Middle/Bottom
- Alignment toolbar

### Added (v0.17.0)
- MenuBar component with dropdown menus
- File/Edit/View/Tools/Help menus
- Keyboard shortcut indicators in menus
- Canvas zoom and pan capabilities
- Component layout improvements

### Changed
- Canvas enhanced with layout tools
- PropertyEditor UI refinements
- Component selection feedback improved

### Notes
Progressive enhancements adding professional designer features: multi-select, resize, grid alignment, and menu bar navigation.

## [0.12.0] - 2025-11-04

### Added
- ScriptBrowser component with tree navigation
- NamedQueryBrowser component
- Mock data for script and query development
- Script tree organization (Project Scripts, Gateway Scripts, Transform Scripts)
- Query tree organization with folders
- Script and query preview modals
- Drag-and-drop support for scripts and queries

### Changed
- LeftSidebar enhanced with Scripts and Queries tabs
- Tab navigation expanded from 3 to 5 tabs

### Notes
Phase 8 Week 2 complete. Script and query browsers provide UI foundation for Gateway integration.

## [0.11.0] - 2025-11-04

### Added
- Monaco editor integration (@monaco-editor/react 4.6)
- ScriptEditor modal component
- Python syntax highlighting
- Script editing with code completion
- Save/Cancel workflow for scripts
- Dark theme Monaco configuration

### Changed
- Frontend dependencies updated with Monaco editor
- Bundle size increased to support Monaco (97KB module)

### Notes
Phase 8 Week 1 complete. Monaco editor provides professional script editing experience.

## [0.10.0] - 2025-11-04

### Added
- Tag binding support in PropertyEditor
- BindingEditor modal component
- Support for 5 binding types (tag, property, expression, query, transform)
- Transform pipeline editor
- TagBrowser UI component with rc-tree
- Query parameter editing for query bindings
- Drag tags from browser to properties
- Binding preview and validation

### Changed
- PropertyEditor enhanced with binding button for each property
- designerStore extended with binding state management
- BindingEditor with comprehensive binding configuration

### Notes
Phase 7 complete. Tag binding UI provides foundation for connecting components to tags. TagBrowser UI ready for Gateway TagManager integration.

## [0.8.0] - 2025-11-03

### Added
- Enhanced keyboard shortcuts: Copy (Ctrl+C), Cut (Ctrl+X), Paste (Ctrl+V)
- Duplicate component (Ctrl+D)
- Delete key support for component deletion
- Save shortcut (Ctrl+S)
- Keyboard shortcut help dialog
- Clipboard operations for components

### Changed
- Canvas component enhanced with keyboard event handling
- Component operations now accessible via keyboard
- Keyboard shortcut documentation in help menu

### Notes
Enhanced keyboard shortcuts improve designer workflow and productivity.

## [0.7.0 through 0.7.9] - 2025-11-03

### Added (v0.7.0)
- Test endpoint `/data/webdesigner/test` for routing verification
- Complete backend API implementation ready for Gateway testing
- Session authentication testing infrastructure

### Added (v0.7.1 through v0.7.9)
- Multiple iteration rounds on Gateway deployment
- Module signing infrastructure with certificates
- Bug fixes and deployment refinements
- Session preservation improvements
- Gateway integration testing
- Diagnostic JSON responses for troubleshooting

### Changed
- GatewayHook enhanced with diagnostic routes
- WebDesignerApiRoutes refined through testing
- Build process stabilized
- Module signing automated

### Fixed
- Various Gateway deployment issues
- Session handling edge cases
- Route mounting issues
- Authentication flow refinements

### Security
- Module signing with valid certificates (10-year validity)
- Session authentication validated against live Gateway
- Designer role requirement enforced

### Notes
Intensive Gateway integration testing phase. Multiple iterations to ensure module works correctly with live Ignition 8.3+ Gateway. Module signing established for production deployment.

## [0.6.0] - 2025-11-03

### Added
- Undo/Redo functionality with history management system
- Command pattern implementation for state changes
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
- Visual undo/redo indicators (↶/↷ buttons)
- History state management with 50-state buffer
- Deep cloning strategy for immutability
- Branching history (discard future on new edits)
- Comprehensive USER_GUIDE.md documentation
- Updated ARCHITECTURE.md with Phase 5 & 6 details

### Changed
- History management system with historyIndex pointer
- State management enhanced with command tracking

### Notes
Phase 6 milestone achieved. Designer now has full undo/redo support with keyboard shortcuts and visual feedback. Documentation updated comprehensively.

## [0.5.0] - 2025-11-03

### Added
- Property editing with click-to-edit inline workflow
- Type-aware property parsing (JSON, boolean, number, string)
- Save/Cancel actions with keyboard shortcuts (Enter/Escape)
- Drag-and-drop from ComponentPalette to Canvas
- Component deletion with confirmation dialog
- View saving with modification indicator
- 11 common Perspective components in palette
- Components organized by category (Layout, Input, Display)
- HTML5 drag-and-drop integration
- View content persistence to backend

### Changed
- PropertyEditor now supports inline editing
- Canvas enhanced with drag-and-drop zone
- ComponentPalette fully interactive
- Save button shows modification state

### Notes
Phase 5 milestone achieved. Designer now supports full editing workflow: property changes, component addition/deletion, and view persistence.

## [0.4.0] - 2025-11-03

### Added
- Three-panel designer layout (ProjectTree + Canvas + PropertyEditor)
- PropertyEditor component for component inspection
- ComponentPalette with draggable Perspective components
- View content loading from GET /api/v1/projects/{name}/view
- Component tree rendering in Canvas
- Component selection and property inspection workflow
- 11 common Perspective components in palette
- Component categories (Layout, Input, Display)
- Professional dark theme UI throughout

### Changed
- App.tsx enhanced with three-panel layout
- Canvas now renders actual view content
- ProjectTree triggers view loading on selection
- designerStore enhanced with component selection state

### Notes
Phase 4 milestone achieved. Designer UI complete with all major panels. Ready for editing features in Phase 5.

## [0.3.0] - 2025-11-03

### Added
- Full React + TypeScript application setup
- Zustand state management implementation
- ProjectTree component with rc-tree integration
- Canvas component with empty state
- Professional dark theme UI
- API integration with axios
- Main app layout with header and sidebar
- TypeScript type definitions (Project, View, ViewContent, TreeNode)
- Vite configuration with React plugin
- Module build successful (369K)
- Development server with HMR

### Changed
- Upgraded from basic frontend to full React SPA
- Added comprehensive state management
- Professional VS Code-inspired styling

### Notes
Phase 3 milestone achieved. React foundation complete with ProjectTree and Canvas components. Module builds successfully.

## [0.2.0] - 2025-11-02

### Added
- Gradle multi-project structure (gateway + frontend)
- GatewayHook implementation with basic routing
- GET /api/v1/projects endpoint
- Static file serving for frontend
- Frontend build integration with Gradle
- Basic authentication/authorization framework
- Request validation and error handling
- Audit logging structure

### Changed
- Project structure organized into gateway and frontend modules
- Build process integrates frontend compilation

### Security
- Authentication checks on all API endpoints
- Input validation on project name parameters
- Session validation via AuthManager

### Notes
Phase 2 milestone achieved. Backend API foundation complete with read endpoints and security framework.

## [0.1.0] - 2025-11-02

### Added
- Initial project setup
- Documentation framework
- Workflow system integration
- Project brief and specifications
- Development environment configuration

### Notes
This is the initial setup version. No functional code has been implemented yet.
The project structure and development workflow have been established to enable
systematic, secure development of the web-based designer.

---

## Version Format

Each version entry should include:
- Version number and date in [X.Y.Z] - YYYY-MM-DD format
- Sections: Added, Changed, Deprecated, Removed, Fixed, Security
- Clear, concise descriptions of changes
- References to issues/PRs where applicable
- Co-authorship with Claude Code where relevant

## Categories

- **Added** - New features, endpoints, components, or capabilities
- **Changed** - Changes in existing functionality or behavior
- **Deprecated** - Soon-to-be removed features (with timeline)
- **Removed** - Features that have been removed
- **Fixed** - Bug fixes
- **Security** - Vulnerability fixes, security improvements

## Examples for This Project

### Good Entry Example
```markdown
## [0.2.0] - 2025-11-05

### Added
- GET /api/v1/projects endpoint with authentication (#12)
- GET /api/v1/projects/{name}/views endpoint
- Session validation on all API endpoints
- Audit logging for API access attempts
- Gradle multi-project build structure

### Changed
- Updated Ignition SDK dependency to 8.3.2

### Fixed
- Resource path validation now properly handles URL encoding (#15)
- Authentication check no longer throws NPE for missing session

### Security
- All API endpoints now require authenticated Ignition session
- Added request size limits to prevent DoS attacks
- Input validation on project name and resource path parameters
```

### Poor Entry Example (Avoid This)
```markdown
## [0.2.0] - 2025-11-05

### Changed
- Various improvements
- Bug fixes
- Security updates
```

---

**Repository**: [Add repository URL when available]
**Maintainer**: [Add maintainer info]
**Contributing**: See CLAUDE.md for development workflow
