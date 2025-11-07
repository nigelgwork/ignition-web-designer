# Ignition Perspective Designer UI/UX Research Report

**Project:** Web-Based Ignition Perspective Designer
**Date:** 2025-11-07
**Purpose:** Comprehensive analysis of official Perspective Designer UI to guide web replication
**Status:** Research Complete - Ready for Implementation Planning

---

## Executive Summary

The Ignition Perspective Designer is a sophisticated IDE-like environment with a flexible docking system, comprehensive component editing tools, and multiple specialized panels. This report documents the official UI/UX patterns, features, and workflows to ensure our web-based version achieves feature parity with the desktop Designer.

**Key Findings:**
- Perspective Designer uses a flexible panel docking system (docked/floating/pinned/hidden states)
- Default configuration includes 4 primary panels: Component Palette, Property Editor, Project Browser, and Tag Browser
- Multiple specialized editors: Styles, Scripts, Named Queries, Session Properties
- Comprehensive keyboard shortcuts for editing operations
- Advanced canvas tools: alignment guides, snap-to-grid, z-order management, multi-select
- Property binding system with 5+ binding types and transform options
- Container-based layout system (Coordinate, Flex, Column, Tab, Breakpoint)

---

## 1. UI Layout and Panel System

### 1.1 Overall Structure

The Perspective Designer Interface features a **central workspace** surrounded by **dockable panels** with flexible arrangement options.

**Default Panel Configuration:**
```
┌────────────────────────────────────────────────────────┐
│  Menu Bar (File, Edit, View, Component, Tools)        │
├────────────────────────────────────────────────────────┤
│  Toolbar (Save, Undo/Redo, Copy/Paste, Z-order, etc.) │
├──────────┬─────────────────────────────────┬──────────┤
│          │                                 │          │
│ Project  │        Canvas / Workspace       │ Component│
│ Browser  │     (View Editor/Designer)      │ Palette  │
│          │                                 │          │
│──────────│                                 │──────────│
│          │                                 │          │
│   Tag    │                                 │ Property │
│  Browser │                                 │  Editor  │
│          │                                 │          │
└──────────┴─────────────────────────────────┴──────────┘
│              Status Bar / Panel Chooser                │
└────────────────────────────────────────────────────────┘
```

### 1.2 Panel Docking System

**Panel States:**
- **Docked:** Visible around the workspace perimeter (default)
- **Floating:** Positioned anywhere on desktop, outside Designer window
- **Pinned:** Minimized to sidebar tab, appears on hover (auto-hide)
- **Hidden:** Not visible, can be re-enabled via View > Panels menu

**Panel Behaviors:**
- Drag title bar to rearrange panels
- Panels snap into docking positions with highlighted borders
- Each workspace remembers its layout configuration
- Reset to defaults via View > Reset Panels or Panel Chooser icon (lower left)
- Preferences stored in `%USER_HOME%/.ignition/*.layout`

**Panel Management:**
- View > Panels submenu shows/hides individual panels
- Panel Chooser icon (lower left corner) provides quick panel access
- Toolbars can be rearranged by dragging textured edges

---

## 2. Major Features and Panels

### 2.1 Default Panels

#### **Project Browser**
- **Purpose:** View project hierarchy and Designer Spaces
- **Location:** Left side (default)
- **Features:**
  - Tree view of all project resources
  - Named Queries have dedicated workspace with sub-tree
  - Styles folder (with Advanced Stylesheet in 8.1.22+)
  - Perspective Views organized in folder tree
  - Right-click context menu: Copy, Paste, Delete, Documentation
  - Badge icons indicate:
    - Bindings configured
    - Custom methods
    - Deep selection
    - Event actions
    - Message handlers
    - Scripts
    - Security permissions
  - **Configuration Explorer (8.1.22+):** View dynamic configuration of views/components
  - **Recently Modified Views:** Shows recent edits with timestamps and authors

#### **Tag Browser**
- **Purpose:** Browse and manage tags from Designer and OPC servers
- **Location:** Left side, below Project Browser (default)
- **Features:**
  - Tree view of tag providers
  - Browse tag hierarchy
  - Create new tags
  - Edit existing tags
  - Import/export tags
  - Real-time tag values visible
  - Drag tags to properties for binding

#### **Component Palette**
- **Purpose:** Toolbox of draggable Perspective components
- **Location:** Right side, upper panel (default)
- **Features:**
  - Components grouped by category (Container, Display, Input, Chart, etc.)
  - Collapsible category sections
  - **Search functionality:**
    - Filter components by name
    - Case-sensitive option
    - Wildcard support
    - Regular expression support
  - Drag-and-drop to canvas
  - Auto-hide option (defaults to auto-hide)
  - Enable via "Perspective Components" button if hidden

**Component Categories:**
- Container (Coordinate, Flex, Column, Tab, Breakpoint)
- Display (Label, Image, Icon, etc.)
- Input (Text Field, Button, Dropdown, Checkbox, etc.)
- Chart (Power Chart, XY Chart, etc.)
- Embedded View
- Drawing Tools (Pipe, Line, etc.)
- Custom Components (third-party)

