# Product Roadmap - 2025

**Project:** Web-Based Ignition Perspective Designer
**Current Version:** 0.20.0 (Script Management Endpoints)
**Status:** Active Development

---

## Current Status

**Implemented (as of v0.20.0):**
- ✅ Project and view browsing
- ✅ View loading and saving with optimistic concurrency
- ✅ Component palette with drag-and-drop
- ✅ Property editor with inline editing
- ✅ Undo/Redo with 50-state history
- ✅ Tag browser with Gateway integration
- ✅ Property binding system (5 types + transforms)
- ✅ Script browser with Monaco editor
- ✅ Named query browser
- ✅ Multi-select, copy/paste, alignment tools
- ✅ Grid overlay and snap-to-grid
- ✅ Resize handles
- ✅ Menu bar and sidebar navigation
- ✅ Session authentication
- ✅ Script management API endpoints

**Parity:** ~45% of native Perspective Designer features

---

## Near-Term (Q4 2025)

### v0.21.0 - Real Named Query Integration
**Timeline:** 2-3 weeks

- [ ] Load actual named queries from Gateway
- [ ] Display query parameters and metadata
- [ ] Query binding UI integration
- [ ] Test with live queries

### v0.22.0 - Component Metadata Enhancement
**Timeline:** 2 weeks

- [ ] Dynamic component palette from Gateway
- [ ] Component property schemas
- [ ] Type validation for properties
- [ ] Better property editor UX

### v0.23.0 - View Templates
**Timeline:** 2-3 weeks

- [ ] Create view from template
- [ ] Save view as template
- [ ] Template library
- [ ] Component snippets

---

## Mid-Term (Q1-Q2 2026)

### v1.0.0 - MVP Release
**Timeline:** 3-4 months
**Focus:** Production readiness

**Requirements for 1.0:**
- [ ] All core features complete (view editing, tags, scripts, queries)
- [ ] Security audit passed
- [ ] Performance targets met (60 FPS canvas, <500ms API)
- [ ] Documentation complete
- [ ] E2E tests implemented
- [ ] Deployment guide and best practices
- [ ] Known limitations documented

**Success Criteria:**
- Users can perform 90% of common view editing tasks from browser
- Security requirements met (authentication, audit logging, concurrency)
- No critical bugs
- Performance acceptable for views with 100+ components

### v1.1.0 - Polish & Refinements
**Timeline:** 1-2 months post-1.0

- [ ] Component search/filter
- [ ] Advanced property validation
- [ ] Keyboard shortcut customization
- [ ] User preferences persistence
- [ ] Performance optimizations
- [ ] Additional component simulations

### v1.2.0 - Enhanced Script Editing
**Timeline:** 1-2 months

- [ ] Script autocomplete (system.* functions)
- [ ] Script validation
- [ ] Script debugging support
- [ ] Script templates and snippets

---

## Long-Term (2026+)

### v1.5.0 - Custom Component Support
**Timeline:** Q3 2026

- [ ] Improved custom component handling
- [ ] Component introspection API
- [ ] Third-party component registry
- [ ] Component documentation integration

### v2.0.0 - Real-Time Collaboration
**Timeline:** Q4 2026+

**Major Features:**
- [ ] WebSocket-based multi-user editing
- [ ] User presence indicators
- [ ] Change broadcasting and synchronization
- [ ] Operational Transform or CRDTs for conflict resolution
- [ ] User avatars and cursors
- [ ] Chat/comments system

**Technical Requirements:**
- WebSocket support in Gateway module
- Shared state management
- Conflict resolution algorithm
- Performance optimization for multiple users

### v2.1.0+ - Advanced Features
**Timeline:** 2027+

- [ ] View diff/merge tools
- [ ] Component library management
- [ ] Advanced undo/redo (branching history visualization)
- [ ] AI-assisted design suggestions
- [ ] Mobile-responsive designer interface
- [ ] Offline mode with sync

---

## Feature Parity Roadmap

**Goal:** Match native Perspective Designer functionality

| Feature Category | Current | Target | Priority |
|------------------|---------|--------|----------|
| View Editing | 80% | 100% | High |
| Property Bindings | 90% | 100% | High |
| Tag Integration | 70% | 100% | High |
| Script Editing | 60% | 95% | High |
| Named Queries | 50% | 95% | Medium |
| Styles Editing | 30% | 90% | Medium |
| Container Awareness | 40% | 90% | Medium |
| Preview Mode | 0% | 90% | Low |
| Session Properties | 0% | 90% | Low |
| Page Configuration | 0% | 85% | Low |

---

## Technical Debt & Improvements

### High Priority
- [ ] E2E test suite (before v1.0)
- [ ] Performance profiling and optimization
- [ ] Security penetration testing
- [ ] Documentation audit and updates

### Medium Priority
- [ ] History memory optimization (large views)
- [ ] Canvas rendering optimization (1000+ components)
- [ ] Bundle size reduction
- [ ] Error handling improvements

### Low Priority
- [ ] Auto-save functionality
- [ ] View versioning system
- [ ] Component usage analytics
- [ ] Telemetry and metrics

---

## Success Metrics

### User Adoption
- **Target:** 50+ active users by v1.0
- **Measure:** Monthly active users, views edited per user

### Performance
- **Target:** <500ms API response time, 60 FPS canvas
- **Measure:** Performance monitoring, user reports

### Stability
- **Target:** <5 critical bugs per release
- **Measure:** Bug tracking, user reports

### Satisfaction
- **Target:** 80% user satisfaction
- **Measure:** User surveys, feedback

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Perspective format changes | High | Medium | Version compatibility checks, schema validation |
| Performance issues with large views | Medium | Medium | Lazy rendering, virtualization |
| Security vulnerabilities | High | Low | Regular audits, security scans, penetration testing |
| Browser compatibility | Medium | Low | Target modern browsers, test regularly |
| Gateway API changes | High | Low | Monitor Ignition releases, maintain compatibility layer |

---

## Release Cadence

- **Patch releases (0.x.1):** As needed for bug fixes
- **Minor releases (0.x.0):** Every 2-4 weeks during active development
- **Major releases (x.0.0):** Quarterly or when breaking changes required

---

## Feedback & Priorities

This roadmap is subject to change based on:
- User feedback and feature requests
- Security requirements
- Performance requirements
- Ignition platform changes
- Resource availability

**Priority ranking:**
1. Security and stability
2. Core functionality (view editing)
3. Performance
4. Advanced features
5. Nice-to-have enhancements

---

## Archived Roadmaps

Previous roadmap versions:
- **[archive/planning/ROADMAP_2025-11-07.md](docs/archive/planning/ROADMAP_2025-11-07.md)** - Original detailed roadmap (14KB)

---

**Last Updated:** 2025-11-07
**Next Review:** After v0.21.0 release or major milestone
**Maintained By:** Product Team

---

For detailed version history, see [VERSION.md](VERSION.md) and [CHANGELOG.md](CHANGELOG.md).
