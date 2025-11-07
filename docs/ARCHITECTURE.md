# Architecture Documentation

**Project:** Web-Based Ignition Perspective Designer
**Version:** 0.20.0
**Last Updated:** 2025-11-07

---

## Overview

The architecture documentation has been split into focused documents for easier navigation and maintenance. The original monolithic documentation (26KB) has been archived.

**Original Document:** [archive/planning/ARCHITECTURE_v0.6.0.md](archive/planning/ARCHITECTURE_v0.6.0.md)

---

## Architecture Documents

### 📋 [OVERVIEW](architecture/OVERVIEW.md)
**Purpose:** High-level system architecture and design patterns

**Contents:**
- System overview and purpose
- High-level architecture diagram
- Component overview (Backend & Frontend)
- Core architecture patterns
- Technology stack summary
- Key design decisions (ADRs)
- Deployment model
- Performance targets
- Scalability considerations

**Audience:** Architects, new developers, stakeholders

---

### 🖥️ [BACKEND](architecture/BACKEND.md)
**Purpose:** Java Gateway module architecture

**Contents:**
- Module structure and components
- GatewayHook lifecycle management
- WebDesignerServlet routing
- API handlers (Project, Tag, Script, Component)
- Security implementation (Authentication, Authorization, Audit)
- Optimistic concurrency with ETags
- Static file serving
- Dependencies and build configuration
- Error handling
- Testing strategy

**Audience:** Backend developers, Java developers

---

### 🎨 [FRONTEND](architecture/FRONTEND.md)
**Purpose:** React SPA architecture

**Contents:**
- Application structure
- Core components (Canvas, PropertyEditor, ComponentPalette, etc.)
- Zustand state management
- History management (Undo/Redo)
- API communication with axios
- Drag-and-drop implementation
- TypeScript definitions
- Build configuration (Webpack)
- Dependencies

**Audience:** Frontend developers, React developers

---

### 🔄 [DATA_FLOW](architecture/DATA_FLOW.md)
**Purpose:** Data models and flow diagrams

**Contents:**
- Frontend and backend data models
- Detailed flow diagrams:
  - Load View Flow
  - Edit Property Flow
  - Add Component Flow
  - Undo/Redo Flow
  - Save View Flow
  - Tag Binding Flow
- Data persistence strategy
- Backup and recovery

**Audience:** All developers, system integrators

---

### 🔒 [SECURITY](SECURITY.md)
**Purpose:** Security architecture and requirements

**Contents:**
- Authentication and authorization flows
- Input validation requirements
- Audit logging specification
- Concurrency control
- Security measures and checklist
- Threat model
- Security testing

**Audience:** Security team, all developers

**Note:** This document was enhanced with architecture-specific security details during refactoring.

---

## Quick Reference

### For New Developers
**Start here:**
1. [OVERVIEW](architecture/OVERVIEW.md) - Understand the system
2. [DATA_FLOW](architecture/DATA_FLOW.md) - See how it works
3. [BACKEND](architecture/BACKEND.md) or [FRONTEND](architecture/FRONTEND.md) - Deep dive your area

### For Feature Development
1. Check [DATA_FLOW](architecture/DATA_FLOW.md) for existing patterns
2. Review [BACKEND](architecture/BACKEND.md) or [FRONTEND](architecture/FRONTEND.md) for implementation details
3. Ensure [SECURITY](SECURITY.md) requirements are met

### For Code Review
1. Verify adherence to patterns in [OVERVIEW](architecture/OVERVIEW.md)
2. Check security requirements in [SECURITY](SECURITY.md)
3. Validate data flow against [DATA_FLOW](architecture/DATA_FLOW.md)

---

## Related Documentation

- **[REQUIREMENTS.md](REQUIREMENTS.md)** - Functional and technical requirements
- **[API.md](API.md)** - REST API specification
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development setup and guidelines
- **[USER_GUIDE.md](USER_GUIDE.md)** - End-user documentation
- **[DEPLOYMENT.md](../DEPLOYMENT.md)** - Deployment instructions

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-07 | Split monolithic ARCHITECTURE.md into focused documents |
| 0.6.0 | 2025-11-02 | Last version of monolithic architecture doc (archived) |

---

**Maintainer:** Development Team
**Review Schedule:** After major releases or architectural changes