#### **Property Editor**
- **Purpose:** Configure selected component properties
- **Location:** Right side, lower panel (default)
- **Features:**
  - Contextual properties based on selected component
  - Organized into collapsible categories:
    - **Props:** Component configuration and runtime data
    - **Position:** Location properties (depends on parent container)
    - **Custom:** User-created properties
    - **Meta:** Module-defined properties (name, visibility)
    - **Params:** View parameters (input/output/in-out) - Views only
    - **Styles:** CSS-based styling properties
  - **Property Types:**
    - Value (Primitive): Boolean (blue), Numeric (orange), String (green)
    - Object: Multiple key-value pairs (curly braces icon)
    - Array: Ordered list (square brackets icon)
    - Dataset: Special binding result format (grid editor)
    - Date: Calendar picker (YYYY-MM-dd HH:mm:ss format)
    - Color: Color picker popup
  - **Binding Icons:** Create bindings for properties
  - **Warning Indicators:** Configuration issues highlighted
  - **Access Control Badges:** Public/Protected/Private indicators
  - **Persistence Indicators:** Persistent vs Transient (non-saved) properties
  - **Right-click menu:** Copy, Paste, Duplicate property values
  - **Add Custom Property:** Create Value, Object, or Array properties

### 2.2 Specialized Editors and Panels

#### **Styles Editor**
- **Access:** Click Styles icon next to style property in Property Editor
- **Features:**
  - Collapsible menus for style categories:
    - Text (font family, size, weight, color)
    - Background
    - Margin and Padding
    - Border
    - Shape
    - Misc
  - Delete applied styles
  - Undo recent changes
  - CSS unit support (px, pt, em, rem, %, etc.)
  - Default unit: pixels
- **Related Resources:**
  - **Style Classes:** Reusable named style groups (in Project Browser > Styles)
  - **Themes:** Gateway-level CSS themes (variables.css)
  - **Advanced Stylesheet (8.1.22+):** Custom CSS file (stylesheet.css)
    - Enable via right-click on Styles folder > Enable Advanced Stylesheet
    - Write custom CSS (no autocomplete)
    - Uses `.psc-` prefix for style classes
    - Loaded between Theme and Style Classes in cascade

#### **Script Editor**
- **Access:**
  - Component > Event and Script Configuration menu
  - Right-click component > Scripting > Event Handlers
  - View > Session Event Scripts
  - Project Scripts (in Project Browser)
- **Scripting Contexts:**
  1. **Component Event Handlers:** Mouse clicks, key presses, property changes
  2. **Session Event Scripts:** Session startup, shutdown, etc.
  3. **Extension Functions:** Override component behavior (receives `self`)
  4. **Transform Scripts:** In property bindings (modify binding output)
  5. **Project Scripts:** Reusable functions (callable from anywhere)
- **Features:**
  - Python (Jython) syntax
  - Event object available in handlers (contains `source` property)
  - Gateway-scoped execution (no client-side functions)
  - Access to `system.*` functions (e.g., `system.util.getLogger()`)
  - **Not available:** `system.file`, `system.gui`, `system.nav` (client-only)
  - Script Editor tab for custom code
  - Script Builders for common patterns
- **Related Tools:**
  - **Script Console:** Live Python terminal (Tools > Script Console)
    - Multiline Buffer + Interactive Interpreter
    - Cannot interact with window components
    - Can call Project and Shared scripts
  - **Output Console:** Debug print statements from Designer scripts

#### **Named Query Editor**
- **Access:** Project Browser > Named Queries workspace
- **Location:** Dedicated Designer Space with own panel layout
- **Features:**
  - **Welcome Tab:**
    - Select query template:
      - Select Query
      - Update Query
      - Custom Query
    - Recently Modified Queries list (with dates/users)
    - Double-click to open existing query
  - **Query Editor:**
    - SQL syntax highlighting
    - Parameter configuration
    - Testing/preview capability
    - Security settings (Security Zones, User Roles)
  - **Usage:**
    - Property Bindings (Query Binding type)
    - Reports (Named Query Data Sources)
    - Scripts (`system.db.runNamedQuery()` function)
  - **Execution:** Always runs on Gateway (never client)
  - **Storage Location (8.1.6+):**
    `%installDir%\data\projects\PROJECTNAME\ignition\named-query\QUERYNAME`

#### **Session Properties Editor**
- **Access:** Page Configuration dialog (Settings icon in Designer)
- **Purpose:** Configure session-level properties
- **Features:**
  - **Built-in Properties:** Standard session metadata (runtime location, user info, etc.)
  - **Custom Properties:** User-created session variables
  - **Property Types:** Value, Object, Array
  - **Access in Bindings:** Reference via `session.props.customProp`
  - **Parameter Passing:** Used to pass data between views
  - **Page Configuration:**
    - Five regions: Top/Bottom/Left/Right Docks + Primary View
    - Configure docked views per region
    - Set corner priority for overlapping docks
    - Theme selection (active theme)

---

## 3. Canvas and View Editor Features

### 3.1 Component Manipulation

#### **Selection**
- **Single Select:** Click component
- **Multi-Select:** Ctrl+Click or drag selection box (in Coordinate containers)
- **Selected State:** Highlighted border with resize handles

#### **Drag and Drop**
- **From Palette:** Drag component to canvas or existing container
- **On Canvas:** Drag to reposition (depends on container type)
- **Coordinate Container:** X/Y positioning with pixel precision
- **Flex/Column Container:** Reorder within sequence

#### **Resize**
- **Handles:** Appear on selected components
- **Keyboard:** Shift + Arrow keys to nudge edges
- **Multi-Resize:** Resize multiple selected components together

#### **Copy/Paste/Duplicate**
- **Copy:** Ctrl+C / Command+C (copies component as JSON)
- **Paste:** Ctrl+V / Command+V
- **Duplicate:** Ctrl+D / Command+D
- **Immediate Paste (Vision only):** Ctrl+I / Command+I
- **Property Copy/Paste:** Right-click in Property Editor
- **Limitations:** Bindings don't copy when duplicating in Property Editor

