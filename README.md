# Web-Based Ignition Perspective Designer

> A browser-based designer for Ignition Perspective views, enabling web-based development without the native Designer client.

**Version**: 0.5.0 (Phase 5 Complete)
**Status**: Alpha / Active Development
**Target**: Ignition 8.3.0+

---

## Overview

The Web-Based Ignition Perspective Designer is an Ignition Gateway module that provides a complete web-based interface for editing Perspective views. It consists of:

- **Backend**: Java 17 Gateway module (.modl) providing secure REST API
- **Frontend**: React + TypeScript SPA for the designer interface

Users can browse projects, edit view.json files, drag components, bind tags, and save changes - all from a web browser.

## Features

### Implemented (v0.5.0 - Phase 5)
- ✅ Browse Ignition projects and views (API structure ready)
- ✅ Load and display view.json files
- ✅ Component tree rendering on canvas
- ✅ Component selection with property inspector
- ✅ **Edit component properties inline**
- ✅ **Drag-and-drop components from palette to canvas**
- ✅ **Delete components with confirmation**
- ✅ **Save changes back to Gateway (API endpoint ready)**
- ✅ **Modification tracking with visual indicator**
- ✅ Component palette with 11 common Perspective components
- ✅ PropertyEditor with editable fields
- ✅ Three-panel designer layout
- ✅ Dark mode support (VS Code theme)

### Next Up (v0.6.0 - Phase 6)
- ⏳ Undo/Redo functionality
- ⏳ Keyboard shortcuts (Ctrl+S, Delete key)
- ⏳ Tag browser and tag binding
- ⏳ Component search/filter
- ⏳ Property validation

### Future (v1.0+)
- Script editing with Monaco editor
- Optimistic concurrency control
- Custom component support
- Performance optimizations for large views
- Real-time collaborative editing
- WebSocket-based change broadcasting
- Multi-user presence indicators

## Architecture

```
┌──────────────┐
│   Browser    │  React + TypeScript SPA
└──────┬───────┘
       │ HTTPS
       │ /webdesigner/*
       ▼
┌─────────────────────────┐
│  Ignition Gateway       │
│  ┌───────────────────┐  │
│  │ WebDesigner Module│  │  Java 17 + Ignition SDK
│  │  - REST API       │  │
│  │  - Static Server  │  │
│  │  - Auth/Audit     │  │
│  └──────┬────────────┘  │
│         │               │
│  ┌──────▼────────────┐  │
│  │  GatewayContext   │  │
│  │  - ProjectManager │  │
│  │  - TagManager     │  │
│  │  - AuthManager    │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Technology Stack

### Backend
- **Language**: Java 17
- **Framework**: Ignition SDK 8.3+
- **Build**: Gradle 8.x with `io.ia.sdk.modl` plugin
- **Key Libraries**: Ignition SDK APIs (ProjectManager, TagManager, AuthManager)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Drag & Drop**: react-dnd, react-rnd
- **UI Components**: rc-tree, @monaco-editor/react (planned)
- **HTTP Client**: axios

## Project Structure

```
ignition-web-designer/
├── .claude/                    # Claude Code workflow files
│   ├── CLAUDE.md              # AI collaboration instructions
│   ├── WORKFLOW.md            # Development workflow
│   ├── SECURITY_CHECKLIST.md  # Security assessment
│   └── REFACTOR_TRIGGERS.md   # Refactoring guidelines
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md        # System architecture
│   └── [API docs, guides]
├── gateway/                    # Java Gateway module (to be created)
│   ├── build.gradle.kts
│   └── src/
│       ├── main/java/com/me/webdesigner/
│       │   ├── GatewayHook.java
│       │   └── WebDesignerApiHandler.java
│       ├── main/resources/web/  # Frontend dist (copied during build)
│       └── test/
├── frontend/                   # React SPA (to be created)
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── api/               # HTTP client
│       ├── components/        # React components
│       ├── state/             # Zustand store
│       └── utils/
├── CLAUDE.md                  # Main context file for Claude Code
├── VERSION.md                 # Version management
├── CHANGELOG.md               # Change history
├── README.md                  # This file
└── webPerspectiveDetails.md   # Complete project specification
```

## Getting Started

### Prerequisites

- **Java Development Kit (JDK) 17+**
- **Gradle 8.x** (or use wrapper)
- **Node.js 18+** and npm
- **Ignition Gateway 8.3.0+** (for testing)
- **Git** (for version control)

### Initial Setup (In Progress)

This project is in initial setup phase. The following steps are planned:

1. **Create Gradle multi-project structure**
   ```bash
   # Create settings.gradle.kts and build.gradle.kts files
   # Configure gateway and frontend subprojects
   ```

2. **Implement basic Gateway module**
   ```bash
   cd gateway
   # Create GatewayHook.java
   # Implement static file serving
   # Add GET /api/v1/projects endpoint
   ```

3. **Create React frontend**
   ```bash
   cd frontend
   npm create vite@latest . -- --template react-ts
   npm install
   ```

4. **Configure build integration**
   ```bash
   # Configure Gradle to build frontend first
   # Copy frontend/dist to gateway/src/main/resources/web
   ```

5. **Build and install**
   ```bash
   ./gradlew assembleModl
   # Install .modl file to Ignition Gateway
   ```

### Development Workflow

This project uses a structured development workflow. See:
- [.claude/WORKFLOW.md](.claude/WORKFLOW.md) for development checkpoints
- [.claude/CLAUDE.md](.claude/CLAUDE.md) for AI collaboration guidelines
- [VERSION.md](VERSION.md) for versioning strategy

### Building (Future)

```bash
# Build everything (frontend + backend + .modl)
./gradlew assembleModl

