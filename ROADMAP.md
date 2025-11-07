# Web Designer Roadmap

## Current Status: v0.18.0 - Redesigned Sidebar ✅

### Completed Features
- ✅ React SPA with Zustand state management
- ✅ Project/View browsing with rc-tree
- ✅ Canvas with component rendering and selection
- ✅ PropertyEditor with click-to-edit inline editing
- ✅ ComponentPalette with drag-and-drop (11 common components)
- ✅ Drag components from palette to canvas
- ✅ Component deletion with confirmation
- ✅ View saving with optimistic concurrency (ETag)
- ✅ Undo/Redo with command pattern (50 state history)
- ✅ Keyboard shortcuts (Ctrl+Z/Y, Ctrl+C/X/V/D, Ctrl+S, Delete)
- ✅ MenuBar with File/Edit/View/Tools/Help menus
- ✅ Multi-select components (Ctrl+Click)
- ✅ Resize handles (8 directions with snap-to-grid)
- ✅ Alignment tools (Left/Center/Right/Top/Middle/Bottom)
- ✅ Grid overlay (20px) and snap-to-grid
- ✅ Copy/Cut/Paste/Duplicate clipboard operations
- ✅ Vertical icon tab sidebar (Projects/Components/Tags/Scripts/Queries)
- ✅ Session preservation for authentication
- ✅ Dark theme (VS Code inspired)

### Current Limitations
- ⚠️ **No tag binding** - Can't bind component properties to tags
- ⚠️ **Placeholder browsers** - TagBrowser, ScriptBrowser, NamedQueryBrowser show static content
- ⚠️ **Basic property editing** - Only text input, no type-specific editors
- ⚠️ **No binding UI** - Can't create tag bindings, expression bindings, etc.
- ⚠️ **No component tree view** - Hard to select deeply nested components
- ⚠️ **Limited error feedback** - Console logs instead of user-friendly messages

---

## Phase 7: Tag Binding Foundation (HIGHEST PRIORITY)
**Goal**: Enable users to bind component properties to tags

### Why This Is Critical
Without tag binding, users can't create real Perspective views. This is the #1 blocking feature.

### Features
1. **Backend**: Tag browsing API implementation
   - `GET /api/v1/tags` - List tag providers ✅ (exists but needs testing)
   - `GET /api/v1/tags/{provider}` - Browse tag tree hierarchy
   - Return tag metadata (data type, value, quality)

2. **Frontend**: TagBrowser component
   - Replace placeholder with real rc-tree implementation
   - Browse tag providers and folders
   - Display tag data types and current values
   - Search/filter tags by name

3. **Drag-and-Drop Tag Binding**
   - Drag tag from TagBrowser to PropertyEditor field
   - Create binding object: `{ binding: { type: "tag", path: "[default]Motor/Speed" } }`
   - Visual indicator when property accepts bindings
   - Show binding icon/badge on bound properties

4. **Binding Display in PropertyEditor**
   - Show tag path for bound properties (not raw JSON)
   - "Edit Binding" button to modify/remove binding
   - Badge/icon indicating property is bound

### Deliverables
- Functional tag browsing with real tag data
- Drag tag → property to create binding
- Visual feedback for bound properties
- Basic binding editor

### Estimated Complexity: Medium-High
**Time**: 1-2 sessions

---

## Phase 8: Component Tree View
**Goal**: Better component selection and navigation

### Features
1. **Component Tree Panel** (new sidebar tab)
   - Hierarchical tree of all components in current view
   - Click to select component
   - Multi-select with Ctrl+Click
   - Drag-and-drop to reorder components
   - Right-click context menu (Copy/Paste/Delete/Duplicate)

2. **Synchronized Selection**
   - Select in tree → highlights on canvas
   - Select on canvas → highlights in tree
   - Both feed into same Zustand state

3. **Component Icons and Names**
   - Type icons (Label 📝, Button 🔘, Flex 📦, etc.)
   - Editable component names/IDs
   - Indentation for nested components

4. **Visibility Toggle**
   - Eye icon to show/hide components
   - Useful for working on overlapping elements

### Deliverables
- New "Component Tree" tab in left sidebar (6th tab)
- Synchronized selection between tree and canvas
- Visual component hierarchy
- Context menu actions

### Estimated Complexity: Medium
**Time**: 1 session

---

## Phase 9: Property Editor Enhancements
**Goal**: Professional property editing experience

### Features
1. **Type-Specific Editors**
   - **Color**: Color picker with hex/rgba input
   - **Number**: Number spinner with validation
   - **Boolean**: Checkbox toggle
   - **Enum**: Dropdown select
   - **Font**: Font family/size/weight picker
   - **Object**: Nested property expansion
   - **Array**: Add/remove/reorder items

