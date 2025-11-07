# Phased Implementation Plan: Full Perspective Designer Parity

**Document Version**: 1.0.0
**Date**: 2025-11-07
**Current Version**: v0.9.1 (~25% feature parity)
**Target**: Full Perspective Designer parity
**Estimated Timeline**: 16-24 weeks

---

## Executive Summary

The Web Designer currently provides **basic viewing and editing** of Perspective views with **~25% feature parity** to the desktop Perspective Designer. This document outlines a phased approach to achieve **full feature parity** over 6 major phases.

### Current State (v0.9.1)
✅ Project/View browsing (Perspective-filtered)
✅ Canvas component rendering
✅ Property display and basic editing
✅ Component selection
✅ Save functionality
✅ Undo/Redo (50 states)
✅ Gateway home page launcher

### Critical Gaps
❌ **Property Binding System** (Tag, Property, Expression, Query)
❌ **Tag Browser** with drag-and-drop
❌ **Script Editor** (Monaco integration)
❌ **Menu Bar & Toolbar**
❌ **Multi-select** (Shift+Click, Ctrl+Click)
❌ **Copy/Paste/Duplicate**
❌ **Alignment tools**
❌ **Z-order management**
❌ **Named Query editor**
❌ **Styles editor** with categories
❌ **Docking panel system**

---

## Phase 7: Property Bindings & Tag Browser (4 weeks)

**Goal**: Implement the heart of Perspective - the property binding system

### Features
1. **Tag Browser Panel** (Week 1)
   - Tree view of tag providers and tags
   - Browse tag hierarchy
   - Search/filter tags
   - Drag-and-drop tag to property

2. **Binding Modal Dialog** (Week 2)
   - 5 binding types: Tag (Direct/Indirect/Expression), Property, Expression, Expression Structure, Query
   - 3 transform types: Map, Format, Script
   - Binding indicators (icon/badge on properties)

3. **Tag Bindings** (Week 3)
   - Direct tag binding (drag tag to property)
   - Indirect tag binding (expression-based tag path)
   - Tag expression binding (e.g., `{[default]PLC1/temp} * 1.8 + 32`)
   - Bidirectional bindings

4. **Property & Expression Bindings** (Week 4)
   - Property bindings (reference other component properties)
   - Expression bindings (JavaScript expressions)
   - Expression Structure bindings (complex object bindings)

### Technical Approach
- **Backend API**: `GET /api/v1/tags/{provider}` (already exists, needs completion)
- **Frontend**: New `TagBrowser.tsx` component, `BindingEditor.tsx` modal
- **State**: Extend Zustand with `bindings` map (componentId → propertyPath → binding)
- **UI Library**: Use `react-json-view` for expression structure editor

### Deliverables
- Tag browser panel with tree view
- Binding modal with all 5 types
- Visual binding indicators
- Drag-and-drop tag to property
- Binding persistence in view.json

### Success Criteria
- User can browse tags
- User can drag tag to property and create tag binding
- User can create expression bindings
- Bindings save to view.json correctly

---

## Phase 8: Script Editor & Named Queries (4 weeks)

**Goal**: Enable scripting and database query integration

### Features
1. **Monaco Script Editor** (Week 1-2)
   - Integrate `@monaco-editor/react`
   - Python (Jython) syntax highlighting
   - Code completion for common APIs
   - Component event handlers (onClick, onChange, etc.)

2. **Script Management** (Week 2)
   - Project scripts browser
   - Gateway event scripts editor
   - Transform scripts (for bindings)
   - Script validation

3. **Named Query Browser** (Week 3)
   - Read-only list of named queries in project
   - Query preview (SQL + parameters)
   - Drag-and-drop query to property for query bindings

4. **Query Bindings** (Week 4)
   - Query binding type in binding editor
   - Parameter mapping
   - Polling configuration
   - Query result preview

### Technical Approach
- **Frontend**: `ScriptEditor.tsx` with Monaco, `NamedQueryBrowser.tsx`
- **Backend API**:
  - `GET /api/v1/projects/{name}/scripts`
  - `GET /api/v1/projects/{name}/queries`
  - `PUT /api/v1/projects/{name}/script?path=...`
- **Monaco**: Use `monaco-editor` with Python language mode

### Deliverables
- Monaco editor integration
- Script browser panel
- Component event script editing
- Named query browser (read-only)
- Query binding support

### Success Criteria
- User can edit component event scripts
- Scripts save and syntax highlighting works
- User can browse named queries
- User can create query bindings

---

## Phase 9: Advanced Editing Tools (3 weeks)

**Goal**: Multi-select, copy/paste, alignment tools

### Features
1. **Multi-Select** (Week 1)
   - Shift+Click to add to selection
   - Ctrl+Click to toggle selection
   - Drag selection rectangle
   - Selection box visual indicator