#### **Delete**
- **Keyboard:** Delete key
- **Context Menu:** Right-click > Delete

### 3.2 Alignment and Layout Tools

#### **Alignment Tools** (Toolbar)
Available for Coordinate Container components only:
- Align Top
- Align Bottom
- Align Left
- Align Right
- Align as Row
- Align as Stack
- **Normalize Variants:** Adjust sizes to match first-selected component

**Keyboard Shortcuts (Vision, may not all apply to Perspective):**
- Align Top: Alt+T / Option+T
- Align Bottom: Alt+B / Option+B
- Align Vertically: Alt+V / Option+V
- Align Horizontally: Alt+H / Option+H

#### **Guides and Rulers**
- **Horizontal Ruler:** Top of canvas
- **Vertical Ruler:** Left side of canvas
- **Create Guides:**
  - **Vertical:** Click on top ruler (number displays in ruler)
  - **Horizontal:** Click on left ruler (number displays in ruler)
  - Red line appears across workspace showing pixel position
  - Multiple guides supported
- **Remove Guides:** Drag guide back to ruler

#### **Alignment Guides (Auto)**
- **Edge Alignment:** Dashed red line when component edges align
- **Center Alignment:** Dashed red line for center alignment (vertical/horizontal)
- **Distance Indicators:** Solid red line shows pixel distance between components
- **Trigger:** Appears automatically when dragging components near alignment points

#### **Snap Behavior**
- Snap-to-grid option (context-dependent)
- Alignment guide snapping
- Grid display (Drawing Tool, may vary by container)

### 3.3 Z-Order Management

**Purpose:** Control stacking order of overlapping components

**Access:**
- **Toolbar:** Four z-order icons
- **Right-click Menu:** Z-order options
- **Keyboard (Vision, may not apply to Perspective):**
  - Move Forward: PgUp / Fn+↑
  - Move Backward: PgDn / Fn+↓
  - Move to Front: Home / Fn+←
  - Move to Back: End / Fn+→

**Actions:**
- Bring to Front
- Send to Back
- Move Forward (one layer)
- Move Backward (one layer)

**Special Notes:**
- Pipe Tool components always on bottom z-layer in Coordinate containers

---

## 4. Property Binding System

### 4.1 Binding Types

Perspective supports multiple binding types for creating dynamic property values:

#### **1. Tag Bindings**
- **Direct Tag Binding:** Bind to explicit tag path (e.g., `[default]PLC1/temp`)
- **Indirect Tag Binding:** Use parameters to build tag path dynamically
- **Tag Expression Binding:** Use expression language to specify tag path
- **Bidirectional:** Enable write-back to tag (checkbox option)
- **Mode:** Read, Write, or Bidirectional

#### **2. Property Bindings**
- Bind one component property to another
- Updates pushed when source property changes
- **Bidirectional:** Checkbox option for two-way binding

#### **3. Expression Bindings**
- Use expression language to calculate value
- Can reference:
  - Other properties
  - Tag values
  - Python script results
  - Query results
- Powerful dynamic data source

#### **4. Expression Structure Bindings**
- Create complex objects from multiple expressions
- Each expression provides one key-value pair
- Output is object rather than single value
- Useful for script transform parameters

#### **5. Query Bindings**
- Execute Named Queries
- Requires existing Named Query (cannot type query inline)
- Pass parameters to query
- Returns dataset result

### 4.2 Binding Transforms

Transforms modify binding output before applying to property:

#### **Map Transform**
- Map input values to output values
- Example: `true` → "Enabled", `false` → "Disabled"
- Define key-value mappings

#### **Format Transform**
- Format numbers and dates
- Select type (datetime, number, etc.)
- Choose format pattern
- Example: Unix timestamp → "2025-11-07 10:30:00"

#### **Script Transform**
- Apply Python script to binding value
- Receives binding result as input
- Returns transformed value
- Full access to Jython environment

### 4.3 Binding UI Elements

- **Binding Icon:** Appears next to bindable properties
- **Click to Configure:** Opens binding dialog
- **Binding Indicator:** Visual badge when binding is active
- **Remove Binding:** Clear/delete option in dialog
- **Transform Chain:** Multiple transforms can be applied in sequence

---

## 5. Keyboard Shortcuts

### 5.1 File Operations
| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Save | Ctrl+S | Command+S |
| Open | Ctrl+O | Command+O |

### 5.2 Editing
| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Undo | Ctrl+Z | Command+Z |
| Redo | Ctrl+Y | Command+Y |
| Find/Replace | Ctrl+F | Command+F |
| Copy | Ctrl+C | Command+C |
| Cut | Ctrl+X | Command+X |
| Paste | Ctrl+V | Command+V |
| Duplicate | Ctrl+D | Command+D |
| Delete | Delete | Delete |

### 5.3 Component Manipulation (Vision - may not all apply to Perspective)
| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Group | Alt+G | Option+G |
| Ungroup | Alt+U | Option+U |
| Move Forward | PgUp | Fn+↑ |
| Move Backward | PgDn | Fn+↓ |
| Move to Front | Home | Fn+← |
| Move to Back | End | Fn+→ |

### 5.4 Alignment (Vision - may not all apply to Perspective)
| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Align Top | Alt+T | Option+T |
| Align Bottom | Alt+B | Option+B |
| Align Vertically | Alt+V | Option+V |
| Align Horizontally | Alt+H | Option+H |
| Layout Constraints | Ctrl+L | Command+L |
| Size & Position | Ctrl+P | Command+P |

