import { create } from 'zustand'
import type { Project, View, ViewContent } from '../types'

interface DesignerState {
  // Projects
  projects: Project[]
  selectedProject: string | null

  // Views
  views: View[]
  selectedView: string | null
  viewContent: ViewContent | null
  viewModified: boolean
  savingView: boolean

  // History for undo/redo
  history: ViewContent[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean

  // Selected component(s) in Canvas
  selectedComponentPath: string | null // Primary selection
  selectedComponentProps: Record<string, unknown> | null
  selectedComponentPaths: string[] // Multi-select support

  // Loading states
  loadingProjects: boolean
  loadingViews: boolean
  loadingView: boolean

  // UI State
  leftSidebarVisible: boolean
  rightSidebarVisible: boolean
  canvasZoom: number

  // Clipboard
  clipboard: Record<string, unknown> | null

  // Actions
  setProjects: (projects: Project[]) => void
  setSelectedProject: (projectName: string | null) => void
  setViews: (views: View[]) => void
  setSelectedView: (viewPath: string | null) => void
  setViewContent: (content: ViewContent | null) => void
  setSelectedComponent: (path: string | null, props: Record<string, unknown> | null) => void
  toggleComponentSelection: (path: string, props: Record<string, unknown>) => void
  clearComponentSelection: () => void
  setLoadingProjects: (loading: boolean) => void
  setLoadingViews: (loading: boolean) => void
  setLoadingView: (loading: boolean) => void

  // View modification actions
  updateComponentProperty: (path: string, propertyName: string, value: unknown) => void
  updateComponentLayout: (path: string, layout: { x?: number; y?: number; width?: number; height?: number }) => void
  deleteComponent: (path: string) => void
  addComponent: (parentPath: string, component: Record<string, unknown>) => void
  saveView: () => Promise<boolean>
  setViewModified: (modified: boolean) => void

  // Clipboard actions
  copyComponent: () => void
  cutComponent: () => void
  pasteComponent: () => void
  duplicateComponent: () => void

  // Binding actions
  setBinding: (path: string, propertyName: string, binding: any) => void
  getBinding: (path: string, propertyName: string) => any
  removeBinding: (path: string, propertyName: string) => void

  // Undo/Redo actions
  undo: () => void
  redo: () => void

  // UI actions
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  setCanvasZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  zoomReset: () => void

  // Alignment actions
  alignLeft: () => void
  alignCenter: () => void
  alignRight: () => void
  alignTop: () => void
  alignMiddle: () => void
  alignBottom: () => void
}

export const useDesignerStore = create<DesignerState>((set) => ({
  // Initial state
  projects: [],
  selectedProject: null,
  views: [],
  selectedView: null,
  viewContent: null,
  viewModified: false,
  savingView: false,
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,
  selectedComponentPath: null,
  selectedComponentProps: null,
  selectedComponentPaths: [],
  loadingProjects: false,
  loadingViews: false,
  loadingView: false,
  leftSidebarVisible: true,
  rightSidebarVisible: true,
  canvasZoom: 100,
  clipboard: null,

  // Actions
  setProjects: (projects) => set({ projects }),
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  setViews: (views) => set({ views }),
  setSelectedView: (selectedView) => set({ selectedView, viewModified: false }),
  setViewContent: (viewContent) =>
    set({
      viewContent,
      viewModified: false,
      history: viewContent ? [viewContent] : [],
      historyIndex: viewContent ? 0 : -1,
      canUndo: false,
      canRedo: false,
    }),
  setSelectedComponent: (selectedComponentPath, selectedComponentProps) =>
    set({
      selectedComponentPath,
      selectedComponentProps,
      selectedComponentPaths: selectedComponentPath ? [selectedComponentPath] : []
    }),

  toggleComponentSelection: (path, props) =>
    set((state) => {
      const isSelected = state.selectedComponentPaths.includes(path)

      if (isSelected) {
        // Remove from selection
        const newPaths = state.selectedComponentPaths.filter(p => p !== path)
        return {
          selectedComponentPaths: newPaths,
          selectedComponentPath: newPaths.length > 0 ? newPaths[0] : null,
          selectedComponentProps: newPaths.length > 0 ? props : null
        }
      } else {
        // Add to selection
        const newPaths = [...state.selectedComponentPaths, path]
        return {
          selectedComponentPaths: newPaths,
          selectedComponentPath: path,
          selectedComponentProps: props
        }
      }
    }),

  clearComponentSelection: () =>
    set({
      selectedComponentPath: null,
      selectedComponentProps: null,
      selectedComponentPaths: []
    }),

  setLoadingProjects: (loadingProjects) => set({ loadingProjects }),
  setLoadingViews: (loadingViews) => set({ loadingViews }),
  setLoadingView: (loadingView) => set({ loadingView }),

  // View modification actions
  setViewModified: (viewModified) => set({ viewModified }),

  updateComponentProperty: (path, propertyName, value) =>
    set((state) => {
      if (!state.viewContent) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))
      const component = getComponentByPath(newContent.content.root, path)

      if (component) {
        component[propertyName] = value
      }

      return {
        viewContent: newContent,
        viewModified: true,
        selectedComponentProps: component ? { ...component } : state.selectedComponentProps,
        ...pushToHistory(state, newContent),
      }
    }),

  updateComponentLayout: (path, layout) =>
    set((state) => {
      if (!state.viewContent) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))
      const component = getComponentByPath(newContent.content.root, path)

      if (component) {
        // Initialize layout object if it doesn't exist
        if (!component.layout) {
          component.layout = {}
        }

        // Update layout properties
        if (layout.x !== undefined) component.layout.x = Math.round(layout.x)
        if (layout.y !== undefined) component.layout.y = Math.round(layout.y)
        if (layout.width !== undefined) component.layout.width = Math.round(layout.width)
        if (layout.height !== undefined) component.layout.height = Math.round(layout.height)
      }

      return {
        viewContent: newContent,
        viewModified: true,
        ...pushToHistory(state, newContent),
      }
    }),

  deleteComponent: (path) =>
    set((state) => {
      if (!state.viewContent || path === 'root') return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))
      const pathParts = path.split('.')
      const parentPath = pathParts.slice(0, -1).join('.')
      const parent = parentPath
        ? getComponentByPath(newContent.content.root, parentPath)
        : newContent.content

      if (parent && Array.isArray(parent.children)) {
        const indexMatch = pathParts[pathParts.length - 1].match(/children\[(\d+)\]/)
        if (indexMatch) {
          const index = parseInt(indexMatch[1], 10)
          parent.children.splice(index, 1)
        }
      }

      return {
        viewContent: newContent,
        viewModified: true,
        selectedComponentPath: null,
        selectedComponentProps: null,
        ...pushToHistory(state, newContent),
      }
    }),

  addComponent: (parentPath, component) =>
    set((state) => {
      if (!state.viewContent) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))
      const parent = getComponentByPath(newContent.content.root, parentPath)

      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(component)
      }

      return {
        viewContent: newContent,
        viewModified: true,
        ...pushToHistory(state, newContent),
      }
    }),

  saveView: async () => {
    const state = useDesignerStore.getState()
    if (!state.viewContent || !state.selectedProject || !state.selectedView) {
      return false
    }

    set({ savingView: true })

    try {
      const axios = (await import('axios')).default
      await axios.put(
        `/data/webdesigner/api/v1/projects/${encodeURIComponent(state.selectedProject)}/view`,
        {
          content: state.viewContent.content,
        },
        {
          params: { path: state.selectedView },
        }
      )

      set({ viewModified: false, savingView: false })
      return true
    } catch (error) {
      console.error('Failed to save view:', error)
      set({ savingView: false })
      return false
    }
  },

  // Binding actions
  setBinding: (path, propertyName, binding) =>
    set((state) => {
      if (!state.viewContent) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))
      const component = getComponentByPath(newContent.content.root, path)

      if (component) {
        // Store binding in a special 'bindings' property
        if (!component.bindings) {
          component.bindings = {}
        }
        component.bindings[propertyName] = binding
      }

      return {
        viewContent: newContent,
        viewModified: true,
        selectedComponentProps: component ? { ...component } : state.selectedComponentProps,
        ...pushToHistory(state, newContent),
      }
    }),

  getBinding: (path, propertyName) => {
    const state = useDesignerStore.getState()
    if (!state.viewContent) return null

    const component = getComponentByPath(state.viewContent.content.root, path)
    return component?.bindings?.[propertyName] || null
  },

  removeBinding: (path, propertyName) =>
    set((state) => {
      if (!state.viewContent) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))
      const component = getComponentByPath(newContent.content.root, path)

      if (component && component.bindings) {
        delete component.bindings[propertyName]
        // Remove empty bindings object
        if (Object.keys(component.bindings).length === 0) {
          delete component.bindings
        }
      }

      return {
        viewContent: newContent,
        viewModified: true,
        selectedComponentProps: component ? { ...component } : state.selectedComponentProps,
        ...pushToHistory(state, newContent),
      }
    }),

  // Undo/Redo implementation
  undo: () =>
    set((state) => {
      if (state.historyIndex <= 0 || state.history.length === 0) return state

      const newIndex = state.historyIndex - 1
      const previousContent = state.history[newIndex]

      return {
        viewContent: previousContent,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
        viewModified: newIndex !== 0,
      }
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state

      const newIndex = state.historyIndex + 1
      const nextContent = state.history[newIndex]

      return {
        viewContent: nextContent,
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < state.history.length - 1,
        viewModified: newIndex !== 0,
      }
    }),

  // UI actions
  toggleLeftSidebar: () => set((state) => ({ leftSidebarVisible: !state.leftSidebarVisible })),
  toggleRightSidebar: () => set((state) => ({ rightSidebarVisible: !state.rightSidebarVisible })),
  setCanvasZoom: (canvasZoom) => set({ canvasZoom }),
  zoomIn: () => set((state) => ({ canvasZoom: Math.min(state.canvasZoom + 10, 200) })),
  zoomOut: () => set((state) => ({ canvasZoom: Math.max(state.canvasZoom - 10, 25) })),
  zoomReset: () => set({ canvasZoom: 100 }),

  // Alignment actions - align selected components
  alignLeft: () =>
    set((state) => {
      if (!state.viewContent || state.selectedComponentPaths.length < 2) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))

      // Find leftmost x position
      let minX = Infinity
      for (const path of state.selectedComponentPaths) {
        const comp = getComponentByPath(newContent.content.root, path)
        if (comp?.layout?.x !== undefined) {
          minX = Math.min(minX, comp.layout.x)
        }
      }

      if (minX === Infinity) return state

      // Align all to leftmost
      for (const path of state.selectedComponentPaths) {
        const comp = getComponentByPath(newContent.content.root, path)
        if (comp?.layout) {
          comp.layout.x = minX
        }
      }

      return {
        viewContent: newContent,
        viewModified: true,
        ...pushToHistory(state, newContent),
      }
    }),

  alignCenter: () =>
    set((state) => {
      if (!state.viewContent || state.selectedComponentPaths.length < 2) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))

      // Calculate average center X
      let sumCenterX = 0
      let count = 0
      for (const path of state.selectedComponentPaths) {
        const comp = getComponentByPath(newContent.content.root, path)
        if (comp?.layout?.x !== undefined && comp?.layout?.width !== undefined) {
          sumCenterX += comp.layout.x + comp.layout.width / 2
          count++
        }
      }

      if (count === 0) return state
      const centerX = sumCenterX / count

      // Align all to center
      for (const path of state.selectedComponentPaths) {
        const comp = getComponentByPath(newContent.content.root, path)
        if (comp?.layout) {
          comp.layout.x = centerX - (comp.layout.width || 0) / 2
        }
      }

      return {
        viewContent: newContent,
        viewModified: true,
        ...pushToHistory(state, newContent),
      }
    }),

  alignRight: () =>
    set((state) => {
      if (!state.viewContent || state.selectedComponentPaths.length < 2) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))

      // Find rightmost position
      let maxRight = -Infinity
      for (const path of state.selectedComponentPaths) {
        const comp = getComponentByPath(newContent.content.root, path)
        if (comp?.layout?.x !== undefined && comp?.layout?.width !== undefined) {
          maxRight = Math.max(maxRight, comp.layout.x + comp.layout.width)
        }
      }

      if (maxRight === -Infinity) return state

      // Align all to rightmost
      for (const path of state.selectedComponentPaths) {
        const comp = getComponentByPath(newContent.content.root, path)
        if (comp?.layout) {
          comp.layout.x = maxRight - (comp.layout.width || 0)
        }
      }

      return {
        viewContent: newContent,
        viewModified: true,
        ...pushToHistory(state, newContent),
      }
    }),

  alignTop: () =>
    set((state) => {
      if (!state.viewContent || state.selectedComponentPaths.length < 2) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))

      // Find topmost y position
      let minY = Infinity
      for (const path of state.selectedComponentPaths) {
        const comp = getComponentByPath(newContent.content.root, path)
        if (comp?.layout?.y !== undefined) {
          minY = Math.min(minY, comp.layout.y)
        }
      }

      if (minY === Infinity) return state

      // Align all to topmost
      for (const path of state.selectedComponentPaths) {
        const comp = getComponentByPath(newContent.content.root, path)
        if (comp?.layout) {
          comp.layout.y = minY
        }
      }

      return {
        viewContent: newContent,
        viewModified: true,
        ...pushToHistory(state, newContent),
      }
    }),

  alignMiddle: () =>
    set((state) => {
      if (!state.viewContent || state.selectedComponentPaths.length < 2) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))

      // Calculate average center Y
      let sumCenterY = 0
      let count = 0
      for (const path of state.selectedComponentPaths) {
        const comp = getComponentByPath(newContent.content.root, path)
        if (comp?.layout?.y !== undefined && comp?.layout?.height !== undefined) {
          sumCenterY += comp.layout.y + comp.layout.height / 2
          count++
        }
      }

      if (count === 0) return state
      const centerY = sumCenterY / count

      // Align all to middle
      for (const path of state.selectedComponentPaths) {
        const comp = getComponentByPath(newContent.content.root, path)
        if (comp?.layout) {
          comp.layout.y = centerY - (comp.layout.height || 0) / 2
        }
      }

      return {
        viewContent: newContent,
        viewModified: true,
        ...pushToHistory(state, newContent),
      }
    }),

  alignBottom: () =>
    set((state) => {
      if (!state.viewContent || state.selectedComponentPaths.length < 2) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))

      // Find bottommost position
      let maxBottom = -Infinity
      for (const path of state.selectedComponentPaths) {
        const comp = getComponentByPath(newContent.content.root, path)
        if (comp?.layout?.y !== undefined && comp?.layout?.height !== undefined) {
          maxBottom = Math.max(maxBottom, comp.layout.y + comp.layout.height)
        }
      }

      if (maxBottom === -Infinity) return state

      // Align all to bottommost
      for (const path of state.selectedComponentPaths) {
        const comp = getComponentByPath(newContent.content.root, path)
        if (comp?.layout) {
          comp.layout.y = maxBottom - (comp.layout.height || 0)
        }
      }

      return {
        viewContent: newContent,
        viewModified: true,
        ...pushToHistory(state, newContent),
      }
    }),

  // Clipboard actions
  copyComponent: () =>
    set((state) => {
      if (!state.viewContent || !state.selectedComponentPath) return state

      const component = getComponentByPath(state.viewContent.content.root, state.selectedComponentPath)
      if (!component) return state

      // Deep clone the component
      const componentCopy = JSON.parse(JSON.stringify(component))

      return {
        clipboard: componentCopy,
      }
    }),

  cutComponent: () =>
    set((state) => {
      if (!state.viewContent || !state.selectedComponentPath || state.selectedComponentPath === 'root') return state

      const component = getComponentByPath(state.viewContent.content.root, state.selectedComponentPath)
      if (!component) return state

      // Copy to clipboard
      const componentCopy = JSON.parse(JSON.stringify(component))

      // Delete from view
      const newContent = JSON.parse(JSON.stringify(state.viewContent))
      const pathParts = state.selectedComponentPath.split('.')
      const parentPath = pathParts.slice(0, -1).join('.')
      const parent = parentPath
        ? getComponentByPath(newContent.content.root, parentPath)
        : newContent.content

      if (parent && Array.isArray(parent.children)) {
        const indexMatch = pathParts[pathParts.length - 1].match(/children\[(\d+)\]/)
        if (indexMatch) {
          const index = parseInt(indexMatch[1], 10)
          parent.children.splice(index, 1)
        }
      }

      return {
        clipboard: componentCopy,
        viewContent: newContent,
        viewModified: true,
        selectedComponentPath: null,
        selectedComponentProps: null,
        selectedComponentPaths: [],
        ...pushToHistory(state, newContent),
      }
    }),

  pasteComponent: () =>
    set((state) => {
      if (!state.viewContent || !state.clipboard) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))

      // Determine where to paste
      let parentPath = state.selectedComponentPath || 'root'
      let parent = getComponentByPath(newContent.content.root, parentPath)

      // If selected component doesn't have children, paste to its parent
      if (!parent?.children && parentPath !== 'root') {
        const pathParts = parentPath.split('.')
        parentPath = pathParts.slice(0, -1).join('.') || 'root'
        parent = parentPath === 'root' ? newContent.content.root : getComponentByPath(newContent.content.root, parentPath)
      }

      if (!parent) return state

      // Deep clone clipboard component
      const componentCopy = JSON.parse(JSON.stringify(state.clipboard))

      // Offset layout if it exists (so pasted component doesn't sit exactly on top)
      if (componentCopy.layout) {
        componentCopy.layout.x = (componentCopy.layout.x || 0) + 20
        componentCopy.layout.y = (componentCopy.layout.y || 0) + 20
      }

      // Add to parent's children
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(componentCopy)

      return {
        viewContent: newContent,
        viewModified: true,
        ...pushToHistory(state, newContent),
      }
    }),

  duplicateComponent: () =>
    set((state) => {
      if (!state.viewContent || !state.selectedComponentPath || state.selectedComponentPath === 'root') return state

      const component = getComponentByPath(state.viewContent.content.root, state.selectedComponentPath)
      if (!component) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))

      // Find parent
      const pathParts = state.selectedComponentPath.split('.')
      const parentPath = pathParts.slice(0, -1).join('.')
      const parent = parentPath
        ? getComponentByPath(newContent.content.root, parentPath)
        : newContent.content.root

      if (!parent || !Array.isArray(parent.children)) return state

      // Deep clone the component
      const componentCopy = JSON.parse(JSON.stringify(component))

      // Offset layout if it exists
      if (componentCopy.layout) {
        componentCopy.layout.x = (componentCopy.layout.x || 0) + 20
        componentCopy.layout.y = (componentCopy.layout.y || 0) + 20
      }

      // Add copy after the original
      const indexMatch = pathParts[pathParts.length - 1].match(/children\[(\d+)\]/)
      if (indexMatch) {
        const index = parseInt(indexMatch[1], 10)
        parent.children.splice(index + 1, 0, componentCopy)
      }

      return {
        viewContent: newContent,
        viewModified: true,
        ...pushToHistory(state, newContent),
      }
    }),
}))

// Helper function to add to history (called after mutations)
function pushToHistory(state: any, newContent: ViewContent) {
  // Remove any history after current index (for branching)
  const newHistory = state.history.slice(0, state.historyIndex + 1)
  newHistory.push(newContent)

  // Limit history to 50 items
  const limitedHistory = newHistory.slice(-50)

  return {
    history: limitedHistory,
    historyIndex: limitedHistory.length - 1,
    canUndo: true,
    canRedo: false,
  }
}

// Helper function to get component by path
function getComponentByPath(root: any, path: string): any {
  if (path === 'root') return root

  const parts = path.split('.').slice(1) // Remove 'root' prefix
  let current = root

  for (const part of parts) {
    const match = part.match(/children\[(\d+)\]/)
    if (match && current.children) {
      current = current.children[parseInt(match[1], 10)]
    } else {
      current = current[part]
    }

    if (!current) break
  }

  return current
}