2. **Copy/Paste/Duplicate** (Week 2)
   - Ctrl+C to copy selected components
   - Ctrl+V to paste
   - Ctrl+D to duplicate
   - Cross-view copy/paste (clipboard service)
   - Auto-increment names (Label_1, Label_2)

3. **Alignment Tools** (Week 3)
   - Align Top/Bottom/Left/Right
   - Distribute Horizontally/Vertically
   - Align to Canvas
   - Toolbar buttons + keyboard shortcuts

### Technical Approach
- **State**: Add `selectedComponents: string[]` to Zustand
- **Canvas**: Update click handlers for multi-select logic
- **Clipboard**: Browser Clipboard API or internal clipboard state
- **Alignment**: Calculate bounding boxes and adjust positions

### Deliverables
- Multi-select with Shift/Ctrl
- Drag selection rectangle
- Copy/paste/duplicate functions
- 6 alignment tools in toolbar

### Success Criteria
- User can select multiple components
- User can copy and paste components
- User can align selected components
- Keyboard shortcuts work

---

## Phase 10: Styles & Layout (4 weeks)

**Goal**: Styles editor, container layouts, responsive design

### Features
1. **Styles Editor Panel** (Week 1)
   - Collapsible categories: Text, Background, Margin, Border, Shape
   - Color picker integration
   - CSS property editors
   - Style inheritance visualization

2. **Container Type Support** (Week 2)
   - Coordinate Container (absolute positioning)
   - Flex Container (flexbox layout)
   - Column Container (vertical stacking)
   - Tab Container (tabs)
   - Breakpoint Container (responsive)

3. **Layout Tools** (Week 3)
   - Z-order management (bring front, send back)
   - Layer panel (component hierarchy)
   - Parent/child relationship editor
   - Container-specific property editors

4. **Themes Integration** (Week 4)
   - Theme browser
   - Apply theme to view
   - Theme property overrides
   - Theme style classes

### Technical Approach
- **Frontend**: `StylesEditor.tsx`, color picker from `react-color`
- **Backend**: Styles are stored in view.json (no API changes needed)
- **CSS**: Generate inline styles from style properties
- **Containers**: Container-specific rendering logic in Canvas

### Deliverables
- Styles editor panel with categories
- Color picker for color properties
- Z-order controls
- Container type support

### Success Criteria
- User can edit component styles
- Styles save to view.json
- User can manage z-order
- Different container types render correctly

---

## Phase 11: UI Polish & Parity (3 weeks)

**Goal**: Menu bar, toolbar, guides, rulers - match Designer UI

### Features
1. **Menu Bar** (Week 1)
   - File: Save, Save As, Revert
   - Edit: Undo, Redo, Cut, Copy, Paste, Delete, Select All
   - View: Panels, Zoom, Guides
   - Component: Add, Delete, Duplicate, Group
   - Tools: Options, Preferences

2. **Toolbar** (Week 2)
   - Icon buttons for common actions
   - Save, Undo/Redo, Alignment, Z-order
   - Zoom controls
   - View mode toggle (Design/Preview)

3. **Guides & Rulers** (Week 3)
   - Horizontal/vertical rulers
   - Draggable guides
   - Auto-snap to guides
   - Alignment guides (red lines on drag)

### Technical Approach
- **Menus**: Use `headlessui Menu` or custom dropdown
- **Icons**: `react-icons` library
- **Guides**: SVG overlays on Canvas
- **Rulers**: Fixed div elements with tick marks

### Deliverables
- Full menu bar with all menus
- Toolbar with icon buttons
- Rulers and draggable guides
- Alignment snapping

### Success Criteria
- All menu items functional
- Toolbar matches Designer
- Guides can be created and used
- Auto-snap works

---

## Phase 12: Advanced Features (4+ weeks)

**Goal**: Docking, preview mode, session properties, advanced bindings

### Features
1. **Docking System** (Week 1-2)
   - Flexible panel docking
   - Drag-and-drop panels
   - Float/dock/hide panels
   - Save panel layouts

2. **Preview Mode** (Week 3)
   - Switch to preview mode (no editing)
   - Test bindings with live data
   - Interact with components
   - Debug mode with property inspector

3. **Session Properties** (Week 4)
   - Session properties editor
   - Custom properties
   - Page configuration
   - View parameters

4. **Advanced Bindings** (Ongoing)
   - Bidirectional bindings
   - Binding validation
   - Binding debugger
   - Transform chaining

### Technical Approach
- **Docking**: Consider `rc-dock` library or custom Grid-based docking
- **Preview**: Render view in preview iframe with Perspective runtime simulation
- **Session**: New backend API for session properties
- **Bindings**: Enhanced binding editor with validation

