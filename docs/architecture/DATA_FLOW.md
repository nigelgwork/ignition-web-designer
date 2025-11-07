# Data Flow Architecture

**Purpose:** Document how data moves through the Web Designer system
**Focus:** View loading, editing, saving, and state management

---

## Data Models

### Frontend View Model
```typescript
interface ViewContent {
  root: {
    type: string;              // e.g., "ia.container.coord"
    props: Record<string, any | Binding>;
    meta?: { name: string };
    children?: Component[];
  };
}

interface Component {
  type: string;                // e.g., "ia.display.label"
  props: Record<string, any | Binding>;
  meta?: { name: string };
  children?: Component[];
}

interface Binding {
  type: 'tag' | 'property' | 'expression' | 'expressionStructure' | 'query';
  config: TagConfig | PropertyConfig | ExpressionConfig | QueryConfig;
  transforms?: Transform[];
  bidirectional?: boolean;
}
```

### Backend Resource Format
```json
{
  "type": "View",
  "version": 1,
  "props": {
    "defaultSize": {
      "width": 1280,
      "height": 720
    }
  },
  "root": {
    "type": "ia.container.coord",
    "meta": { "name": "root" },
    "props": {},
    "children": [
      {
        "type": "ia.display.label",
        "meta": { "name": "Label_0" },
        "props": {
          "text": "Hello World"
        }
      }
    ]
  }
}
```

---

## Data Flows

### 1. Load View Flow

```
User            Frontend (React)         Backend (Java)         Gateway
 │                   │                         │                   │
 │ Click View        │                         │                   │
 ├──────────────────>│                         │                   │
 │                   │ GET /view?path=...      │                   │
 │                   ├────────────────────────>│                   │
 │                   │                         │ Validate Session  │
 │                   │                         ├──────────────────>│
 │                   │                         │<──────────────────┤
 │                   │                         │ Get Resource      │
 │                   │                         ├──────────────────>│
 │                   │                         │<──────────────────┤
 │                   │                         │ ProjectManager    │
 │                   │                         │                   │
 │                   │ { view.json } + ETag    │                   │
 │                   │<────────────────────────┤                   │
 │                   │ Parse JSON              │                   │
 │                   │ Store in Zustand        │                   │
 │                   │ Push to history         │                   │
 │                   │ Render Canvas           │                   │
 │<──────────────────┤                         │                   │
 │ View Rendered     │                         │                   │
```

**Steps:**
1. User selects view in ProjectTree
2. Frontend calls `GET /api/v1/projects/{name}/view?path={viewPath}`
3. Backend validates session (401 if invalid)
4. Backend checks authorization (403 if forbidden)
5. Backend reads view.json from ProjectManager
6. Backend calculates ETag (SHA-256 or timestamp)
7. Backend returns JSON with ETag header
8. Frontend parses JSON into ViewContent
9. Frontend stores ETag for later save
10. Frontend initializes history: `history = [viewContent]`, `historyIndex = 0`
11. Canvas renders component tree

---

### 2. Edit Property Flow

```
User            Canvas           PropertyEditor        Zustand Store
 │                │                     │                    │
 │ Click Property │                     │                    │
 ├───────────────>│─────────────────────>│                    │
 │                │   Select Property    │                    │
 │                │                      │ Enter Edit Mode    │
 │                │                      │ Show Textarea      │
 │ Type New Value │                      │                    │
 ├────────────────────────────────────────>│                    │
 │ Press Enter    │                      │                    │
 ├────────────────────────────────────────>│                    │
 │                │                      │ Parse Value        │
 │                │                      │ (type-aware)       │
 │                │                      │                    │
 │                │                      │ updateProperty()   │
 │                │                      ├───────────────────>│
 │                │                      │                    │ Deep Clone
 │                │                      │                    │ Update Prop
 │                │                      │                    │ Push History
 │                │                      │<───────────────────┤
 │                │                      │ viewModified=true  │
 │                │   Re-render          │                    │
 │                │<─────────────────────┤                    │
 │ Component      │                      │                    │
 │ Updated        │                      │                    │
```

**Steps:**
1. User clicks property value in PropertyEditor
2. PropertyEditor enters edit mode with textarea
3. User modifies value and presses Enter
4. PropertyEditor performs type-aware parsing
5. Zustand action `updateComponentProperty(path, propName, value)` is called
6. Store creates deep clone of viewContent
7. Store navigates to component via path
8. Store updates property in cloned viewContent
9. Store pushes new state to history (max 50 items)
10. Store sets `viewModified: true`, `canUndo: true`
11. Canvas re-renders affected component

---

### 3. Add Component Flow

```
User            ComponentPalette      Canvas            Zustand Store
 │                     │                 │                    │
 │ Drag Component      │                 │                    │
 ├────────────────────>│                 │                    │
 │                     │ onDragStart     │                    │
 │ Drop on Canvas      │                 │                    │
 ├────────────────────────────────────────>│                    │
 │                     │                 │ onDrop             │
 │                     │                 │ Extract Type       │
 │                     │                 │                    │
 │                     │                 │ addComponent()     │
 │                     │                 ├───────────────────>│
 │                     │                 │                    │ Deep Clone
 │                     │                 │                    │ Navigate Parent
 │                     │                 │                    │ Create Component
 │                     │                 │                    │ Push to children
 │                     │                 │                    │ Push History
 │                     │                 │<───────────────────┤
 │                     │                 │ viewModified=true  │
 │                     │   Re-render     │                    │
 │<────────────────────────────────────────┤                    │
 │ Component Added    │                 │                    │
```