2. **Binding Configuration UI**
   - "Create Binding" button on each property
   - Binding type selector (Tag, Property, Expression, Query)
   - Binding editor dialog:
     - Tag: Browse and select tag
     - Expression: Script editor with Monaco
     - Property: Component property selector
     - Query: Named query selector with parameters
   - "Remove Binding" button
   - Binding preview/current value display

3. **Property Validation**
   - Type checking (number must be numeric, etc.)
   - Range validation (min/max)
   - Required field indicators
   - Error messages below inputs

4. **Property Grouping**
   - Group properties by category (Style, Data, Behavior, etc.)
   - Collapsible sections
   - Search/filter properties

5. **Property Documentation**
   - Tooltip on hover showing property description
   - Link to Perspective docs for component type

### Deliverables
- Type-aware property editors
- Binding creation UI
- Validation feedback
- Grouped and searchable properties

### Estimated Complexity: High
**Time**: 2-3 sessions

---

## Phase 10: Script & Named Query Browsers
**Goal**: Complete the missing browsers

### Features
1. **Backend APIs**
   - `GET /api/v1/projects/{name}/scripts` - List project scripts
   - `GET /api/v1/projects/{name}/script?path=...` - Get script content
   - `GET /api/v1/projects/{name}/named-queries` - List named queries
   - `GET /api/v1/projects/{name}/named-query?name=...` - Get query definition

2. **ScriptBrowser Component**
   - Tree view of project scripts
   - Preview script content in read-only Monaco editor
   - Search scripts by name
   - Click to view script (opens in modal/side panel)

3. **NamedQueryBrowser Component**
   - List of named queries
   - Show query name, database, and description
   - Preview query SQL
   - Drag query to component property to create binding

4. **Integration**
   - Use in binding editor for script/query bindings
   - Link to scripts from component events

### Deliverables
- Functional script browsing
- Named query browsing
- Preview/view capabilities
- Integration with binding system

### Estimated Complexity: Medium
**Time**: 1-2 sessions

---

## Phase 11: UX Polish & Visual Feedback
**Goal**: Professional, polished user experience

### Features
1. **Loading States**
   - Skeleton screens for loading content
   - Spinners for API requests
   - Progress indicators for long operations
   - "Loading projects..." / "Loading views..." messages

2. **Error Handling**
   - Toast notifications for errors (react-toastify)
   - Friendly error messages (not console.error)
   - Retry buttons for failed operations
   - Error boundaries to catch React errors

3. **Empty States**
   - "No projects found" with "Create Project" link
   - "No views in project" with help text
   - "No components on canvas" with instructions
   - "Select a component to edit properties" in PropertyEditor

4. **Tooltips**
   - Keyboard shortcuts on menu items
   - Component descriptions in palette
   - Property descriptions in editor
   - Toolbar button explanations

5. **Visual Feedback**
   - Hover effects on all interactive elements
   - Active/selected state indicators
   - Drag preview (ghost component while dragging)
   - Drop zone highlights
   - Smooth transitions and animations

6. **User Confirmation**
   - "Unsaved changes" warning when closing view
   - Delete confirmation with component name
   - Bulk operation confirmations

### Deliverables
- Toast notification system
- Loading states throughout app
- Better error messages
- Tooltips everywhere
- Polished interactions

### Estimated Complexity: Medium
**Time**: 1-2 sessions

---

## Phase 12: Advanced Features
**Goal**: Power user features

### Features
1. **Component Grouping**
   - Group multiple components (Ctrl+G)
   - Ungroup (Ctrl+Shift+G)
   - Move/resize group as unit
   - Nested groups

2. **Component Search**
   - Search components by name/type
   - Quick jump to component
   - Filter canvas by component type

3. **View Templates**
   - Save view as template
   - Create new view from template
   - Template gallery

4. **Zoom Controls**
   - Zoom in/out (Ctrl+Plus/Minus)
   - Fit to screen (Ctrl+0)
   - Zoom percentage display
   - Pan canvas (Space + drag)

5. **Grid Configuration**
   - Adjustable grid size (10px, 20px, 50px)
   - Toggle grid visibility
   - Toggle snap-to-grid
   - Show rulers

6. **Recent Views**
   - Quick access to recently edited views
   - View history in sidebar

7. **Keyboard Shortcut Reference**
   - Help dialog showing all shortcuts
   - Searchable/filterable
   - Printable cheat sheet