### Deliverables
- Docking panel system
- Preview mode toggle
- Session properties editor
- Advanced binding features

### Success Criteria
- Panels can be docked/undocked
- Preview mode works with live data
- Session properties can be edited
- Bindings are robust and validated

---

## Technical Stack Additions

### New Dependencies (by Phase)

**Phase 7**:
- `react-json-view` - Expression structure editor
- No backend changes (Tag API already exists)

**Phase 8**:
- `@monaco-editor/react` ^4.6.0 - Script editor
- `monaco-editor` ^0.44.0 - Monaco core

**Phase 9**:
- No new dependencies (native browser APIs)

**Phase 10**:
- `react-color` ^2.19.3 - Color picker
- No backend changes (styles in view.json)

**Phase 11**:
- `react-icons` ^4.12.0 - Icon library
- `headlessui` ^1.7.0 - Menu components (optional)

**Phase 12**:
- `rc-dock` ^3.2.0 - Docking system (optional)
- `split.js` ^1.6.5 - Panel resizing (alternative)

---

## Risk Assessment

### High Risk Items
1. **Binding System Complexity** - Most complex feature, core to Perspective
2. **Monaco Integration** - Large dependency, potential bundle size issues
3. **Docking System** - Complex UI/UX, many edge cases
4. **Preview Mode** - Requires Perspective runtime simulation

### Mitigation Strategies
1. **Incremental Implementation** - Build bindings incrementally (tag → property → expression)
2. **Code Splitting** - Lazy-load Monaco only when needed
3. **Simple Docking First** - Start with basic CSS Grid docking before advanced features
4. **Limited Preview** - Start with static preview, add live data later

---

## Success Metrics

### Phase Completion Criteria
- ✅ All features in phase implemented
- ✅ Manual testing passes
- ✅ No regressions in previous phases
- ✅ Documentation updated
- ✅ Version number incremented (v0.10.0, v0.11.0, etc.)

### Overall Success (100% Parity)
- User can perform all common Designer workflows
- Feature set matches desktop Designer
- Performance acceptable (< 2s load, < 100ms interactions)
- User feedback positive
- No critical bugs

---

## Timeline Summary

| Phase | Features | Duration | Cumulative | Parity % |
|-------|----------|----------|------------|----------|
| **Current (v0.9.1)** | Basic editing | - | - | **25%** |
| **Phase 7** | Bindings + Tag Browser | 4 weeks | 4 weeks | **50%** |
| **Phase 8** | Scripts + Named Queries | 4 weeks | 8 weeks | **65%** |
| **Phase 9** | Multi-select + Alignment | 3 weeks | 11 weeks | **75%** |
| **Phase 10** | Styles + Layouts | 4 weeks | 15 weeks | **85%** |
| **Phase 11** | Menus + Toolbar + Guides | 3 weeks | 18 weeks | **95%** |
| **Phase 12** | Docking + Preview + Advanced | 4+ weeks | 22+ weeks | **100%** |

**Total Estimated Time**: 16-24 weeks (4-6 months)

---

## Priority Matrix

### Critical (Must Have for MVP)
1. Property Bindings (Phase 7)
2. Tag Browser (Phase 7)
3. Script Editor (Phase 8)
4. Multi-Select (Phase 9)
5. Copy/Paste (Phase 9)

### High Priority (Should Have)
6. Named Queries (Phase 8)
7. Alignment Tools (Phase 9)
8. Styles Editor (Phase 10)
9. Z-order (Phase 10)
10. Menu Bar (Phase 11)

### Medium Priority (Nice to Have)
11. Toolbar (Phase 11)
12. Guides & Rulers (Phase 11)
13. Container Layouts (Phase 10)
14. Query Bindings (Phase 8)

### Low Priority (Future)
15. Docking System (Phase 12)
16. Preview Mode (Phase 12)
17. Session Properties (Phase 12)
18. Advanced Bindings (Phase 12)

---

## Next Steps (Immediate)

1. **Deploy v0.9.1** - Test Perspective filtering, dedicated page button
2. **Prioritize with user** - Which Phase 7+ features are most urgent?
3. **Start Phase 7** - Begin with Tag Browser or Binding Editor
4. **Set up milestones** - Create GitHub issues/milestones for each phase
5. **Regular checkpoints** - Weekly reviews to adjust priorities

---

## Notes

- **Flexibility**: This plan can be adjusted based on user feedback and priorities
- **Incremental Value**: Each phase delivers working features, not just scaffolding
- **Testing**: Manual testing after each phase, automated tests added incrementally
- **Documentation**: Update ARCHITECTURE.md and USER_GUIDE.md after each phase

---

**Plan Author**: Claude Code
**Document Status**: Draft for Review
**Next Review Date**: After v0.9.1 deployment and user feedback
