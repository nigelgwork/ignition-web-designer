# Frontend Architecture - React SPA

**Technology:** React 18, TypeScript 5, Webpack 5
**State Management:** Zustand 4.5
**Deployment:** Bundled with module, served at `/data/webdesigner/*`

---

## Overview

The frontend is a single-page application providing a web-based Perspective Designer interface with:
- Three-panel layout (resources | canvas | properties)
- Component palette with drag-and-drop
- Property editor with inline editing
- Undo/redo with 50-state history
- Tag/script/query browsers

## Application Structure

```
frontend/src/
├── components/
│   ├── WebDesigner.tsx       # Main app container
│   ├── Canvas.tsx             # View editing surface
│   ├── PropertyEditor.tsx     # Property inspector
│   ├── ComponentPalette.tsx   # Component toolbox
│   ├── ProjectTree.tsx        # Project/view browser
│   ├── TagBrowser.tsx         # Tag provider browser
│   ├── ScriptBrowser.tsx      # Script tree browser
│   ├── NamedQueryBrowser.tsx  # Query browser
│   ├── BindingEditor.tsx      # Property binding modal
│   ├── MenuBar.tsx            # Top menu bar
│   └── Sidebar.tsx            # Icon tab sidebar
├── store/
│   └── designerStore.ts       # Zustand state management
├── api/
│   └── client.ts              # Axios API client
├── styles/
│   ├── WebDesigner.css
│   ├── Canvas.css
│   └── [component].css
└── types/
    └── index.ts               # TypeScript definitions
```

---

## Core Components

### 1. WebDesigner (Main Container)
**File:** `WebDesigner.tsx`

**Layout:**
```
┌─────────────────────────────────────────────┐
│  MenuBar (File/Edit/View/Tools/Help)       │
├──────────┬─────────────────────────┬────────┤
│          │                         │        │
│ Sidebar  │        Canvas           │ Prop   │
│ (Icons)  │    (View Editor)        │ Editor │
│          │                         │        │
│ Projects │                         │        │
│ Comps    │                         │        │
│ Tags     │                         │        │
│ Scripts  │                         │        │
│ Queries  │                         │        │
└──────────┴─────────────────────────┴────────┘
```

**Responsibilities:**
- Manage panel layout
- Route tab selection
- Handle global keyboard shortcuts
- Load initial data

### 2. Canvas (View Editor)
**File:** `Canvas.tsx`

**Features:**
- Recursive component rendering
- Click-to-select components
- Drag-and-drop zone for palette
- Visual selection highlighting
- Undo/Redo buttons
- Save button with modification indicator
- Grid overlay (20px) with snap-to-grid
- Multi-select (Ctrl+Click)
- Resize handles (8 directions)

**Keyboard Shortcuts:**
- Ctrl+S: Save
- Ctrl+Z: Undo
- Ctrl+Y: Redo
- Ctrl+C/X/V: Copy/Cut/Paste
- Ctrl+D: Duplicate
- Delete: Delete component

### 3. PropertyEditor
**File:** `PropertyEditor.tsx`

**Features:**
- Display selected component properties
- Click-to-edit inline editing
- Type-aware property parsing (JSON, boolean, number, string)
- Binding button (⚙️) next to each property
- Binding indicator (🔗) for bound properties
- Save/Cancel with Enter/Escape
- Drag-and-drop zone for tags

**Type Parsing:**
```typescript
function parsePropertyValue(value: string): any {
  if (value.startsWith('{') || value.startsWith('[')) {
    return JSON.parse(value); // Object or array
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(Number(value))) return Number(value);
  return value; // String fallback
}
```

### 4. ComponentPalette
**File:** `ComponentPalette.tsx`

**Features:**
- Categorized component list (Layout, Input, Display, etc.)
- Collapsible categories
- HTML5 drag API integration
- 11 common Perspective components:
  - Layout: Container, Coordinate Container, Column Container
  - Input: Text Field, Button, Dropdown, Checkbox
  - Display: Label, Image, Power Chart, Table

### 5. Sidebar (Icon Tabs)
**File:** `Sidebar.tsx`

**Tabs:**
- 📁 Projects (ProjectTree)
- 🧩 Components (ComponentPalette)
- 🏷️ Tags (TagBrowser)
- 📜 Scripts (ScriptBrowser)
- 🔍 Queries (NamedQueryBrowser)

### 6. BindingEditor (Modal)
**File:** `BindingEditor.tsx`

**Binding Types:**
1. Tag Binding (Direct/Indirect/Expression)
2. Property Binding (Component references)
3. Expression Binding (JavaScript expressions)
4. Expression Structure (Complex objects)
5. Query Binding (Named queries)

**Transforms:**
- Map Transform (value mapping)
- Format Transform (date/number formatting)
- Script Transform (Python/Jython)