### 5.5 Navigation
| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Preview Mode | F5 | Fn+F5 |
| Launch Client (Windowed) | F10 | Fn+F10 |
| Launch Full Screen | F11 | Fn+F11 |
| Help/Manual | F1 | Fn+F1 |
| Rename | F2 | Fn+F2 |

### 5.6 Known Issues
- **Undo Button:** Reported issue where moving components and pressing undo may skip that action
- **Property Editor Shortcuts:** Feature request for keyboard shortcuts in Property Editor

---

## 6. Container Types and Layout System

Perspective uses container-based layouts with different positioning strategies:

### 6.1 Coordinate Container
- **Default container** when creating new view
- **Positioning:** X/Y coordinates with explicit width/height
- **Alignment Tools:** Full support for alignment toolbar
- **Drag Behavior:** Free positioning anywhere in container
- **Resize:** Direct manipulation with handles
- **Use Case:** Pixel-perfect layouts, fixed-size screens

### 6.2 Flex Container
- **Most versatile container** in Perspective
- **Positioning:** Sequential placement with flex rules
- **Direction:**
  - Row: Left to right
  - Column: Top to bottom (default)
- **Position Properties (per child):**
  - **Basis:** Space component wants (%, px)
  - **Grow:** Expand to fill available space (0 or 1)
  - **Shrink:** Reduce size when constrained (0 or 1)
- **Alignment:** Justify content, align items properties
- **Use Case:** Responsive layouts, dynamic component sizing

### 6.3 Column Container
- **12-column grid system** (similar to Bootstrap)
- **Responsive:** Up to three layouts for different viewport widths
- **Breakpoints:** Configure layouts for small/medium/large screens
- **Column Mapping:** Assign components to columns per breakpoint
- **Use Case:** Responsive web design, mobile-friendly layouts

### 6.4 Tab Container
- **Tabbed interface** with multiple panels
- **Tabs:** Configured as array of views
- **Switching:** User clicks tabs to switch content
- **Use Case:** Organize related content in tabs

### 6.5 Breakpoint Container
- **Viewport-based content switching**
- **Breakpoints:** Define width thresholds
- **Different Views:** Load different views per breakpoint
- **Use Case:** Mobile vs desktop views, adaptive layouts

---

## 7. Menu Structure

### 7.1 Main Menus

#### **File Menu**
- New
- Open
- Save
- Save All
- Save As
- Close
- Recent Projects
- Exit

#### **Edit Menu**
- Undo
- Redo
- Cut
- Copy
- Paste
- Duplicate
- Delete
- Find/Replace

#### **View Menu**
- Panels (submenu - show/hide individual panels)
- Toolbars (submenu - show/hide toolbars)
- Reset Panels
- Preview Mode

#### **Component Menu**
- Event and Script Configuration
- Add Component
- Configure Component
- (Context-dependent options)

#### **Tools Menu**
- Launch Session (open in browser)
- Developer Tools (debug views)
- Console
- Image Management
- Script Console
- Database Query Browser
- Translation Manager
- Launch Project

#### **Project Menu**
- Comm Off
- Comm Read-Only
- Comm Read/Write
- Preview Mode
- Project Properties

### 7.2 Toolbar Sections

**Perspective Toolbar includes:**
- Save button
- Merge Gateway Changes
- Undo button
- Redo button
- Cut button
- Copy button
- Paste button
- Z-order buttons (4 buttons)
- Preview/Design mode toggle
- Zoom controls
- Component Selection Tool
- Pipe Drawing/Moving Tools (8.1.10+)

---

## 8. Communication Modes

Three modes control Designer-to-Gateway interaction:

### **Comm Off**
- Blocks all database and tag operations
- Design-only mode
- No live data

### **Comm Read-Only**
- Tag subscriptions enabled
- SELECT queries allowed
- No write operations

### **Comm Read/Write**
- Full write capabilities
- Tag writes enabled
- Database writes enabled
- Default mode for development

**Access:** Project Menu or Main Toolbar toggle

---

## 9. Preview Mode

**Purpose:** Test views interactively before deployment

**Features:**
- Components become interactive
- Buttons execute scripts
- Text fields update tags
- Simulates client behavior
- No editing allowed in preview mode

**Access:**
- F5 key
- Preview button in toolbar
- Project > Preview Mode menu

---

## 10. Configuration Explorer (8.1.22+)

**Purpose:** View dynamic configuration of all views and components

**Features:**
- See computed property values
- View resolved bindings
- Inspect component hierarchy
- Debug configuration issues

**Access:** Badge in Project Browser

---

## 11. Gap Analysis: Current vs Target

### 11.1 What We Have (v0.6.0)

**UI Layout:**
- ✅ Three-panel layout (left sidebar, center canvas, right sidebar)
- ✅ ProjectTree (basic)
- ✅ TagTree (not implemented yet)
- ✅ Canvas with component rendering
- ✅ PropertyEditor (basic)
- ✅ ComponentPalette (static, 11 components)

**Features:**
- ✅ Component selection (single)
- ✅ Property editing (inline, type-aware parsing)
- ✅ Drag-and-drop from palette
- ✅ Component deletion
- ✅ Undo/Redo (50-state history)
- ✅ Keyboard shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Y)
- ✅ Save view to backend
- ✅ Dark mode theming