**Steps:**
1. User drags component from ComponentPalette
2. ComponentPalette sets dragData with component type
3. User drops on target in Canvas
4. Canvas calls `handleDrop(parentPath, componentType)`
5. Zustand action `addComponent(parentPath, type)` is called
6. Store creates deep clone of viewContent
7. Store navigates to parent component
8. Store creates new component with generated name
9. Store appends to parent's children array
10. Store pushes new state to history
11. Canvas re-renders with new component

---

### 4. Undo/Redo Flow

```
User            Canvas            Zustand Store
 │                 │                   │
 │ Press Ctrl+Z    │                   │
 ├────────────────>│                   │
 │                 │ undo()            │
 │                 ├──────────────────>│
 │                 │                   │ historyIndex--
 │                 │                   │ Load history[index]
 │                 │                   │ Update flags
 │                 │<──────────────────┤
 │                 │ viewContent updated
 │                 │ Re-render         │
 │<────────────────┤                   │
 │ Previous State  │                   │
```

**Undo Steps:**
1. User presses Ctrl+Z or clicks Undo button
2. Canvas calls `undo()`
3. Store checks `historyIndex > 0`
4. Store decrements historyIndex
5. Store loads `history[historyIndex]`
6. Store updates flags: `canUndo`, `canRedo`, `viewModified`
7. Canvas re-renders with previous state

**Redo Steps (similar):**
1. User presses Ctrl+Y or clicks Redo button
2. Canvas calls `redo()`
3. Store checks `historyIndex < history.length - 1`
4. Store increments historyIndex
5. Store loads `history[historyIndex]`
6. Store updates flags
7. Canvas re-renders with next state

---

### 5. Save View Flow

```
User        Canvas      Zustand Store       Backend         Gateway
 │            │               │                 │               │
 │ Press Ctrl+S│              │                 │               │
 ├───────────>│               │                 │               │
 │            │ saveView()    │                 │               │
 │            ├──────────────>│                 │               │
 │            │               │ Serialize JSON  │               │
 │            │               │                 │               │
 │            │               │ PUT /view       │               │
 │            │               │ + If-Match: ETag│               │
 │            │               ├────────────────>│               │
 │            │               │                 │ Validate Auth │
 │            │               │                 │ Check If-Match│
 │            │               │                 │ Create Backup │
 │            │               │                 │ Write File    │
 │            │               │                 ├──────────────>│
 │            │               │                 │<──────────────┤
 │            │               │                 │ ProjectManager│
 │            │               │                 │ Audit Log     │
 │            │               │ 200 OK + ETag   │               │
 │            │               │<────────────────┤               │
 │            │ viewModified  │                 │               │
 │            │ = false       │                 │               │
 │            │<──────────────┤                 │               │
 │ Save Success│              │                 │               │
 │<───────────┤               │                 │               │
```

**Steps:**
1. User clicks Save or presses Ctrl+S
2. Canvas checks `viewModified` flag
3. Frontend calls Zustand `saveView()`
4. Store serializes viewContent to JSON
5. Store calls `PUT /api/v1/projects/{name}/view?path=...`
   - Includes `If-Match: {ETag}` header
6. Backend validates session and authorization
7. Backend checks If-Match against current file ETag
8. If mismatch, returns 409 Conflict (user must reload)
9. Backend creates timestamped backup in `_backups/`
10. Backend writes view.json via ProjectManager
11. Backend audit logs the operation
12. Backend returns 200 OK with new ETag
13. Frontend sets `viewModified: false`, `savingView: false`
14. History is preserved (undo/redo still work after save)

---

### 6. Tag Binding Flow

```
User        TagBrowser    PropertyEditor      Zustand Store
 │              │                │                   │
 │ Drag Tag     │                │                   │
 ├─────────────>│                │                   │
 │              │ onDragStart    │                   │
 │              │ (set tagPath)  │                   │
 │ Drop on Prop │                │                   │
 ├───────────────────────────────>│                   │
 │              │                │ onDrop            │
 │              │                │ Extract tagPath   │
 │              │                │                   │
 │              │                │ setBinding()      │
 │              │                ├──────────────────>│
 │              │                │                   │ Deep Clone
 │              │                │                   │ Navigate Comp
 │              │                │                   │ Set Binding
 │              │                │                   │ Push History
 │              │                │<──────────────────┤
 │              │                │ Show 🔗 Indicator │
 │              │   Re-render    │                   │
 │<───────────────────────────────┤                   │
 │ Binding      │                │                   │
 │ Created      │                │                   │
```

**Steps:**
1. User drags tag from TagBrowser
2. TagBrowser sets dragData with tag path
3. User drops on property in PropertyEditor
4. PropertyEditor calls `setBinding(componentPath, propName, binding)`
5. Store creates deep clone of viewContent
6. Store navigates to component
7. Store sets property to BindingObject
8. Store pushes new state to history
9. PropertyEditor shows binding indicator (🔗)
10. User must save to persist binding

---

## Data Persistence

### Primary Storage
- **Location**: Gateway filesystem
- **Format**: view.json files in project directories
- **Access**: Via ProjectManager API
- **Concurrency**: Optimistic locking with ETags

### Backup Strategy
- **Location**: `{project}/perspective/views/_backups/`
- **Naming**: `{viewName}_{timestamp}.json`
- **Trigger**: Before every save
- **Retention**: Manual cleanup (or implement scheduled cleanup)

### State Management
- **Ephemeral**: Zustand store (in-memory, browser session)
- **No Caching**: Backend always reads from ProjectManager
- **Session State**: Managed by Ignition Gateway (cookies)

---

## Related Documentation

- **[OVERVIEW.md](./OVERVIEW.md)** - System overview
- **[BACKEND.md](./BACKEND.md)** - Backend implementation details
- **[FRONTEND.md](./FRONTEND.md)** - Frontend implementation details
- **[../API.md](../API.md)** - REST API specification

---

**Last Updated:** 2025-11-07
**Document Version:** 1.0