# Build frontend only
cd frontend && npm run build

# Build backend only
./gradlew build

# Run tests
./gradlew test
cd frontend && npm test

# Run security scans
./gradlew dependencyCheckAnalyze
cd frontend && npm audit
```

## API Endpoints

All endpoints prefixed with `/webdesigner/api/v1`

### Projects & Views
- `GET /projects` - List all projects
- `GET /projects/{name}/views` - Get view tree for project
- `GET /projects/{name}/view?path=...` - Get view.json content
- `POST /projects/{name}/view?path=...` - Save view.json (requires If-Match header)

### Tags
- `GET /tags` - List tag providers
- `GET /tags/{provider}?path=...` - Browse tag tree

### Components
- `GET /perspective/components` - Get component catalog

All endpoints require:
- Authenticated Ignition session
- "Designer" role or "webdesigner.edit" permission

See [webPerspectiveDetails.md](webPerspectiveDetails.md) for complete API specification.

## Security

Security is a top priority for this project. All development follows:

- **Security-First Workflow**: Pre-checks before implementing features
- **Authentication Required**: All API endpoints validate session
- **Authorization Enforced**: Role-based access control
- **Input Validation**: All user inputs sanitized
- **Audit Logging**: All write operations logged
- **Optimistic Concurrency**: Prevents conflicting edits

See [.claude/SECURITY_CHECKLIST.md](.claude/SECURITY_CHECKLIST.md) for details.

## Development Roadmap

### ✅ Phase 1: Build System (v0.1.0) - COMPLETE
- Gradle multi-project structure
- GatewayHook implementation
- Basic module assembly
- First .modl file generated

### ✅ Phase 2: Backend API Structure (v0.2.0) - COMPLETE
- GET /api/v1/projects endpoint
- GET /api/v1/projects/{name}/views endpoint
- GET /api/v1/projects/{name}/view endpoint
- Placeholder implementations (ready for Gateway testing)

### ✅ Phase 3: Frontend Foundation (v0.3.0) - COMPLETE
- React + TypeScript setup
- Zustand state management
- ProjectTree component with rc-tree
- Canvas component with empty state
- Two-panel layout

### ✅ Phase 4: Three-Panel Designer (v0.4.0) - COMPLETE
- PropertyEditor component (right sidebar)
- ComponentPalette component (left sidebar)
- View content loading from API
- Component tree rendering
- Component selection workflow

### ✅ Phase 5: Full Editing (v0.5.0) - COMPLETE
- **Property editing with inline inputs**
- **Drag-and-drop from palette to canvas**
- **Component deletion with confirmation**
- **View saving with PUT endpoint**
- **Modification tracking with visual indicator**
- Type-aware property parsing

### 🚧 Phase 6: Enhanced UX (v0.6.0) - IN PROGRESS
- Undo/Redo functionality
- Keyboard shortcuts (Ctrl+S, Delete)
- Tag browser
- Component search/filter
- Property validation

### 📋 Phase 7: Tag Binding (v0.7.0) - PLANNED
- Tag provider listing
- Tag browser UI
- Drag-and-drop tag binding
- Binding editor

### 📋 Phase 8: MVP Release (v1.0.0) - PLANNED
- Complete ProjectManager API integration
- Security audit
- Performance optimization
- Production-ready

See [VERSION.md](VERSION.md) for detailed version planning.

## Contributing

This project follows structured development practices:

1. **Read workflow documents** in `.claude/` directory
2. **Follow security checklist** for all changes
3. **Update documentation** with code changes
4. **Increment version** appropriately
5. **Run tests** before committing
6. **Update CHANGELOG** with changes

For AI-assisted development, see [.claude/CLAUDE.md](.claude/CLAUDE.md).

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Main context file for Claude Code sessions
- **[.claude/CLAUDE.md](.claude/CLAUDE.md)** - AI collaboration instructions
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture
- **[webPerspectiveDetails.md](webPerspectiveDetails.md)** - Complete specification
- **[VERSION.md](VERSION.md)** - Version management
- **[CHANGELOG.md](CHANGELOG.md)** - Change history

## Known Limitations

- **Not a full Perspective runtime**: This is a simulation, not 100% WYSIWYG
- **No script execution**: Scripts stored as strings, edited but not previewed
- **Custom components**: May require fallback rendering
- **Large views**: May need optimization for 1000+ components

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed limitations.

## License

[To Be Determined]

## Support

This is an active development project. For issues, questions, or contributions:
- Review documentation in `docs/` and `.claude/`
- Check [CHANGELOG.md](CHANGELOG.md) for recent changes
- See [VERSION.md](VERSION.md) for roadmap

## Quick Start

### Building the Module

```bash
./gradlew clean zipModule
```

Output: `build/Web-Designer.unsigned.modl` (~379K)

### Installing to Gateway

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions including:
- Installation steps
- Configuration requirements
- API integration guide
- Troubleshooting

### Accessing the Designer

After installation, navigate to:
```
http://your-gateway:8088/res/webdesigner/
```

---

**Version**: 0.5.0 (Phase 5 Complete)
**Last Updated**: 2025-11-02
**Status**: Alpha - Full Editing Capabilities Implemented
**Next Milestone**: v0.6.0 - Enhanced UX (Undo/Redo, Keyboard Shortcuts)

Built with Claude Code following structured development workflow.