**Missing:**
- ❌ Docking system (floating/pinned panels)
- ❌ Panel show/hide/reset
- ❌ Toolbar with icons
- ❌ Status bar
- ❌ Menu bar
- ❌ Multi-select components
- ❌ Copy/paste/duplicate
- ❌ Alignment tools
- ❌ Guides and rulers
- ❌ Z-order management
- ❌ Property bindings
- ❌ Styles editor
- ❌ Script editor
- ❌ Named Query editor
- ❌ Session properties editor
- ❌ Configuration Explorer
- ❌ Recently Modified Views
- ❌ Page Configuration
- ❌ Preview mode
- ❌ Comm modes
- ❌ Badge icons
- ❌ Container type awareness
- ❌ Component search in palette
- ❌ Dynamic component palette from Gateway

### 11.2 User Feedback

**User stated:** "The layout and functionality doesn't seem to have almost any similarity to the real Ignition designer. The toolsets need to match the existing designer for perspective, scripts and named queries."

**User expectations:**
1. Replicate Perspective Designer UI/UX
2. Match existing toolsets
3. Support scripts
4. Support named queries
5. Feature parity with desktop Designer

---

## 12. Implementation Priority Matrix

Based on user feedback and official Designer features, here's a prioritized implementation roadmap:

### 12.1 CRITICAL (P0) - Must Have for Basic Parity

| Feature | Complexity | User Impact | Implementation Notes |
|---------|------------|-------------|---------------------|
| **Menu Bar** | Low | High | File, Edit, View, Component, Tools menus |
| **Toolbar** | Medium | High | Icons for Save, Undo/Redo, Copy/Paste, Z-order |
| **Property Binding System** | High | Critical | Tag, Property, Expression bindings |
| **Tag Browser (Full)** | Medium | High | Currently missing, needed for tag bindings |
| **Multi-Select Components** | Medium | High | Shift+Click, Ctrl+Click, drag selection |
| **Copy/Paste/Duplicate** | Medium | High | Essential editing operations |
| **Component Search (Palette)** | Low | Medium | Filter by name with case-sensitivity |
| **Styles Property Support** | Medium | High | Currently missing from PropertyEditor |

**Estimated Effort:** 3-4 weeks

### 12.2 HIGH PRIORITY (P1) - Essential for Designer UX

| Feature | Complexity | User Impact | Implementation Notes |
|---------|------------|-------------|---------------------|
| **Alignment Tools** | Medium | High | Toolbar buttons for align top/bottom/left/right/row/stack |
| **Z-Order Management** | Low | Medium | Bring front, send back, move forward/backward |
| **Script Editor (Basic)** | High | Critical | Component events, Monaco editor integration |
| **Named Query Browser** | Medium | High | Read-only initially, full editor later |
| **Guides and Rulers** | Medium | Medium | Visual alignment aids |
| **Alignment Guides (Auto)** | Medium | Medium | Snap behavior, distance indicators |
| **Panel Management** | Medium | Medium | Show/hide panels, basic docking |
| **Property Editor Enhancements** | Medium | High | Props/Position/Custom/Meta/Params categories |
| **Component Badge Icons** | Low | Low | Visual indicators for bindings, scripts, etc. |

**Estimated Effort:** 4-6 weeks

### 12.3 MEDIUM PRIORITY (P2) - Enhanced Functionality

| Feature | Complexity | User Impact | Implementation Notes |
|---------|------------|-------------|---------------------|
| **Styles Editor** | High | Medium | Collapsible style categories, color picker |
| **Session Properties** | Medium | Medium | Custom properties, page configuration |
| **Preview Mode** | High | Medium | Interactive component testing |
| **Container Type Awareness** | Medium | Medium | Different behaviors for Coordinate/Flex/Column |
| **Advanced Docking** | High | Low | Floating/pinned panels, layout persistence |
| **Resize Handles** | Medium | Medium | Visual resize on canvas |
| **Keyboard Shortcuts (Full)** | Low | Medium | All alignment, z-order, navigation shortcuts |
| **Configuration Explorer** | Low | Low | View computed property values |

**Estimated Effort:** 6-8 weeks

### 12.4 LOW PRIORITY (P3) - Nice to Have

| Feature | Complexity | User Impact | Implementation Notes |
|---------|------------|-------------|---------------------|
| **Named Query Editor (Full)** | High | Medium | SQL editing, testing, parameters |
| **Script Editor (Advanced)** | High | Medium | Autocomplete, syntax checking, debugging |
| **Comm Modes** | Low | Low | Off/Read-Only/Read-Write toggle |
| **Translation Manager** | High | Low | Localization support |
| **Database Query Browser** | Medium | Low | Test SQL queries |
| **Image Management** | Low | Low | Browse Gateway images |
| **Drawing Tools** | High | Low | Pipe tool, line tool |
| **Status Bar** | Low | Low | Status messages |
| **Recently Modified Views** | Low | Medium | Quick access to recent edits |
| **Panel Chooser** | Low | Low | Quick panel access icon |

**Estimated Effort:** 8-12 weeks

---

## 13. Technical Recommendations for Web Replication

### 13.1 UI Framework Approach

**Current:** Three fixed panels (left/center/right)

**Recommended:** Upgrade to flexible docking system

**Options:**
1. **react-grid-layout** - Grid-based responsive layout
   - Pros: Mature, widely used, responsive
   - Cons: Grid-based, not true docking

2. **rc-dock** - Full docking system
   - Pros: Floating panels, tabs, minimize/maximize
   - Cons: Larger bundle, more complex

