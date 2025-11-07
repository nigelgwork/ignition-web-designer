# Perspective Designer UI Research - Summary

**Original Document:** PERSPECTIVE_DESIGNER_UI_RESEARCH.md (45KB, archived 2025-11-07)
**Purpose:** Key findings from comprehensive analysis of official Perspective Designer UI/UX

---

## Key Findings

### 1. Overall Structure
The Ignition Perspective Designer features:
- **Flexible panel docking system** with 4 states: docked, floating, pinned, hidden
- **4 primary panels:** Component Palette, Property Editor, Project Browser, Tag Browser
- **Central canvas workspace** with advanced editing tools
- **Menu bar** (File/Edit/View/Component/Tools) and **toolbar** with icons

### 2. Core Features

#### Property Binding System (CRITICAL)
- **5 binding types:** Tag, Property, Expression, Expression Structure, Query
- **3 transform types:** Map, Format, Script
- Visual binding indicators and dialogs
- Bidirectional binding support

#### Script Editor Integration (CRITICAL)
- **5 scripting contexts:** Component events, session events, extension functions, transform scripts, project scripts
- Python (Jython) syntax with `system.*` functions
- Monaco-style editor with syntax highlighting

#### Container Layout System
- **Coordinate:** X/Y positioning (pixel-perfect)
- **Flex:** Sequential with grow/shrink rules
- **Column:** 12-column grid (responsive)
- **Tab:** Tabbed interface
- **Breakpoint:** Viewport-based switching

### 3. Essential Editing Tools

**Multi-Select Operations:**
- Ctrl+Click, Shift+Click, drag selection
- Copy/paste/duplicate (Ctrl+C/V/D)
- Group operations

**Alignment Tools:**
- Toolbar buttons: Align top/bottom/left/right/row/stack
- Visual alignment guides (auto snap)
- Manual guides/rulers

**Z-Order Management:**
- Bring to front/send to back
- Move forward/backward
- Context menu and keyboard shortcuts

### 4. Property Editor Categories

The Property Editor organizes properties into 6 categories:
1. **Props** - Component configuration and runtime data
2. **Position** - Location properties (container-dependent)
3. **Custom** - User-created properties
4. **Meta** - Module-defined properties (name, visibility)
5. **Params** - View parameters (input/output/in-out)
6. **Styles** - CSS-based styling properties

### 5. Styles System

**Styles Editor:**
- Collapsible categories: Text, Background, Margin/Padding, Border, Shape
- Color picker, font selection, unit support (px, pt, em, rem, %)
- Style Classes (reusable named styles)
- Themes (Gateway-level CSS)
- Advanced Stylesheet (custom CSS)

### 6. Gap Analysis (v0.6.0)

**What We Had:**
- Basic 3-panel layout
- Simple component palette (11 components)
- Basic property editor (Props only)
- Single selection
- Undo/Redo
- Basic save

**What Was Missing:**
- Property bindings (CRITICAL)
- Script editor (CRITICAL)
- Tag browser integration
- Multi-select and copy/paste
- Alignment tools
- Z-order management
- Styles editor
- Menu bar and toolbar
- Named query support
- Container type awareness

**Overall Gap:** ~25% feature coverage

### 7. Implementation Priorities

**P0 (CRITICAL):**
1. Property Binding System (all 5 types)
2. Tag Browser (full implementation)
3. Script Editor (component events)
4. Menu Bar and Toolbar

**P1 (HIGH):**
1. Multi-select, copy/paste, duplicate
2. Alignment tools
3. Z-order management
4. Named Query browser
5. Property Editor enhancements (all 6 categories)

**P2 (MEDIUM):**
1. Styles Editor
2. Container type awareness
3. Preview mode
4. Advanced docking

### 8. Technical Recommendations

**UI Framework:**
- Consider `rc-dock` for docking system or custom CSS Grid
- `@monaco-editor/react` for script editing
- `react-color` for color picker
- `react-icons` for icon library

**State Management:**
- Extend Zustand store for:
  - Multi-select: `selectedComponents: string[]`
  - Clipboard: `clipboard: Component[]`
  - Panel visibility: `showPanels: {...}`
  - Canvas state: guides, zoom, preview mode

**Backend APIs Needed:**
- Tag browsing API
- Component property schema API
- Named Query list/definition API
- Expression validation API (optional)

### 9. Estimated Timeline

**To Desktop Parity (Phases 7-11):** 16-24 weeks
- Phase 7: Property Bindings (4 weeks)
- Phase 8: Script Editor & Named Queries (4 weeks)
- Phase 9: Advanced Editing Tools (3 weeks)
- Phase 10: Styles & Layout (4 weeks)
- Phase 11: UI Polish & Parity (3 weeks)

### 10. Success Criteria

For users to feel "at home" coming from desktop Designer:
1. Can create property bindings (tag, property, expression)
2. Can write component event scripts
3. Can perform common operations (add, delete, copy, paste, align, style)
4. UI resembles desktop Designer (menus, toolbars, panels)
5. Container types behave appropriately

---

## Key Takeaways

1. **Property bindings are the core** of Perspective's power - this is non-negotiable
2. **Script editor is essential** - users need to write event handlers
3. **UI chrome matters** - menus/toolbars/panels create familiarity
4. **Phased approach is critical** - don't try to build everything at once
5. **Container awareness** - different containers have different editing behaviors

---

**For Full Details:** See `/home/user/ignition-web-designer/docs/archive/research/PERSPECTIVE_DESIGNER_UI_RESEARCH.md`

**Related Documents:**
- `/home/user/ignition-web-designer/docs/ARCHITECTURE.md` - System architecture
- `/home/user/ignition-web-designer/docs/USER_GUIDE.md` - User-facing documentation
- `/home/user/ignition-web-designer/ROADMAP.md` - Development roadmap
