import { create } from 'zustand'
import type { Project, View, ViewContent } from '../types'
import { getComponentByPath, pushToHistory } from './utils'

interface ProjectState {
  // Projects
  projects: Project[]
  selectedProject: string | null

  // Views
  views: View[]
  selectedView: string | null
  viewContent: ViewContent | null
  viewModified: boolean
  savingView: boolean

  // Loading states
  loadingProjects: boolean
  loadingViews: boolean
  loadingView: boolean

  // Clipboard
  clipboard: Record<string, unknown> | null

  // Actions
  setProjects: (projects: Project[]) => void
  setSelectedProject: (projectName: string | null) => void
  setViews: (views: View[]) => void
  setSelectedView: (viewPath: string | null) => void
  setViewContent: (content: ViewContent | null) => void
  setLoadingProjects: (loading: boolean) => void
  setLoadingViews: (loading: boolean) => void
  setLoadingView: (loading: boolean) => void
  setViewModified: (modified: boolean) => void

  // View modification actions
  updateComponentProperty: (path: string, propertyName: string, value: unknown) => void
  updateComponentLayout: (path: string, layout: { x?: number; y?: number; width?: number; height?: number }) => void
  deleteComponent: (path: string) => void
  addComponent: (parentPath: string, component: Record<string, unknown>) => void
  saveView: () => Promise<boolean>

  // Clipboard actions
  copyComponent: (selectedPath: string | null) => void
  cutComponent: (selectedPath: string | null) => void
  pasteComponent: (selectedPath: string | null) => void
  duplicateComponent: (selectedPath: string | null) => void

  // Binding actions
  setBinding: (path: string, propertyName: string, binding: any) => void
  getBinding: (path: string, propertyName: string) => any
  removeBinding: (path: string, propertyName: string) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projects: [],
  selectedProject: null,
  views: [],
  selectedView: null,
  viewContent: null,
  viewModified: false,
  savingView: false,
  loadingProjects: false,
  loadingViews: false,
  loadingView: false,
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
    }),
  setLoadingProjects: (loadingProjects) => set({ loadingProjects }),
  setLoadingViews: (loadingViews) => set({ loadingViews }),
  setLoadingView: (loadingView) => set({ loadingView }),
  setViewModified: (viewModified) => set({ viewModified }),

  // View modification actions
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
      }
    }),

  saveView: async () => {
    const state = get()
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
      }
    }),

  getBinding: (path, propertyName) => {
    const state = get()
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
      }
    }),

  // Clipboard actions
  copyComponent: (selectedPath) =>
    set((state) => {
      if (!state.viewContent || !selectedPath) return state

      const component = getComponentByPath(state.viewContent.content.root, selectedPath)
      if (!component) return state

      // Deep clone the component
      const componentCopy = JSON.parse(JSON.stringify(component))

      return {
        clipboard: componentCopy,
      }
    }),

  cutComponent: (selectedPath) =>
    set((state) => {
      if (!state.viewContent || !selectedPath || selectedPath === 'root') return state

      const component = getComponentByPath(state.viewContent.content.root, selectedPath)
      if (!component) return state

      // Copy to clipboard
      const componentCopy = JSON.parse(JSON.stringify(component))

      // Delete from view
      const newContent = JSON.parse(JSON.stringify(state.viewContent))
      const pathParts = selectedPath.split('.')
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
      }
    }),

  pasteComponent: (selectedPath) =>
    set((state) => {
      if (!state.viewContent || !state.clipboard) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))

      // Determine where to paste
      let parentPath = selectedPath || 'root'
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
      }
    }),

  duplicateComponent: (selectedPath) =>
    set((state) => {
      if (!state.viewContent || !selectedPath || selectedPath === 'root') return state

      const component = getComponentByPath(state.viewContent.content.root, selectedPath)
      if (!component) return state

      const newContent = JSON.parse(JSON.stringify(state.viewContent))

      // Find parent
      const pathParts = selectedPath.split('.')
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
      }
    }),
}))