3. **golden-layout** - Professional docking library
   - Pros: Full-featured, supports all panel states
   - Cons: Large bundle, steep learning curve

4. **Custom CSS Grid/Flexbox** - Build custom
   - Pros: Lightweight, tailored to needs
   - Cons: High development effort, reinventing wheel

**Recommendation:** Start with **rc-dock** for desktop-like docking, or **Custom CSS Grid** for simpler responsive approach. Consider panel docking as P2 (not critical MVP).

### 13.2 Menu and Toolbar

**Recommended Libraries:**
- **react-menu** or **headlessui Menu** - Dropdown menus
- **react-icons** - Icon library (FontAwesome, Material Icons)
- Custom toolbar with icon buttons

**Implementation:**
- Menu bar at top
- Toolbar below menu bar
- Context menus on right-click
- Keyboard shortcut hints in menus

### 13.3 Property Binding System

**Architecture:**
```typescript
interface Binding {
  type: 'tag' | 'property' | 'expression' | 'expressionStructure' | 'query'
  config: TagBindingConfig | PropertyBindingConfig | ExpressionBindingConfig | QueryBindingConfig
  transforms?: Transform[]
}

interface Transform {
  type: 'map' | 'format' | 'script'
  config: MapTransformConfig | FormatTransformConfig | ScriptTransformConfig
}
```

**UI Components:**
- Binding icon next to properties (PropertyEditor)
- Binding dialog modal (configure binding type, path, transforms)
- Visual badge when binding active
- Transform chain editor

**Backend Requirements:**
- Tag browse API (already planned)
- Component property schema API (for property binding targets)
- Named Query list API
- Expression validation API (optional, could be client-side)

### 13.4 Script Editor Integration

**Recommended:** @monaco-editor/react (already in plan)

**Features to Implement:**
- Syntax highlighting (Python)
- Basic autocomplete (system.* functions)
- Error highlighting (optional, could be runtime only)
- Multi-line editing
- Save/Cancel actions

**Integration Points:**
- Component Event Handlers (right-click > Scripting)
- Session Event Scripts (dedicated panel/tab)
- Transform Scripts (in binding dialog)
- Project Scripts (dedicated Designer Space)

**Scope for P1:** Basic Monaco integration with component event handlers only

### 13.5 Named Query Support

**P1 Scope:** Read-only named query browser
- GET /api/v1/queries - List all named queries
- GET /api/v1/queries/{name} - Get query definition
- Display in Project Browser tree
- Query Binding type in Property Binding dialog

**P2+ Scope:** Full named query editor
- SQL syntax highlighting (Monaco with SQL language)
- Parameter configuration UI
- Test/Preview query results
- Save query back to Gateway

### 13.6 Styles Editor

**Approach:** Custom React component with collapsible sections

**UI Structure:**
```
Styles Editor Modal/Panel
├── Text
│   ├── Font Family (dropdown)
│   ├── Font Size (number input)
│   ├── Font Weight (dropdown)
│   └── Color (color picker)
├── Background
│   ├── Background Color
│   └── Background Image
├── Margin & Padding
│   ├── Margin (top/right/bottom/left)
│   └── Padding (top/right/bottom/left)
├── Border
│   ├── Border Width
│   ├── Border Color
│   └── Border Radius
└── Shape
    └── (Various shape properties)
```

**Libraries:**
- **react-color** - Color picker
- **react-select** - Font family dropdown
- Custom inputs for numbers with units (px, pt, em, etc.)

### 13.7 Alignment and Layout Tools

**Toolbar Buttons:**
```typescript
const alignmentTools = [
  { id: 'alignTop', icon: AlignTopIcon, action: alignTop },
  { id: 'alignBottom', icon: AlignBottomIcon, action: alignBottom },
  { id: 'alignLeft', icon: AlignLeftIcon, action: alignLeft },
  { id: 'alignRight', icon: AlignRightIcon, action: alignRight },
  { id: 'alignRow', icon: AlignRowIcon, action: alignAsRow },
  { id: 'alignStack', icon: AlignStackIcon, action: alignAsStack },
]
```

**Alignment Guides:**
- Canvas overlay with SVG lines
- Calculate alignment on drag
- Show distance measurements

**Guides/Rulers:**
- SVG rulers on top and left edges
- Click to add guide (vertical/horizontal)
- Drag guide to remove
- Store guides in view state (or local state only)

### 13.8 Multi-Select and Copy/Paste

**Multi-Select Strategy:**
- Track `selectedComponents: string[]` in Zustand store
- Ctrl+Click to add to selection
- Shift+Click for range selection (in tree or canvas)
- Drag selection box on canvas (for Coordinate containers)

**Copy/Paste Strategy:**
```typescript
// Copy to clipboard
const copyComponents = (componentIds: string[]) => {
  const components = componentIds.map(id => getComponentById(id))
  const json = JSON.stringify(components)
  navigator.clipboard.writeText(json)
}

// Paste from clipboard
const pasteComponents = async (parentPath: string) => {
  const json = await navigator.clipboard.readText()
  const components = JSON.parse(json)
  components.forEach(comp => addComponent(parentPath, comp))
}
```

**Duplicate:**
- Shortcut for copy + paste in-place
- Offset position slightly (e.g., +10px x, +10px y)

### 13.9 Container Type Awareness

**Current Issue:** Canvas treats all containers the same

**Solution:** Render different behaviors based on container type

