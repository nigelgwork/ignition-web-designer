# README.md Refactoring Recommendations

**Date:** 2025-11-07
**Current Size:** 20KB
**Status:** Needs refactoring (not critical)

---

## Current Issues

1. **Too Long**: 20KB is too large for a README
2. **Too Detailed**: Includes detailed build instructions better suited for DEVELOPMENT.md
3. **Mixed Audiences**: Tries to serve end users, developers, and operators

---

## Recommended Structure

### Keep in README.md (Target: 3-4 pages max)

**Essential sections:**
- Project title and badges
- Brief overview (2-3 sentences)
- Key features list (bullet points)
- Quick start (5 steps max)
- Links to detailed documentation
- License and contributing info

**Example structure:**
```markdown
# Web-Based Ignition Perspective Designer

> Browser-based designer for Ignition Perspective views

[Badges: version, build status, etc.]

## Overview
Web-based interface for editing Perspective views without native Designer client.

## Features
- ✅ Browse projects and views
- ✅ Edit view.json files
- ✅ Drag-and-drop components
- [... keep it concise]

## Quick Start
1. Install module (.modl) in Gateway
2. Access at https://gateway:8043/data/webdesigner/
3. Log in with Designer role
4. Select project and view
5. Start editing

## Documentation
- [User Guide](docs/USER_GUIDE.md) - How to use
- [Development](docs/DEVELOPMENT.md) - How to develop
- [Architecture](docs/ARCHITECTURE.md) - System design
- [API](docs/API.md) - API reference

## Requirements
- Ignition Gateway 8.3.0+
- Designer role or webdesigner.edit permission

## Contributing
See [DEVELOPMENT.md](docs/DEVELOPMENT.md)

## License
[License info]
```

### Move to Other Documents

**To DEVELOPMENT.md:**
- Detailed build instructions (Gradle, npm commands)
- Development environment setup
- Testing instructions
- Module signing process
- Troubleshooting

**To DEPLOYMENT.md (consolidate):**
- Installation instructions
- Gateway configuration
- Certificate setup
- Production deployment
- Monitoring setup

**To docs/README.md (already exists):**
- Documentation index
- How to find information

---

## Priority

**Level:** Low-Medium
**Why not urgent:**
- README is functional, just verbose
- Documentation index (docs/README.md) now provides navigation
- Other refactoring was higher priority

**When to do:**
- Before v1.0 release
- When onboarding new contributors
- If users report confusion

---

## Implementation Steps

1. Create backup of current README.md
2. Extract build instructions → DEVELOPMENT.md
3. Extract deployment details → DEPLOYMENT.md
4. Rewrite README.md to be concise (3-4 pages)
5. Add prominent links to detailed docs
6. Test all cross-references
7. Get feedback from team

---

## Estimated Effort

- **Time:** 2-3 hours
- **Risk:** Low (mostly moving content)
- **Value:** Medium (improved first impression)

---

**Status:** Documented for future implementation
**Assigned:** Unassigned
**Target:** Before v1.0