### Deliverables
- Component grouping system
- Search functionality
- Templates system
- Advanced canvas controls
- Keyboard shortcut help

### Estimated Complexity: High
**Time**: 2-3 sessions

---

## Phase 13: Testing & Quality
**Goal**: Production-ready stability

### Features
1. **Frontend Tests**
   - Jest unit tests for components
   - React Testing Library for integration tests
   - Vitest for Zustand store tests

2. **Backend Tests**
   - JUnit tests for API handlers
   - Mock ProjectManager/TagManager
   - Test optimistic concurrency

3. **E2E Tests**
   - Playwright or Cypress
   - Critical user flows (create view, edit properties, save)
   - Cross-browser testing

4. **Error Boundaries**
   - Catch and display React errors gracefully
   - Error reporting/logging

5. **Performance**
   - Lazy loading for large views
   - Virtualized lists for large component trees
   - Debounced save operations

### Deliverables
- Test suite with >70% coverage
- E2E tests for critical paths
- Error boundaries
- Performance optimizations

### Estimated Complexity: High
**Time**: 2-3 sessions

---

## Phase 14: Documentation & Onboarding
**Goal**: Easy to learn and use

### Features
1. **User Guide**
   - Getting started tutorial
   - Feature overview with screenshots
   - Video tutorials
   - FAQ

2. **In-App Help**
   - Interactive tutorial/walkthrough
   - Tooltips with "Learn more" links
   - Context-sensitive help

3. **Developer Documentation**
   - API reference
   - Architecture guide
   - Contributing guide
   - Deployment guide

4. **Changelog**
   - User-facing changelog
   - Migration guides for breaking changes

### Deliverables
- Comprehensive user guide
- Developer documentation
- Interactive onboarding
- Maintained changelog

### Estimated Complexity: Medium
**Time**: 1-2 sessions

---

## Long-Term Vision

### Future Considerations
1. **Multi-User Collaboration**
   - WebSocket-based real-time editing
   - Presence indicators (who's editing what)
   - Conflict resolution

2. **Version Control Integration**
   - Git integration for views
   - View diff/compare
   - Rollback to previous versions

3. **Custom Component Support**
   - Register custom components
   - Custom property editors
   - Component SDK

4. **Advanced Bindings**
   - Expression editor with autocomplete
   - Binding debugger
   - Binding performance metrics

5. **View Runtime Preview**
   - Live preview mode (Perspective runtime simulation)
   - Test view with sample data
   - Mobile/tablet preview

6. **Accessibility**
   - WCAG 2.1 AAA compliance
   - Screen reader support
   - Keyboard-only navigation
   - High contrast mode

7. **Export/Import**
   - Export view as JSON
   - Import view from file
   - Copy view between projects

8. **Theme Support**
   - Light/dark mode toggle
   - Custom themes
   - Theme editor

---

## Recommended Next Steps

### Option A: Complete Core Functionality (Recommended)
**Path**: Phase 7 → Phase 8 → Phase 9
**Focus**: Tag binding, component tree, property editor
**Outcome**: Fully functional designer with all core features

### Option B: Quick Wins for Users
**Path**: Phase 11 → Phase 7 → Phase 8
**Focus**: Polish UX first, then add binding
**Outcome**: Polished experience with essential features

### Option C: Feature Parity with Perspective Designer
**Path**: Phase 7 → Phase 9 → Phase 10 → Phase 12
**Focus**: Match Perspective Designer capabilities
**Outcome**: Professional-grade designer

---

## Success Metrics

### Phase 7 Success
- [ ] Users can browse tag providers and tags
- [ ] Users can drag tags to properties
- [ ] Bound properties show tag path (not JSON)
- [ ] Bindings persist when saving view

### Phase 8 Success
- [ ] Component tree shows all view components
- [ ] Selection syncs between tree and canvas
- [ ] Users can navigate complex nested views easily

### Phase 9 Success
- [ ] Color properties use color picker
- [ ] Binding UI creates valid binding objects
- [ ] Property validation prevents invalid inputs
- [ ] Users can create bindings without editing JSON

### Overall Success
- [ ] Users can create a functional Perspective view from scratch
- [ ] Users can bind components to tags
- [ ] Users can edit and save views without errors
- [ ] Users prefer Web Designer over editing JSON manually

---

## Decision Point

**What would you like to focus on next?**

1. **Phase 7 (Tag Binding)** - Highest priority for real-world usage
2. **Phase 8 (Component Tree)** - Better UX for complex views
3. **Phase 11 (Polish)** - Make current features feel professional
4. **Something else?** - Any specific feature you want to prioritize

Let me know, and I'll start implementing!