```typescript
interface ContainerRenderer {
  type: 'coordinate' | 'flex' | 'column' | 'tab' | 'breakpoint'
  renderChildren: (children: Component[]) => ReactNode
  onDrop: (item: DragItem, position: any) => void
  supportedOperations: {
    freePositioning: boolean
    alignmentTools: boolean
    resize: boolean
  }
}
```

**Implementation:**
- Detect container type from `component.type`
- Load appropriate renderer
- Enable/disable toolbar buttons based on context
- Show different position properties in PropertyEditor

### 13.10 State Management Enhancements

**Current:** Zustand with simple state

**Additions Needed:**
```typescript
interface DesignerState {
  // Existing
  viewContent: ViewContent | null
  selectedComponent: string | null
  history: ViewContent[]
  historyIndex: number

  // New
  selectedComponents: string[]          // Multi-select
  clipboard: Component[]                // Copy/paste
  showPanels: {                        // Panel visibility
    projectBrowser: boolean
    tagBrowser: boolean
    componentPalette: boolean
    propertyEditor: boolean
    stylesEditor: boolean
    scriptEditor: boolean
  }
  guides: {                            // Canvas guides
    vertical: number[]
    horizontal: number[]
  }
  zoomLevel: number                    // Canvas zoom
  previewMode: boolean                 // Preview vs Design
  commMode: 'off' | 'readonly' | 'readwrite'
}
```

---

## 14. Implementation Roadmap

### Phase 7: Property Bindings and Tag Integration (4 weeks)
**Goals:**
- Implement full Tag Browser
- Add Property Binding system (all 5 types)
- Implement binding UI (dialog, icons, badges)
- Add basic transform support (Map, Format)
- Backend: Tag browsing API

**Success Criteria:**
- User can browse tags
- User can create tag bindings on properties
- User can create property bindings
- User can create expression bindings
- Bindings saved with view

### Phase 8: Script Editor and Named Queries (4 weeks)
**Goals:**
- Integrate Monaco editor
- Add component event handler scripts
- Add Named Query browser (read-only)
- Add Query Binding type
- Backend: Named Query API

**Success Criteria:**
- User can add Python scripts to component events
- Scripts saved with view
- User can browse named queries
- User can bind properties to query results

### Phase 9: Advanced Editing Tools (3 weeks)
**Goals:**
- Multi-select components
- Copy/paste/duplicate
- Alignment tools (toolbar + keyboard shortcuts)
- Z-order management
- Component search in palette

**Success Criteria:**
- User can select multiple components
- User can copy/paste components
- User can align components
- User can reorder components (z-index)
- User can search component palette

### Phase 10: Styles and Layout (4 weeks)
**Goals:**
- Styles editor with all categories
- Style classes support
- Theme selection
- Container type awareness
- PropertyEditor categories (Props/Position/Custom/Meta/Params/Styles)

**Success Criteria:**
- User can edit component styles
- User can apply style classes
- User can switch themes
- Different containers behave differently
- PropertyEditor shows all categories

### Phase 11: UI Polish and Parity (3 weeks)
**Goals:**
- Menu bar
- Toolbar with icons
- Guides and rulers
- Alignment guides (auto)
- Panel show/hide
- Badge icons
- Recently Modified Views

**Success Criteria:**
- UI resembles desktop Designer
- All common operations accessible via menus/toolbar
- Visual alignment aids available
- User can show/hide panels
- User can see which views have bindings/scripts

### Phase 12: Advanced Features (4+ weeks)
**Goals:**
- Preview mode
- Session properties editor
- Page configuration
- Named Query editor (full)
- Script editor (advanced autocomplete)
- Advanced docking system

**Success Criteria:**
- User can preview views interactively
- User can configure session properties
- User can configure pages
- User can edit named queries
- User can write scripts with autocomplete
- User can dock/undock/float panels

---

## 15. Comparison Matrix: Current vs Target

| Feature | Current (v0.6.0) | Target (Desktop Designer) | Gap |
|---------|------------------|---------------------------|-----|
| **Layout** | 3 fixed panels | Flexible docking system | High |
| **Menu Bar** | None | File/Edit/View/Component/Tools | High |
| **Toolbar** | None | Full toolbar with icons | High |
| **Project Browser** | Basic tree | Tree + badges + Recently Modified | Medium |
| **Tag Browser** | Not implemented | Full tree with drag-and-drop | High |
| **Component Palette** | 11 static components | All components + search | Medium |
| **Property Editor** | Basic (Props only) | Props/Position/Custom/Meta/Params/Styles | High |
| **Component Selection** | Single | Multi-select | Medium |
| **Copy/Paste** | Not implemented | Full support | High |
| **Undo/Redo** | ✅ 50-state history | ✅ Similar | None |
| **Drag-and-Drop** | ✅ Palette to canvas | ✅ Similar + on-canvas drag | Low |
| **Property Editing** | ✅ Inline editing | ✅ Similar + binding UI | Medium |
| **Property Bindings** | Not implemented | 5 types + transforms | Critical |
| **Script Editor** | Not implemented | Monaco with events | Critical |
| **Named Queries** | Not implemented | Full editor | High |
| **Styles Editor** | Not implemented | Full collapsible UI | High |
| **Alignment Tools** | Not implemented | Toolbar + shortcuts | Medium |
| **Guides/Rulers** | Not implemented | Visual guides | Low |
| **Z-Order** | Not implemented | 4 operations | Medium |
| **Preview Mode** | Not implemented | Full interactive preview | Medium |
| **Keyboard Shortcuts** | Partial (Save/Undo/Redo) | Full suite | Medium |
| **Container Awareness** | None | Different behaviors per type | Medium |
| **Session Properties** | Not implemented | Full editor | Medium |
| **Save** | ✅ Basic save | ✅ Similar (needs ETag) | Low |
| **Dark Mode** | ✅ Implemented | ✅ Theme system | None |