---

## State Management (Zustand)

### Store Structure
```typescript
interface DesignerState {
  // View State
  viewContent: ViewContent | null;
  selectedComponent: string | null;
  viewModified: boolean;
  savingView: boolean;

  // History (Undo/Redo)
  history: ViewContent[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  loadView: (projectName: string, viewPath: string) => Promise<void>;
  saveView: () => Promise<void>;
  selectComponent: (path: string) => void;
  updateComponentProperty: (path: string, propName: string, value: any) => void;
  addComponent: (parentPath: string, componentType: string) => void;
  deleteComponent: (path: string) => void;
  undo: () => void;
  redo: () => void;
  setBinding: (path: string, propName: string, binding: Binding) => void;
}
```

### History Management

**Push to History:**
```typescript
function pushToHistory(newContent: ViewContent) {
  // Discard future states (branching)
  const newHistory = history.slice(0, historyIndex + 1);

  // Append new state
  newHistory.push(JSON.parse(JSON.stringify(newContent))); // Deep clone

  // Limit to 50 states
  if (newHistory.length > 50) {
    newHistory.shift();
  }

  set({
    history: newHistory,
    historyIndex: newHistory.length - 1,
    canUndo: true,
    canRedo: false,
    viewModified: true
  });
}
```

**Undo:**
```typescript
function undo() {
  if (historyIndex <= 0) return;

  const newIndex = historyIndex - 1;
  set({
    viewContent: history[newIndex],
    historyIndex: newIndex,
    canUndo: newIndex > 0,
    canRedo: true,
    viewModified: newIndex !== 0
  });
}
```

---

## API Communication

### Axios Client
```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/data/webdesigner/api/v1',
  withCredentials: true, // IMPORTANT: Preserve session cookies
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### Example API Calls
```typescript
// Load view
const response = await apiClient.get(
  `/projects/${projectName}/view`,
  { params: { path: viewPath } }
);
const etag = response.headers['etag'];

// Save view
await apiClient.put(
  `/projects/${projectName}/view`,
  { content: viewContent },
  {
    params: { path: viewPath },
    headers: { 'If-Match': etag }
  }
);
```

---

## Drag-and-Drop Implementation

### From ComponentPalette
```typescript
function handleDragStart(e: DragEvent, componentType: string) {
  e.dataTransfer.setData('componentType', componentType);
}
```

### To Canvas
```typescript
function handleDrop(e: DragEvent, parentPath: string) {
  e.preventDefault();
  const componentType = e.dataTransfer.getData('componentType');
  addComponent(parentPath, componentType);
}
```

### From TagBrowser
```typescript
function handleTagDrag(e: DragEvent, tagPath: string) {
  e.dataTransfer.setData('tagPath', tagPath);
}
```

### To PropertyEditor
```typescript
function handlePropertyDrop(e: DragEvent, componentPath: string, propName: string) {
  e.preventDefault();
  const tagPath = e.dataTransfer.getData('tagPath');
  setBinding(componentPath, propName, {
    type: 'tag',
    config: { path: tagPath }
  });
}
```

---

## TypeScript Definitions

```typescript
interface ViewContent {
  root: {
    type: string;
    props: Record<string, any>;
    meta?: { name: string };
    children?: Component[];
  };
}

interface Component {
  type: string;
  props: Record<string, any>;
  meta?: { name: string };
  children?: Component[];
}

interface Binding {
  type: 'tag' | 'property' | 'expression' | 'expressionStructure' | 'query';
  config: any;
  transforms?: Transform[];
  bidirectional?: boolean;
}

interface Transform {
  type: 'map' | 'format' | 'script';
  config: any;
}
```

---

## Build Configuration

### Webpack Config (webpack.config.js)
```javascript
module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/data/webdesigner/'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  devServer: {
    port: 3000,
    proxy: {
      '/data/webdesigner/api': 'http://localhost:8088' // Gateway proxy
    }
  }
};
```

---

## Dependencies

**Production:**
- react (^18.2.0)
- react-dom (^18.2.0)
- zustand (^4.5.0)
- axios (^1.6.0)
- rc-tree (^5.8.0)
- @monaco-editor/react (^4.6.0)
- react-rnd (^10.4.1)

**Development:**
- typescript (^5.3.0)
- webpack (^5.89.0)
- ts-loader (^9.5.1)
- eslint + prettier

---

## Related Documentation

- **[OVERVIEW.md](./OVERVIEW.md)** - System overview
- **[BACKEND.md](./BACKEND.md)** - Backend architecture
- **[DATA_FLOW.md](./DATA_FLOW.md)** - Data flow details
- **[../USER_GUIDE.md](../USER_GUIDE.md)** - End-user documentation

---

**Last Updated:** 2025-11-07
**Document Version:** 1.0
