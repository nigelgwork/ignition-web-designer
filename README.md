# Web-Based Ignition Perspective Designer

> A browser-based designer for Ignition Perspective views, enabling web-based development without the native Designer client.

**Version**: 0.1.0 (Initial Development)
**Status**: Pre-Alpha / Active Development
**Target**: Ignition 8.3.0+

---

## Overview

The Web-Based Ignition Perspective Designer is an Ignition Gateway module that provides a complete web-based interface for editing Perspective views. It consists of:

- **Backend**: Java 17 Gateway module (.modl) providing secure REST API
- **Frontend**: React + TypeScript SPA for the designer interface

Users can browse projects, edit view.json files, drag components, bind tags, and save changes - all from a web browser.

## Features (Planned)

### MVP (v1.0.0)
- ✅ Browse Ignition projects and views
- ✅ Load and display view.json files
- ✅ Simulate view rendering on canvas
- ✅ Edit component properties
- ✅ Drag components to position/resize
- ✅ Drag tags to create bindings
- ✅ Save changes back to Gateway
- ✅ Optimistic concurrency control
- ✅ Dark mode support

### Post-MVP (v1.x+)
- Script editing with Monaco editor
- Undo/Redo functionality
- Component palette with search
- Custom component support
- Performance optimizations

### Future (v2.0+)
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

### Phase 1: Backend Read (v0.2.0)
- Gradle scaffold
- GatewayHook implementation
- GET endpoints for projects, views, tags
- Static file serving

### Phase 2: Frontend Skeleton (v0.3.0)
- React app setup
- Project and tag browsers
- Basic layout and routing

### Phase 3: Canvas Basics (v0.4.0)
- View loading and parsing
- Canvas rendering
- Component selection
- Property editor (read-only)

### Phase 4: Save Loop (v0.5.0)
- Property editing
- POST endpoint with concurrency control
- Save functionality
- Conflict handling

### Phase 5: Bindings & Polish (v0.6.0-v0.7.0)
- Tag drag-and-drop
- Component palette
- Undo/Redo
- Testing and polish

### Phase 6: MVP Release (v1.0.0)
- Complete testing
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

---

**Version**: 0.1.0
**Last Updated**: 2025-11-02
**Status**: Initial Setup Complete
**Next Milestone**: v0.2.0 - Backend Read API

Built with Claude Code following structured development workflow.