**Overall Gap:** SIGNIFICANT - Current implementation covers ~25% of desktop Designer features

---

## 16. Risk Assessment

### 16.1 High-Risk Areas

**1. Property Binding System**
- **Risk:** Complex system with many edge cases
- **Mitigation:** Implement incrementally, start with Tag bindings only
- **Effort:** High

**2. Script Editor Integration**
- **Risk:** Monaco bundle size, autocomplete data
- **Mitigation:** Lazy load Monaco, basic autocomplete initially
- **Effort:** High

**3. Container Type Awareness**
- **Risk:** Different containers behave very differently
- **Mitigation:** Start with Coordinate only, add others incrementally
- **Effort:** Medium

**4. Docking System**
- **Risk:** Complex UI, many edge cases
- **Mitigation:** Consider skipping for web version, use responsive panels instead
- **Effort:** High

### 16.2 Low-Risk Areas

**1. Multi-Select**
- **Risk:** Low
- **Effort:** Low-Medium

**2. Copy/Paste**
- **Risk:** Low
- **Effort:** Low

**3. Z-Order**
- **Risk:** Low
- **Effort:** Low

**4. Alignment Tools**
- **Risk:** Low
- **Effort:** Medium

**5. Guides/Rulers**
- **Risk:** Low
- **Effort:** Low-Medium

---

## 17. Recommended Next Steps

### Immediate Actions (This Week)
1. **Review this research** with stakeholders
2. **Prioritize features** based on user needs
3. **Create detailed task breakdown** for Phase 7
4. **Estimate effort** for each phase
5. **Update ARCHITECTURE.md** with Phase 7-12 plans

### Short-Term (Next 2 Weeks)
1. **Implement Tag Browser** (Phase 7 start)
2. **Design Property Binding UI** (wireframes/mockups)
3. **Create Binding data models** (TypeScript interfaces)
4. **Backend: Tag API implementation**

### Medium-Term (Next 4-6 Weeks)
1. **Complete Phase 7** (Property Bindings)
2. **Begin Phase 8** (Script Editor)
3. **User testing** of binding system
4. **Iterate based on feedback**

### Long-Term (Next 3-6 Months)
1. **Complete Phases 7-11** (Core feature parity)
2. **Beta testing** with real users
3. **Performance optimization**
4. **Phase 12** (Advanced features) if needed

---

## 18. Conclusion

The Ignition Perspective Designer is a sophisticated, full-featured IDE for building HMI/SCADA interfaces. Replicating its UI/UX in a web application is ambitious but achievable with a phased approach.

**Key Takeaways:**
1. **Current implementation (v0.6.0) provides a foundation** but lacks most Designer features
2. **Property bindings are CRITICAL** - this is the core of Perspective's power
3. **Script editor is CRITICAL** - users need to write event handlers
4. **UI chrome (menus/toolbars/panels) is HIGH priority** for user familiarity
5. **Advanced features (docking, preview mode, named queries) can come later**

**Success Criteria for "Designer Parity":**
- User can perform all common editing operations (add, delete, copy, paste, align, style)
- User can create property bindings (tag, property, expression)
- User can write component event scripts
- UI resembles desktop Designer (menus, toolbars, panels)
- User doesn't feel "lost" coming from desktop Designer

**Estimated Timeline to Parity:** 16-24 weeks (Phases 7-11)

**Recommended Approach:**
- Focus on **functionality over UI chrome initially** (bindings + scripts = P0)
- Then **add UI chrome for familiarity** (menus/toolbars = P1)
- Finally **polish and advanced features** (docking, preview, etc. = P2+)

---

## 19. Appendix: Additional Resources

### Official Documentation
- [Perspective Designer Interface](https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/perspective/perspective-designer-interface)
- [Working with Perspective Components](https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/perspective/working-with-perspective-components)
- [Perspective Component Properties](https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/perspective/working-with-perspective-components/perspective-component-properties)
- [Bindings in Perspective](https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/perspective/working-with-perspective-components/bindings-in-perspective)
- [Scripting in Perspective](https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/perspective/scripting-in-perspective)
- [Named Queries](https://www.docs.inductiveautomation.com/docs/8.1/platform/sql-in-ignition/named-queries)
- [Styles](https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/perspective/styles)
- [Keyboard Shortcuts](https://www.docs.inductiveautomation.com/docs/8.1/platform/designer/windows-linux-and-mac-keyboard-shortcuts)

### Inductive University Videos
- [The Designer User Interface](https://inductiveuniversity.com/videos/the-designer-user-interface/8.3)
- [Using Named Queries in Perspective](https://inductiveuniversity.com/videos/using-named-queries-in-perspective/8.3)
- [Working With Flex Containers](https://inductiveuniversity.com/video/bip-working-with-flex-containers)

### Community Resources
- [Inductive Automation Forum](https://forum.inductiveautomation.com/)
- [DMC Blog - Perspective Tips](https://www.dmcinfo.com/blog/tags/perspective)
- [Corso Systems - Perspective Resources](https://corsosystems.com/tags/perspective)

---

**Document Version:** 1.0
**Author:** Claude Code (Research Assistant)
**Date:** 2025-11-07
**Status:** Complete - Ready for Review
