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
