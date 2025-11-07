# Web-Based Ignition Perspective Designer

> A browser-based designer for Ignition Perspective views, enabling web-based development without the native Designer client.

**Version**: 0.19.0
**Status**: Alpha / Active Development
**Target**: Ignition 8.3.0+

[![Module Status](https://img.shields.io/badge/status-alpha-yellow.svg)](VERSION.md)
[![Version](https://img.shields.io/badge/version-0.19.0-blue.svg)](VERSION.md)
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)](#building-the-module)

---

## Overview

The Web-Based Ignition Perspective Designer is an Ignition Gateway module that provides a complete web-based interface for editing Perspective views. It consists of:

- **Backend**: Java 17 Gateway module (.modl) providing secure REST API
- **Frontend**: React + TypeScript SPA for the designer interface

Users can browse projects, edit view.json files, drag components, bind tags (UI complete), manage scripts, and save changes - all from a web browser.

## Features

### ✅ Implemented (v0.19.0)

**Core Functionality**:
- ✅ **Browse Ignition projects and views** (from real Gateway)
- ✅ **Load actual view.json files** (from project directories)
- ✅ **Save changes to view files** (with persistence)
- ✅ **Browse tag providers and tags** (via TagManager API)
- ✅ Component tree rendering on canvas
- ✅ Component selection with property inspector
- ✅ Edit component properties inline (click-to-edit)
- ✅ Save changes back to Gateway with optimistic concurrency
- ✅ Modification tracking with visual indicator

**Component Management**:
- ✅ Component palette with 11 common Perspective components
- ✅ Drag-and-drop components from palette to canvas
- ✅ Delete components with confirmation
- ✅ Multi-select components (Ctrl+Click)
- ✅ Resize handles (8 directions with snap-to-grid)
- ✅ Copy/Cut/Paste/Duplicate clipboard operations
- ✅ Component alignment tools (6 directions)

**User Interface**:
- ✅ Three-panel designer layout (Projects/Components | Canvas | Properties)
- ✅ Vertical icon tab sidebar (Projects, Components, Tags, Scripts, Queries)
- ✅ MenuBar with dropdown menus (File/Edit/View/Tools/Help)
- ✅ Grid overlay (20px) and snap-to-grid
- ✅ Dark theme support (VS Code inspired)
- ✅ Session preservation for authentication

**Advanced Features**:
- ✅ Undo/Redo with command pattern (50-state history)
- ✅ Keyboard shortcuts (Ctrl+Z/Y, Ctrl+C/X/V/D, Ctrl+S, Delete)
- ✅ Tag binding UI (BindingEditor modal with 5 binding types)
- ✅ TagBrowser component with rc-tree (API needs Gateway integration)
- ✅ ScriptBrowser with Monaco editor integration
- ✅ NamedQueryBrowser component
- ✅ Property binding editor (tag, property, expression, query, transform)

### ⏳ Next Up (v0.19.0+)

**Gateway Integration**:
- ⏳ Real tag provider integration (TagManager API)
- ⏳ Real script loading/saving (ScriptManager API)
- ⏳ Real named query integration
- ⏳ Project resource validation

**Enhanced Functionality**:
- ⏳ Component search/filter
- ⏳ Property validation and type checking
- ⏳ View templates
- ⏳ Component snippets/favorites

### 📋 Future (v1.0+)

- Custom component support improvements
- Performance optimizations for large views (1000+ components)
- Real-time collaborative editing
- WebSocket-based change broadcasting
- Multi-user presence indicators
- Advanced script debugging
- View diff/merge tools

## Architecture

```
┌──────────────┐
│   Browser    │  React 18 + TypeScript SPA
└──────┬───────┘  - Zustand state management
       │          - rc-tree for trees
       │          - Monaco editor for scripts
       │ HTTPS
       │ /data/webdesigner/*
       ▼
┌─────────────────────────┐
│  Ignition Gateway       │
│  ┌───────────────────┐  │
│  │ WebDesigner Module│  │  Java 17 + Ignition SDK 8.3+
│  │  - REST API       │  │  - Session-based auth
│  │  - Static Server  │  │  - ETag concurrency
│  │  - Auth/Audit     │  │  - Audit logging
│  └──────┬────────────┘  │
│         │               │
│  ┌──────▼────────────┐  │
│  │  GatewayContext   │  │
│  │  - ProjectManager │  │  Ignition Gateway APIs
│  │  - TagManager     │  │  (for future integration)
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
- **Security**: Session-based authentication with Designer role requirement

### Frontend
- **Framework**: React 18.2 + TypeScript 5.3
- **Build Tool**: Webpack 5 (via custom config)
- **State Management**: Zustand 4.5
- **UI Components**:
  - rc-tree 5.8 (project/tag/script trees)
  - @monaco-editor/react 4.6 (script editor)
  - react-rnd (component resize/drag)
- **HTTP Client**: axios 1.6 (with withCredentials for session cookies)
- **Styling**: CSS with dark theme (VS Code inspired)

## Project Structure

```
ignition-web-designer/
├── .claude/                    # Claude Code workflow files
│   ├── CLAUDE.md              # AI collaboration instructions
│   ├── WORKFLOW.md            # Development workflow
│   ├── SECURITY_CHECKLIST.md  # Security assessment
│   └── REFACTOR_TRIGGERS.md   # Refactoring guidelines
│
├── docs/                       # Documentation
│   ├── API.md                 # Complete REST API reference
│   ├── ARCHITECTURE.md        # System architecture
│   ├── DEVELOPMENT.md         # Developer setup guide
│   ├── SECURITY.md            # Security documentation
│   ├── USER_GUIDE.md          # User guide
│   ├── PERSPECTIVE_DESIGNER_UI_RESEARCH.md  # Research notes
│   └── archive/               # Historical documents
│       ├── sessions/          # Session summaries
│       ├── planning/          # Old planning docs
│       └── deprecated/        # Obsolete files
│
├── gateway/                    # Java Gateway module
│   ├── build.gradle.kts       # Gateway build configuration
│   └── src/
│       ├── main/java/com/me/webdesigner/
│       │   ├── GatewayHook.java            # Main module hook
│       │   └── WebDesignerApiRoutes.java   # REST API endpoints
│       ├── main/resources/
│       │   ├── module.xml                   # Module metadata
│       │   └── web/                         # Frontend dist (copied during build)
│       └── test/
│
├── frontend/                   # React SPA
│   ├── package.json           # npm dependencies
│   ├── webpack.config.js      # Webpack bundler config
│   ├── tsconfig.json          # TypeScript config
│   └── src/
│       ├── main.tsx                    # React app entry point
│       ├── standalone.tsx              # Standalone mode entry
│       ├── App.tsx                     # Main app component
│       ├── api/axios.ts                # API client (withCredentials)
│       ├── components/                 # React components
│       │   ├── Canvas.tsx
│       │   ├── PropertyEditor.tsx
│       │   ├── ComponentPalette.tsx
│       │   ├── BindingEditor.tsx
│       │   ├── TagBrowser.tsx
│       │   ├── ScriptBrowser.tsx
│       │   ├── ScriptEditor.tsx
│       │   ├── NamedQueryBrowser.tsx
│       │   └── ...
│       ├── store/designerStore.ts      # Zustand state management
│       ├── styles/                     # CSS files
│       └── types/index.ts              # TypeScript type definitions
│
├── build/                          # Build output
│   └── Web-Designer-0.18.0.modl   # Signed module file (~200KB)
│
├── README.md                  # This file
├── VERSION.md                 # Version management
├── CHANGELOG.md               # Change history
├── ROADMAP.md                 # Future plans
├── DEPLOYMENT.md              # Deployment guide
├── ACCESS_INSTRUCTIONS.md     # Access guide
└── webPerspectiveDetails.md   # Complete project specification
```

## Getting Started

### Prerequisites

- **Java Development Kit (JDK) 17+**
- **Node.js 18+** and npm 9+
- **Ignition Gateway 8.3.0+** (for runtime/testing)
- **Git** (for version control)

### Quick Start

#### 1. Clone Repository

```bash
git clone <repository-url>
cd ignition-web-designer
```

#### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

#### 3. Build Module

```bash
# Build everything (frontend + backend + signed .modl)
./gradlew clean zipModule signModule

# Output: build/Web-Designer-0.18.0.modl (~200KB)
```

#### 4. Install to Gateway

```bash
# Copy to Gateway modules directory
cp build/Web-Designer-0.18.0.modl \
   /path/to/ignition/data/var/ignition/modl/

# Restart Gateway or use Module Commissioning in Gateway webpage
```

#### 5. Access Designer

1. Login to Gateway: `http://gateway:8088/web/home`
2. Navigate to: `http://gateway:8088/data/webdesigner/`
3. Or use standalone mode: `http://gateway:8088/data/webdesigner/standalone`

See [ACCESS_INSTRUCTIONS.md](ACCESS_INSTRUCTIONS.md) and [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Development Workflow

For development with hot-reload:

```bash
# Terminal 1: Start Vite dev server (frontend)
cd frontend
npm run dev
# Dev server at http://localhost:5173 with HMR

# Terminal 2: Build and deploy module (backend changes)
./gradlew clean zipModule signModule
cp build/Web-Designer-0.18.0.modl /path/to/ignition/.../modl/
# Restart Gateway
```

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for complete development guide.

## Building the Module

### Full Build

```bash
# Clean + build frontend + build backend + package module
./gradlew clean build

# Build and sign module
./gradlew zipModule signModule
```

### Frontend Only

```bash
cd frontend

# Development build (with source maps)
npm run build

# Production build (minified)
npm run build:prod

# Watch mode (rebuild on change)
npm run watch
```

### Backend Only

```bash
# Compile Java
./gradlew compileJava

# Build JAR
./gradlew gateway:jar

# Package module (includes pre-built frontend)
./gradlew zipModule
```

### Module Signing

Requires `sign.props` file with keystore credentials:

```bash
./gradlew signModule
```

See [docs/DEVELOPMENT.md#module-signing](docs/DEVELOPMENT.md#module-signing) for setup instructions.

## API Endpoints

All endpoints require authenticated Ignition session with Designer role.

**Base URL**: `/data/webdesigner/api/v1`

### Projects & Views
- `GET /projects` - List all Perspective projects
- `GET /projects/{name}/views` - Get view tree for project
- `GET /projects/{name}/view?path=...` - Get view.json content (with ETag)
- `PUT /projects/{name}/view?path=...` - Save view.json (requires If-Match header)

### Tags
- `GET /tags` - List tag providers
- `GET /tags/{provider}?path=...` - Browse tag tree hierarchy

### Components
- `GET /perspective/components` - Get component catalog

### Authentication
- All endpoints use Ignition Gateway session cookies
- Frontend uses `withCredentials: true` in axios configuration
- Unauthorized requests return `401 Unauthorized`
- Forbidden requests return `403 Forbidden`

See [docs/API.md](docs/API.md) for complete API documentation with request/response examples.

## Security

Security is a top priority for this project.

### Security Features

- ✅ **Session Authentication**: All API endpoints validate Ignition Gateway session
- ✅ **Role-Based Authorization**: Requires Designer role
- ✅ **Input Validation**: All user inputs sanitized (project names, paths, content)
- ✅ **Optimistic Concurrency**: ETag-based concurrency control prevents overwriting
- ✅ **Audit Logging**: All write operations logged with username, timestamp, IP
- ✅ **Request Size Limits**: 2MB max for view content
- ✅ **Path Traversal Protection**: Sanitization of file paths
- ✅ **Session Cookie Security**: HttpOnly cookies, HTTPS recommended

### Security Checklist

Every API endpoint has been audited for:
- [ ] Authentication (session validation)
- [ ] Authorization (Designer role check)
- [ ] Input validation (sanitization)
- [ ] Output encoding (JSON escaping)
- [ ] Rate limiting (planned for v0.19.0)
- [ ] Audit logging (write operations)
- [ ] Error handling (no sensitive data leaks)

See [docs/SECURITY.md](docs/SECURITY.md) for comprehensive security documentation including threat model, attack vectors, and mitigation strategies.

## Testing

### Frontend Tests

```bash
cd frontend
npm test                 # Run Jest tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Backend Tests

```bash
./gradlew test                              # Run JUnit tests
./gradlew test --tests WebDesignerApiRoutesTest  # Specific test
./gradlew jacocoTestReport                  # Coverage report
```

### Security Scans

```bash
# Backend dependency scan
./gradlew dependencyCheckAnalyze

# Frontend dependency scan
cd frontend && npm audit
```

## Documentation

### For Users
- **[ACCESS_INSTRUCTIONS.md](ACCESS_INSTRUCTIONS.md)** - How to access the Web Designer
- **[docs/USER_GUIDE.md](docs/USER_GUIDE.md)** - Complete user guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment instructions

### For Developers
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Developer setup and workflow
- **[docs/API.md](docs/API.md)** - Complete REST API reference
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture
- **[docs/SECURITY.md](docs/SECURITY.md)** - Security documentation
- **[VERSION.md](VERSION.md)** - Version management and history
- **[CHANGELOG.md](CHANGELOG.md)** - Change history

### For AI Development
- **[.claude/CLAUDE.md](.claude/CLAUDE.md)** - AI collaboration instructions
- **[.claude/WORKFLOW.md](.claude/WORKFLOW.md)** - Development workflow
- **[.claude/SECURITY_CHECKLIST.md](.claude/SECURITY_CHECKLIST.md)** - Security checklist
- **[.claude/REFACTOR_TRIGGERS.md](.claude/REFACTOR_TRIGGERS.md)** - Refactoring guidelines

### Project Planning
- **[ROADMAP.md](ROADMAP.md)** - Future plans and priorities
- **[webPerspectiveDetails.md](webPerspectiveDetails.md)** - Complete original specification

## Known Limitations

- **Not a full Perspective runtime**: This is a designer simulation, not 100% WYSIWYG
- **Component rendering**: Placeholder rendering, not actual Perspective components
- **No script execution**: Scripts edited but not executed/previewed
- **Custom components**: May require fallback rendering or manual editing
- **Tag browsing**: UI complete, but requires Gateway TagManager API integration
- **Script management**: UI complete, but requires Gateway ScriptManager API integration
- **Performance**: Not optimized for extremely large views (1000+ components)

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed technical limitations.

## Development Roadmap

### ✅ Phases 1-6 Complete (v0.1.0 - v0.18.0)

- ✅ **Phase 1**: Build system and module structure
- ✅ **Phase 2**: Backend API structure with placeholder implementations
- ✅ **Phase 3**: Frontend foundation (React + Zustand + basic layout)
- ✅ **Phase 4**: Three-panel designer with component palette
- ✅ **Phase 5**: Full editing (property editing, drag-drop, save)
- ✅ **Phase 6**: Enhanced UX (undo/redo, keyboard shortcuts)

### ✅ Additional Features (v0.7.0 - v0.18.0)

- ✅ **v0.7.0-v0.9.0**: Gateway integration testing and deployment refinements
- ✅ **v0.10.0**: Tag binding UI and property binding editor
- ✅ **v0.11.0**: Monaco script editor integration
- ✅ **v0.12.0**: Script and Named Query browsers
- ✅ **v0.13.0-v0.17.0**: Progressive enhancements (multi-select, resize, grid, alignment)
- ✅ **v0.18.0**: Redesigned sidebar with vertical icon tabs, session cookie fix

### 🚧 Phase 7: Real Gateway Integration (v0.19.0-v0.21.0) - NEXT

- ⏳ **v0.19.0**: Real tag provider integration (TagManager API)
- ⏳ **v0.20.0**: Real script management (ScriptManager API)
- ⏳ **v0.21.0**: Real named query integration

### 📋 Phase 8: MVP Release (v1.0.0) - GOAL

- Security audit by third party
- Performance optimization and testing
- Complete documentation
- Production-ready build
- Deployment automation

See [ROADMAP.md](ROADMAP.md) and [VERSION.md](VERSION.md) for detailed roadmap.

## Contributing

This project follows structured development practices:

1. **Read workflow documents** in `.claude/` directory
2. **Follow security checklist** for all API changes
3. **Update documentation** alongside code changes
4. **Run tests** before committing
5. **Increment version** appropriately in VERSION.md
6. **Update CHANGELOG** with changes

For development workflow, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

For AI-assisted development, see [.claude/CLAUDE.md](.claude/CLAUDE.md).

## Troubleshooting

### "No projects found" Error

**Cause**: Session cookies not being sent with API requests.

**Solution**: Frontend already includes `withCredentials: true` in axios configuration (fixed in v0.18.0).

### Module Doesn't Load in Gateway

**Check**:
1. Gateway logs: `/path/to/ignition/logs/wrapper.log`
2. Module signature: Use `./gradlew signModule` to re-sign
3. Java version: Must be JDK 17+
4. Gateway version: Must be 8.3.0+

### 401 Unauthorized Errors

**Cause**: Not logged into Gateway or session expired.

**Solution**:
1. Login at `http://gateway:8088/web/home`
2. Then access Web Designer
3. Ensure user has Designer role

See [ACCESS_INSTRUCTIONS.md](ACCESS_INSTRUCTIONS.md) for complete troubleshooting guide.

## Support

### Issues & Questions

- Check documentation in `docs/` directory
- Review [CHANGELOG.md](CHANGELOG.md) for recent changes
- See [VERSION.md](VERSION.md) for current status and roadmap
- Check [ACCESS_INSTRUCTIONS.md](ACCESS_INSTRUCTIONS.md) for access issues

### Bug Reports

When reporting bugs, include:
- Module version (from Gateway Module Commissioning page)
- Ignition Gateway version
- Browser and version
- Steps to reproduce
- Gateway logs (if available)

## License

[To Be Determined]

---

**Version**: 0.18.0 (Redesigned Sidebar & Session Fix)
**Last Updated**: 2025-11-07
**Status**: Alpha - Active Development
**Module Size**: ~200KB (.modl file)
**Frontend Size**: webpack 316KB (webdesigner.js), 317KB (standalone.js)
**Backend Status**: ✅ API framework complete, session authentication working
**Next Milestone**: v0.19.0 - Real Tag Provider Integration

Built with Claude Code following structured development workflow.

**Quick Links**:
- 📘 [User Guide](docs/USER_GUIDE.md)
- 🔧 [Developer Guide](docs/DEVELOPMENT.md)
- 🔒 [Security Documentation](docs/SECURITY.md)
- 📡 [API Reference](docs/API.md)
- 🗺️ [Roadmap](ROADMAP.md)
- 📝 [Changelog](CHANGELOG.md)
